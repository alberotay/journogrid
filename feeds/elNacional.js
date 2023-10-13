const feedUrl = 'https://www.elnacional.cat/uploads/feeds/feed_es.xml';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/nacional-svg.svg"


async function getItems(){
    let elements = await myParser.parse(feedUrl)
    return utils.feedNormalizer(elements,'elNacional',FRONTEND_IMAGE)
}
exports.getItems = getItems
