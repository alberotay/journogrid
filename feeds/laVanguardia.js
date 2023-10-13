const feedUrl = 'https://www.lavanguardia.com/rss/home.xml';
const myParser = require('../feedParser.js')
const utils = require('../utils.js')
const FRONTEND_IMAGE = "/vanguardia-svg.svg"

async function getItems() {
    let elements = await myParser.parse(feedUrl)
    return utils.feedNormalizer(elements, 'laVanguardia',FRONTEND_IMAGE)
}


exports.getItems = getItems
