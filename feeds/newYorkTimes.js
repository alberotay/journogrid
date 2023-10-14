const feedUrl = 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/newYorkTimes.svg"
//va con media

async function getItems(){
    let elements = await myParser.parseMedia(feedUrl)
    return utils.feedNormalizerMedia(elements,'newYorkTimes',FRONTEND_IMAGE)

}
exports.getItems = getItems
