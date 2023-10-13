const feedUrl = 'https://www.europapress.es/rss/rss.aspx?ch=284';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/europa-svg.svg"

async function getItems(){
    let elements = await myParser.parse(feedUrl)
    return utils.feedNormalizer(elements,'europa',FRONTEND_IMAGE)
}
exports.getItems = getItems
