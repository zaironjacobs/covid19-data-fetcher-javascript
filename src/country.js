/**
 * Country class to store data of a country
 *
 * @author      Zairon Jacobs <zaironjacobs@gmail.com>
 */
class Country {

    constructor() {
        this.name = '';
        this.confirmed = 0;
        this.deaths = 0;
        this.active = 0;
        this.recovered = 0;
        this.last_updated_by_source_at = '';
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    incrementConfirmed(confirmed) {
        this.confirmed += confirmed;
    }

    incrementDeaths(deaths
    ) {
        this.deaths += deaths;
    }

    incrementActive(active) {
        this.active += active;
    }

    incrementRecovered(recovered) {
        this.recovered += recovered;
    }

    setLastUpdatedBySourceAt(lastUpdatedBySourceAt) {
        this.last_updated_by_source_at = lastUpdatedBySourceAt;
    }
}

module.exports = Country;

