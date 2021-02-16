const {MongoClient} = require('mongodb');
const mongoOptions = {useUnifiedTopology: true};


/**
 * MongoDB
 *
 * @author      Zairon Jacobs <zaironjacobs@gmail.com>
 */
class MongoDatabase {

    constructor() {
        this.client = new MongoClient(process.env.CONNECTION_STRING, mongoOptions);
    }

    /**
     * Insert data into the country collection
     *
     * @param {array} data
     */
    async insertCountry(data) {
        await this.countryCollection.insertOne(data);
    }

    /**
     * Insert data into the news collection
     *
     * @param {array} data
     */
    async insertNews(data) {
        await this.newsCollection.insertOne(data);
    }

    /**
     * Connect to the client
     */
    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(process.env.DATABASE);
            this.countryCollection = await this.db.collection(process.env.COLLECTION_COUNTRY);
            this.newsCollection = await this.db.collection(process.env.COLLECTION_NEWS);
        } catch {
            console.log('Could not connect to MongoDB database');
        }
    }

    /**
     * Close the client
     */
    async close() {
        await this.client.close();
    }

    /**
     * Drop the country collection from the MongoDB database
     */
    async dropCountryCollection() {
        try {
            await this.countryCollection.drop();
        } catch {
            // ignore
        }
    }

    /**
     * Drop the news collection from the MongoDB database
     */
    async dropNewsCollection() {
        try {
            await this.newsCollection.drop();
        } catch {
            // ignore
        }
    }
}

module.exports = MongoDatabase;
