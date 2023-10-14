const feedUrl = 'https://www.sport.es/es/rss/last-news/news.xml';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/sport.png"

async function getItems() {
    let elements = await myParser.parseMedia(feedUrl)
    return utils.feedNormalizerMedia(elements, 'sport',FRONTEND_IMAGE)
}

exports.getItems = getItems
