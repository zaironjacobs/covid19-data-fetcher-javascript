COVID-19 Data Fetcher
=================

* Fetch and save data of each country to a MongoDB database.
* Fetch and save news related to COVID-19 to a MongoDB database.

Source of data: [CSSEGISandData](https://github.com/CSSEGISandData/COVID-19) & [News API](https://newsapi.org/).

An example of a country document:
```javascript
{
    "_id": {
        "$oid": "60250f5b1ae25397d00c706c"
    },
    "name": "Netherlands",
    "confirmed": 1027023,
    "deaths": 14710,
    "active": 998836,
    "recovered": 13477,
    "last_updated_by_source_at": {
        "$date": "2021-02-11T05:23:55.000Z"
    }
}
```

An example of a news document:
```javascript
{
    "_id": {
        "$oid": "60252065ac79b69102f2183c"
    },
    "title": "Coping With COVID Redundancy",
        "source_name": "Mindtools.com",
        "author": "Steven Edwards",
        "description": "If we fail to pivot and transition successfully through...",
        "url": "https://www.mindtools.com/blog/coping-with-covid-redundancy/",
        "published_at": "2021-02-11T12:01:00Z"
}
```

## Dependencies
- [MongoDB](https://www.mongodb.com/)
- [Node.js >= 14](https://nodejs.org)
- [News API Key](https://newsapi.org/)

## Download
```console
$ git clone https://github.com/zaironjacobs/covid19-data-fetcher-javascript
```

## Usage
Copy the file .env.example to .env and fill in the environment variables.
A local connection example:
```
DATABASE=covid19
COLLECTION_COUNTRY=country
COLLECTION_NEWS=news
CONNECTION_STRING=mongodb://localhost:27017
NEWS_API_KEY=1234567890abcdefghijk
NEWS_PAGE_SIZE=5
```

To use:
```console
$ cd covid19-data-fetcher-javascript
$ npm install
$ npm run start
```

## Crontab
At minute 0 and 30:

```
0,30 * * * * cd ~/covid19-data-fetcher-javascript && npm run start
```