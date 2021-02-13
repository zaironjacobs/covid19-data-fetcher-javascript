module.exports = Object.freeze({
    DATA_DIR: 'data',
    DATA_URL: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/%s',
    NEWS_API_URL: 'https://newsapi.org/v2/everything?qInTitle=covid+OR+corona&apiKey=%s&language=en&sortBy=publishedAt&pageSize=%s',

    COL_LAST_UPDATE: 'Last_Update',
    COL_COUNTRY: 'Country_Region',
    COL_DEATHS: 'Deaths',
    COL_CONFIRMED: 'Confirmed',
    COL_ACTIVE: 'Active',
    COL_RECOVERED: 'Recovered',

    WORLDWIDE: 'Worldwide'
});
