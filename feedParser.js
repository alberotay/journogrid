let RSSParser = require("rss-parser");
const parserMedia = require('rss-url-parser')

const parse = async url => {
    console.log('Parseing:' + url)
    try {
        const feed = await new RSSParser().parseURL(url);
        console.log("got " + feed.items.length + " news from " + url)
        return (feed.items)
    } catch (e) {
        console.log("!!!!!!Failed on " + url)
        return []
    }
};

const parseMedia = async url => {
    console.log('Parseing with Media:' + url)
    try {

        const feed = await  parserMedia(url)
        console.log("got " + feed.length + " news from " + url)
        return (feed)
    } catch (e) {
        console.log("!!!!!!Failed on " + url)
        return []
    }
};

exports.parse = parse;
exports.parseMedia = parseMedia;