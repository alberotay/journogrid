const mongoose = require('mongoose');

const rssSchema = new mongoose.Schema({
    source: { type: String }, // Fuente del feed
    url: { type: String }, // Fuente del feed
    category: { type: String }, // Fuente del feed
    isActive: { type: Boolean }, // Fuente del feed
});

const Rss = mongoose.model('RssConfiguration', rssSchema);

module.exports = Rss;