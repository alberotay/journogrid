const feedUrl = 'https://e-noticies.cat/rss/last-posts';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/e-n-svg.svg"



async function getItems(){

    let elements = await myParser.parseMedia(feedUrl)
    return utils.feedNormalizerMedia(elements,'eNoticies',FRONTEND_IMAGE)

}
exports.getItems = getItems
