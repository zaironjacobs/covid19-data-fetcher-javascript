const Fs = require('fs');
const Constants = require('./constants.js');
const Moment = require('moment');
const {sprintf} = require('sprintf-js');
const Path = require('path');
const Axios = require('axios');
const CsvToJson = require('csvtojson');
const Country = require('./models/country.js');
const News = require('./models/news.js');
const MongoDatabase = require('./mongoDatabase.js');


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
        this.newsObjects = [];

        this.totalDeaths = 0;
        this.totalActive = 0;
        this.totalRecovered = 0;
        this.totalConfirmed = 0;

        this.mongoDatabase = new MongoDatabase();
    }

    /**
     * Main function for initialization
     */
    async init() {
        console.log('Downloading data...');
        await this.downloadCsvFile();
        await this.fetchNews();

        console.log('Saving data to database...');
        await this.setRowsData();
        this.createCountryObjects();
        this.populateCountryObjects();
        await this.mongoDatabase.connect();
        await this.saveNewsDataToDb();
        await this.saveCountryDataToDb();
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
        if (Fs.existsSync(pathDataDir)) {
            try {
                Fs.rmdirSync(pathDataDir, {recursive: true});
            } catch (err) {
                console.error(err);
            }
        }
        Fs.mkdirSync(pathDataDir);

        const tries = 90;
        for (let i = 0; i < tries; i++) {
            const date_string = Moment().subtract(i, 'days').format('MM-DD-YYYY');
            this.csvFileName = date_string + '.csv';
            const url = sprintf(Constants.DATA_URL, this.csvFileName);

            try {
                await this.download(url);
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
        const lastUpdatedBySourceTime = this.getLastUpdatedBySourceTime()
        countryNames.forEach(countryName => {
            const country = new Country();
            country.setName(countryName);
            country.setLastUpdatedBySourceAt(lastUpdatedBySourceTime);
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

        function getCaseCount(row, columnName) {
            let caseValue = parseInt(row[columnName]);
            if (isNaN(caseValue)) {
                caseValue = 0;
            }
            if (caseValue < 0) {
                caseValue = Math.abs(caseValue);
            }
            return caseValue;
        }

        this.csvRows.forEach(row => {
                const countryName = row[Constants.COL_COUNTRY];

                const deaths = getCaseCount(row, [Constants.COL_DEATHS]);
                this.totalDeaths += deaths;

                const confirmed = getCaseCount(row, [Constants.COL_CONFIRMED]);
                this.totalConfirmed += confirmed;

                const active = getCaseCount(row, [Constants.COL_ACTIVE]);
                this.totalActive += active;

                const recovered = getCaseCount(row, [Constants.COL_RECOVERED]);
                this.totalRecovered += recovered;

                const country = this.countryObjects[countryName];
                country.incrementDeaths(deaths);
                country.incrementConfirmed(confirmed);
                country.incrementActive(active);
                country.incrementRecovered(recovered);
            }
        );

        const country_worldwide = this.countryObjects[Constants.WORLDWIDE];
        country_worldwide.incrementDeaths(this.totalDeaths);
        country_worldwide.incrementConfirmed(this.totalConfirmed);
        country_worldwide.incrementActive(this.totalActive);
        country_worldwide.incrementRecovered(this.totalRecovered);
    }

    /**
     * Return the last updated time of the data
     *
     * @return {Date}
     */
    getLastUpdatedBySourceTime() {
        const dateString = this.csvRows[0][Constants.COL_LAST_UPDATE];
        const date_moment = Moment(dateString);
        return new Date(Date.UTC(
            date_moment.year(), date_moment.month(), date_moment.date(),
            date_moment.hours(), date_moment.minute(), date_moment.second()));
    }

    /**
     * Fetch news and save it to an array
     */
    async fetchNews() {
        const url = sprintf(Constants.NEWS_API_URL, process.env.NEWS_API_KEY, process.env.NEWS_PAGE_SIZE);

        let newsObjects = [];

        await Axios.get(url)
            .then(function (response) {
                const articles = response.data['articles'];

                articles.forEach(article => {
                    const newsObj = new News();

                    let title = '';
                    if (article.title !== null) {
                        title = article.title;
                    }
                    newsObj.setTitle(title);

                    let sourceName = '';
                    if (article.source.name !== null) {
                        sourceName = article.source.name;
                    }
                    newsObj.setSourceName(sourceName);

                    let author = '';
                    if (article.author !== null) {
                        author = article.author;
                    }
                    newsObj.setAuthor(author);

                    let description = '';
                    if (article.description !== null) {
                        description = article.description;
                    }
                    newsObj.setDescription(description);

                    let url = '';
                    if (article.url !== null) {
                        url = article.url;
                    }
                    newsObj.setUrl(url);

                    const date_moment = Moment(article.publishedAt);
                    const publishedAt = new Date(Date.UTC(
                        date_moment.year(), date_moment.month(), date_moment.date(),
                        date_moment.hours(), date_moment.minute(), date_moment.second()));
                    newsObj.setPublishedAt(publishedAt);

                    newsObjects.push(newsObj);
                });
            })
            .catch(function (error) {
                console.log('Error: could not fetch news');
            });

        this.newsObjects = newsObjects;
    }

    /**
     * Save each country object to a MongoDB database
     */
    async saveCountryDataToDb() {
        await this.mongoDatabase.dropCountryCollection();
        const values = Object.values(this.countryObjects)
        for (const value of values) {
            await this.mongoDatabase.insertCountry(value);
        }
    }

    /**
     * Save each news object to a MongoDB database
     */
    async saveNewsDataToDb() {
        await this.mongoDatabase.dropNewsCollection();
        const values = this.newsObjects;
        for (const value of values) {
            await this.mongoDatabase.insertNews(value);
        }
    }
}

module.exports = App;
