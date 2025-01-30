const feedItems = require('./feed');
const feedsConfig = require('./feedsConfig');
const redisWrapper = require('../cache/redisWrapper');

// Create feed item getters once and reuse them
const allFeedsItemGetters = feedsConfig.feedConfig.map(config => new feedItems(config[0], config[1], config[2]));

// Initial data population
populateData();

// Set up intervals for updates
setInterval(populateData, 1000 * 60 * 5); // Parse and store every 5 minutes
setInterval(fillCache, 1000 * 60 * 0.1); // Fill cache every 6 seconds (0.1 minutes) - Adjust as needed


async function populateData() {
    await parseAndStoreToMongo();
    await fillCache(); // Fill cache immediately after parsing and storing
}


async function parseAndStoreToMongo() {
    // Use Promise.all to run parsers concurrently
    await Promise.all(allFeedsItemGetters.map(feedItemGetter => feedItemGetter.parseItems()));
}

async function fillCache() {
    // Use Promise.all to fetch items concurrently
    const results = await Promise.all(allFeedsItemGetters.map(feedItemGetter => feedItemGetter.getItems()));

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

exports.getNewsFromCache = async function() {
    const cachedResults = await redisWrapper.getNewsCache();
    console.log("Retrieving from cache");
    return cachedResults;
};