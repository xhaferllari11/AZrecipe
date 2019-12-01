const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ratingSchema = new schema({
    rate: {type: Number, required: true},
    comment: String
});

module.exports = mongoose.model('Rating', ratingSchema);