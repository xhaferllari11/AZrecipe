const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ingredientSchema = new schema({
    spoonacularIngredientId: Number,
    amount: Number,
    unit: String,
    name: String,
    originalString: String,
    image: String
}, { timestamps: true })

const recipeSchema = new schema({
    sourceUrl: String,
    aggregateLikes: String,
    spoonacularScore: Number,
    healthScore: Number,
    spoonacularId: Number,
    title: String,
    readyInMinutes: Number,
    servings: Number,
    image: String,
    cuisines:[String],
    dishTypes:[String],
    diets:[String],
    instructions:[String],
    summary: String,
    ingredients:[ingredientSchema],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }],
}, { timestamps: true })

module.exports = mongoose.model('Recipe', recipeSchema);