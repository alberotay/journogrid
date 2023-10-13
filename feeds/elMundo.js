const feedUrl = 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml';
const myParser = require('../feedParser.js')
const utils = require("../utils")
const FRONTEND_IMAGE = "/El_Mundo-svg.svg"

async function getItems(){

    let elements = await myParser.parseMedia(feedUrl)
    return utils.feedNormalizerMedia(elements,'elMundo',FRONTEND_IMAGE)

}
exports.getItems = getItems







