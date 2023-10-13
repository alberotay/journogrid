const feedUrl = 'https://elmon.cat/es/feed/';
const myParser = require('../feedParser.js')
const utils = require("../utils");
const FRONTEND_IMAGE = "/elmon-svg.svg"

async function getItems(){
    let elements = await myParser.parse(feedUrl)
    let normalizedElements =utils.feedNormalizer(elements,'elMon',FRONTEND_IMAGE)
    normalizedElements.allFeeds.forEach((t)=>{
        let dirtyImage=  t.thumbnailUrl
        let cleanImage = dirtyImage.replace('">Continued</a>.jpg',"")
        //t.thumbnailUrl= cleanImage
        t.thumbnailUrl =  "http://grin2b.com/wp-content/uploads/2017/01/Grin2B_icon_NEWS.png"
    })
    return normalizedElements
}
exports.getItems = getItems
