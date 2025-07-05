const parserMedia = require('rss-url-parser')

const parseMedia = async url => {
    try {

        const feed = await  parserMedia(url)
        console.log("got " + feed.length + " news from " + url)
        return (feed)
    } catch (e) {
        console.log("!!!!!!Failed on " + url)
        return []
    }
};


exports.parseMedia = parseMedia;