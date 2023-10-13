const feedUrl = 'https://www.elperiodico.com/es/rss/rss_portada.xml';
const myParser = require('../feedParser.js')
let utils = require('../utils')
const FRONTEND_IMAGE = "/elperiodico.svg"



async function getItems(){

    let elements = await myParser.parse(feedUrl)

    return utils.feedNormalizer(elements,'elPeriodico',FRONTEND_IMAGE)
}
exports.getItems = getItems
