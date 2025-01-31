const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    type: { type: String }
});

const category = mongoose.model('Category', categorySchema);

module.exports = category;