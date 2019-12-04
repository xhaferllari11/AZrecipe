const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ratingSchema = new schema({
    rating: {
        type: Number, 
        required: true,
        min: 0,
        max: 5
    },
    comment: String
});

module.exports = mongoose.model('Rating', ratingSchema);