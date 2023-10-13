const feedUrl = 'https://www.20minutos.es/rss/';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "20-svg.svg"


async function getItems(){
    let elements = await myParser.parse(feedUrl)
    return utils.feedNormalizer(elements,'elMin',FRONTEND_IMAGE)

}
exports.getItems = getItems

