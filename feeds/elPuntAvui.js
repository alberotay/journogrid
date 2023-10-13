const feedUrl = 'https://www.elpuntavui.cat/barcelona/nacional.feed?type=rss';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/elpunt-svg.svg"

async function getItems(){

        let elements = await myParser.parse(feedUrl)
        return utils.feedNormalizer(elements,'elPuntAvui',FRONTEND_IMAGE)

}
exports.getItems = getItems
