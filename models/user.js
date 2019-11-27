const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    googleId: { type: String },
    name: { type: String },
    profilePic: { type: String },
    email: { type: String },
    oldRecipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    currRecipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }],
    searched: [searchedSchema]
}, {
    timestamps: true
});

const searchedSchema = new schema({
    cuisine: [{ type: String }],
    diet: [{ type: String }],
    intolerances: [{ type: String }],
    mealType: [{ type: String }],
    offset: { type: Number },
    numResults: { type: Number }
}, {
    timestamps: true
});


module.exports = mongoose.model('User', userSchema)