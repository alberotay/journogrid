const feedUrl = 'https://www.naciodigital.cat/rss/';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/naci-svg.svg"

async function getItems() {
    let elements = await myParser.parse(feedUrl)
    return utils.feedNormalizer(elements, 'NDigital',FRONTEND_IMAGE)
}

exports.getItems = getItems
