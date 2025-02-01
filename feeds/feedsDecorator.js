const feedItems = require('./feed');
const feedsConfig = require('./feedsConfig');
const redisWrapper = require('../cache/redisWrapper');
const mongoWrapper = require('../db/mongoWrapper');

// Create feed item getters once and reuse them
const allFeedsItemGetters =

// Initial data population
populateData();



// Set up intervals for updates
setInterval(populateData, 1000 * 60 * 5); // Parse and store every 5 minutes
setInterval(fillCache, 1000 * 60 * 0.1);

exports.getDataNews = async function(filter) {
    
    return  await mongoWrapper.getNewsByFilter(filter)

}

async function populateData() {
    await parseAndStoreToMongo();
    await fillCache(); // Fill cache immediately after parsing and storing
}


async function parseAndStoreToMongo() {
    allItemGetters = await getAllFeedItemGetters()
    await Promise.all(allItemGetters.map(feedItemGetter => feedItemGetter.parseItems()));
}

async function fillCache() {
    // Use Promise.all to fetch items concurrently
    let allItemGetters = await getAllFeedItemGetters()
    const results = await Promise.all(allItemGetters.filter(itemGetter => itemGetter.isActive).map(feedItemGetter => feedItemGetter.getItems()));

    // Filter and combine results efficiently using reduce
    const combinedFeed = results.reduce((acc, item) => {
        if (item && item.allFeeds && item.allFeeds.length > 0) {
            acc.push(item);
        }
        return acc;
    }, []);

    await redisWrapper.fillNewsCache(combinedFeed); // Await cache filling
    console.log("Cache filled");
}

async function getAllFeedItemGetters (){
    let dbRss = await mongoWrapper.getAllRss()
    let dbRssDoc = []
    for (let rss in dbRss){
        dbRssDoc.push(dbRss[rss]._doc)
    }
    return dbRssDoc.map(config => new feedItems(config.source,config.url, config.category,config.isActive));
}

exports.getNewsFromCache = async function() {
    const cachedResults = await redisWrapper.getNewsCache();
    console.log("Retrieving from cache");
    return cachedResults;
};

exports.getAllRss = async function (){
    return await mongoWrapper.getAllRss()
}


exports.storeRss = async function (rss){
    return await mongoWrapper.setRss(rss)
}

exports.deleteRss = function (source){
     mongoWrapper.deleteRssBySource(source)
}

exports.getAllCategories = async function (){
    return await mongoWrapper.getAllCategories()
}


exports.storeCategory = async function (rss){
    return await mongoWrapper.setCategory(rss)
}
