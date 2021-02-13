/**
 * News class to store news data
 *
 * @author      Zairon Jacobs <zaironjacobs@gmail.com>
 */
class News {

    constructor() {
        this.title = '';
        this.source_name = '';
        this.author = '';
        this.description = '';
        this.url = '';
        this.published_at = null;
    }

    setTitle(title) {
        this.title = title;
    }

    getTitle() {
        return this.title;
    }

    setSourceName(source_name) {
        this.source_name = source_name;
    }

    getSourceName() {
        return this.source_name;
    }

    setAuthor(author) {
        this.author = author;
    }

    getAuthor() {
        return this.author;
    }

    setDescription(description) {
        this.description = description;
    }

    getDescription() {
        return this.description;
    }

    setUrl(url) {
        this.url = url;
    }

    getUrl() {
        return this.url;
    }

    setPublishedAt(published_at) {
        this.published_at = published_at;
    }

    getPublishedAt() {
        return this.published_at;
    }

}

module.exports = News;

