const {MongoClient} = require("mongodb");
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
     * Insert data into the collection
     *
     * @param {array} data
     */
    async insert(data) {
        await this.collection.insertOne(data);
    }

    /**
     * Connect to the client
     */
    async connect() {
        try {
            await this.client.connect();
            this.db = await this.client.db(process.env.DATABASE);
            this.collection = await this.db.collection(process.env.COLLECTION);
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
     * Drop the collection from the MongoDB database
     */
    async dropCollection() {
        try {
            await this.collection.drop();
        } catch {
            // ignore
        }
    }
}

module.exports = MongoDatabase;