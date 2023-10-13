const feedUrl = 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada';
const myParser = require('../feedParser.js')
const utils = require('../utils')
const FRONTEND_IMAGE = "/elPais-svg.svg"

async function getItems(){

    let elements = await myParser.parseMedia(feedUrl)
    return utils.feedNormalizerMedia(elements,'elPais',FRONTEND_IMAGE)

}
exports.getItems = getItems
