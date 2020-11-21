const Fs = require('fs');
const Constants = require('./constants.js');
const Moment = require('moment');
const {sprintf} = require('sprintf-js');
const Path = require('path');
const Axios = require('axios');
const CsvToJson = require('csvtojson');
const Country = require('./country.js');
const MongoDatabase = require('./mongodb.js')


/**
 * Save data from the downloaded csv file inside the data dir to a MongoDB database
 *
 * @author      Zairon Jacobs <zaironjacobs@gmail.com>
 */
class App {

    constructor() {
        this.csvFileName = '';

        this.csvRows = [];
        this.countryObjects = {};

        this.totalDeaths = 0;
        this.totalActive = 0;
        this.totalRecovered = 0;
        this.totalConfirmed = 0;

        this.mongoDatabase = new MongoDatabase();
    }

    async init() {
        console.log('Downloading data...');
        await this.downloadCsvFile();

        console.log('Saving data to database...');
        await this.setRowsData();
        this.createCountryObjects();
        this.populateCountryObjects();
        await this.mongoDatabase.connect();
        await this.saveDataToDb();
        await this.mongoDatabase.close();

        console.log('Finished');
    }

    /**
     * Download any file to the data dir
     */
    async download(url) {
        const pathDataFile = Path.dirname(__filename) + '/' + Constants.DATA_DIR + '/' + this.csvFileName;
        const writer = Fs.createWriteStream(pathDataFile);

        const response = await Axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }

    /**
     * Download the csv file
     */
    async downloadCsvFile() {
        const pathDataDir = Path.dirname(__filename) + '/' + Constants.DATA_DIR;
        if (!Fs.existsSync(pathDataDir)) {
            Fs.mkdirSync(pathDataDir);
        }

        const tries = 90;
        for (let i = 0; i < tries; i++) {
            const date_string = Moment().subtract(i, 'days').format('MM-DD-YYYY');
            this.csvFileName = date_string + '.csv';
            const url = sprintf(Constants.DATA_URL, this.csvFileName);

            try {
                await this.download(url);
                console.log('Download completed: ' + this.csvFileName);
                return;
            } catch {
                const pathFileToDelete = Path.dirname(__filename) + '/' + Constants.DATA_DIR
                    + '/' + this.csvFileName;
                Fs.unlinkSync(pathFileToDelete);
            }
        }
        console.log('Download failed: Unable to find the latest csv file for the last ' + tries + ' days');
    }

    /**
     * Return an array with all country names
     *
     * @return {array}
     */
    getCountryNamesArray() {
        let countryNames = [];
        this.csvRows.forEach(row => {
            countryNames.push(row[Constants.COL_COUNTRY]);
        });
        countryNames.push(Constants.WORLDWIDE);
        return [...new Set(countryNames)];
    }

    /**
     * Create country objects of all countries
     */
    createCountryObjects() {
        const countryNames = this.getCountryNamesArray();
        countryNames.forEach(countryName => {
            const country = new Country();
            country.setName(countryName);
            country.setLastUpdatedBySourceAt(this.getLastUpdatedBySourceTime());
            this.countryObjects[country.getName()] = country;
        });
    }

    /**
     * Retrieve all rows from the csv file inside the data dir
     */
    async setRowsData() {
        const pathDataFile = Path.dirname(__filename) + '/' + Constants.DATA_DIR + '/' + this.csvFileName;
        this.csvRows = await CsvToJson().fromFile(pathDataFile);
    }

    /**
     * Populate all country objects with data retrieved from the csv file
     */
    populateCountryObjects() {
        this.csvRows.forEach(row => {
            const countryName = row[Constants.COL_COUNTRY];

            let deaths = parseInt(row[Constants.COL_DEATHS]);
            if (deaths < 0) {
                deaths = Math.abs(deaths);
            }
            this.totalDeaths += deaths;

            let confirmed = parseInt(row[Constants.COL_CONFIRMED]);
            if (confirmed < 0) {
                confirmed = Math.abs(confirmed);
            }
            this.totalConfirmed += confirmed;

            let active = parseInt(row[Constants.COL_ACTIVE]);
            if (active < 0) {
                active = Math.abs(active);
            }
            this.totalActive += active;

            let recovered = parseInt(row[Constants.COL_RECOVERED]);
            if (recovered < 0) {
                recovered = Math.abs(recovered);
            }
            this.totalRecovered += recovered;

            const country = this.countryObjects[countryName];
            country.incrementDeaths(deaths);
            country.incrementConfirmed(confirmed);
            country.incrementActive(active);
            country.incrementRecovered(recovered);
        });

        const country_worldwide = this.countryObjects[Constants.WORLDWIDE];
        country_worldwide.incrementDeaths(this.totalDeaths);
        country_worldwide.incrementConfirmed(this.totalConfirmed);
        country_worldwide.incrementActive(this.totalActive);
        country_worldwide.incrementRecovered(this.totalRecovered);
    }

    /**
     * Return the last updated time of the data
     */
    getLastUpdatedBySourceTime() {
        const dateString = this.csvRows[0][Constants.COL_LAST_UPDATE];
        return new Date(dateString);
    }

    /**
     * Save each country object to a MongoDB database
     */
    async saveDataToDb() {
        await this.mongoDatabase.dropCollection();
        const values = Object.values(this.countryObjects)
        for (const value of values) {
            await this.mongoDatabase.insert(value);
        }
    }
}

module.exports = App;