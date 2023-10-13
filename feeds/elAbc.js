const feedUrl = 'https://www.abc.es/rss/2.0/portada/';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/ABC.svg"
//va con media

async function getItems(){
    let elements = await myParser.parseMedia(feedUrl)
    return utils.feedNormalizerMedia(elements,'abc',FRONTEND_IMAGE)

}
exports.getItems = getItems
