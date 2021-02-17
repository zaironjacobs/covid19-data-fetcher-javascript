/**
 * Article class to store article data
 *
 * @author      Zairon Jacobs <zaironjacobs@gmail.com>
 */
class Article {

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

    setSourceName(source_name) {
        this.source_name = source_name;
    }

    setAuthor(author) {
        this.author = author;
    }

    setDescription(description) {
        this.description = description;
    }

    setUrl(url) {
        this.url = url;
    }

    setPublishedAt(published_at) {
        this.published_at = published_at;
    }
}

module.exports = Article;

