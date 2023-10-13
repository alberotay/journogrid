const feedUrl = 'https://es.euronews.com/rss';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/euronews-svg.svg"

async function getItems(){
    let elements = await myParser.parse(feedUrl)
    return utils.feedNormalizer( elements,'daily',FRONTEND_IMAGE)
}
exports.getItems = getItems
