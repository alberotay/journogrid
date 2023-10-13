const feedUrl = 'https://www.ara.cat/rss/';
const myParser = require('../feedParser.js')
const utils = require('../utils')
const FRONTEND_IMAGE = "/ara-svg.svg"

async function getItems() {
    let elements = await myParser.parse(feedUrl)
    return utils.feedNormalizer(elements, 'ara',FRONTEND_IMAGE)
}

exports.getItems = getItems
