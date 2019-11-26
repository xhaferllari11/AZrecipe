const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    googleId: {type: String},
    name: {type: String},
    profilePic: {type: String},
    diet: {type: String},
    email: {type: String},
    recipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }],
    intolerances: [String]
})

module.exports = mongoose.model('User', userSchema)