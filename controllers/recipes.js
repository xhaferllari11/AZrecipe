const User = require('../models/user');
const Recipe = require('../models/recipe');
const Rating = require('../models/rating');
const request = require('request');
require('dotenv').config();

const meals = {
    cuisines: ['African', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 'Eastern European', 'European', 'French', 'German', 'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American', 'Mediterranean', 'Mexian', 'Middle Eastern', 'Spanish', 'Thai', 'Vietnamese'],
    diet: ['Gluten Free', 'Ketogenic', 'Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'Whole30'],
    intolerances: ['Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree nut', 'Wheat'],
    mealType: ['Main Course', 'Soup', 'Dessert']
}
const angjelaId = '5de815626d613a00173b960a';
const umichId = '5de9598428eba70017555ecf';
var recipesPerCall = 7;
var spBase;


function showNew(req, res, next) {
    res.render('recipes/new', { u: req.user, e: null, m: meals });
}

function index(req, res, next) {
    let fieldHandler = (req.params.currpre == 'current') ? 'currRecipes' : 'oldRecipes';
    User.findById(req.user._id)
        .populate(fieldHandler)
        .exec(function (e, u) {
            res.render('recipes/index', { u, page: fieldHandler });
        })
}

function show(req, res, next) {
    let fieldHandler = (req.params.currpre == 'current') ? 'currRecipes' : 'oldRecipes';
    User.findById(req.user._id, function (e, u) {
        Recipe.findById(req.params.recId).populate('ratings')
        .exec(function (e, r) {
            ratingId = r.ratings.filter(element => u.ratings.includes(element._id));
            if (ratingId.length) {
                Rating.findById(ratingId[0], function (e, rat) {
                    r.ratings.splice(u.ratings.findIndex(el => (el._id == ratingId[0])),1);
                    res.render('recipes/show', { u, page: fieldHandler, r, rat });
                });
            } else {
                res.render('recipes/show', { u, page: fieldHandler, r, rat: null });
            }
        });
    });
}

function getNewRecipes(req, res, next) {
    //converts API request inputs to arrays
    User.findById(req.user._id, function (e, u) {
        recipesPerCall = (req.user._id == angjelaId 
            || req.user._id == umichId) ? 7 : recipesPerCall;
        spBase = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.API_KEY}&number=${recipesPerCall}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true`
        let recipeReq = {};

        //checks if same request was made previously and updates offset
        //finds if similar search was made before and gives offset to update
        //currently user is not allowed to update search methods because finding
        //old searches would take too many for loops. Will update later
        if (u.searches.length > 0) {
            recipeReq = u.searches[0];
        } else {
            recipeReq.offset = 0;
            recipeReq.diet = req.body.diet;
            recipeReq.cuisine = getArrayReq(req.body.cuisine);
            recipeReq.intolerances = getArrayReq(req.body.intolerances);
            recipeReq.mealType = getArrayReq(req.body.meal);
        }

        let APIReqURL = getReqURL(recipeReq);
        let reqOptions = { url: APIReqURL }
        request(reqOptions, function (err, response, body) {
            if (err) {
                res.render('recipes/new', { u: req.user, e });
            };
            rawRecipes = JSON.parse(body);
            //API returns a large object body and this function converts it to Schema
            recipes = convertToSchema(rawRecipes);

            u.oldRecipes = u.oldRecipes.concat(u.currRecipes);
            u.currRecipes = [];

            let recPromises = [];
            for (let i = 0; i < recipes.length; i++) {
                //if recipe already in my db, change reference to that
                recPromises.push(Recipe.findOne({ spoonacularId: recipes[i].spoonacularId }));
            }
            Promise.all(recPromises)
                .then(function (results) {
                    let newRecPromises = []
                    for (let i = 0; i < results.length; i++) {
                        if (results[i]) {
                            u.currRecipes.push(results[i]);
                        } else {
                            let r = new Recipe(recipes[i]);
                            newRecPromises.push(r.save());
                        }
                    }
                    return Promise.all(newRecPromises);
                }).then(function (results) {
                    results.forEach(function (result) {
                        u.currRecipes.push(result);
                    });
                    if (u.searches.length < 1) { u.searches.push(recipeReq); };
                    u.searches[0].offset = recipeReq.offset + rawRecipes.number;
                    return u.save();
                }).then(function (result) {
                    res.redirect('/user/recipes/current');
                });
        });
    });
};



module.exports = {
    showNew,
    create: getNewRecipes,
    index,
    show,
    meals
}


//converts the form inputs into arrays as neccessary,
//some form inputs don't come in if user didn't select any
function getArrayReq(reqField) {
    if (reqField) {
        if (typeof (reqField) === 'string') {
            return [reqField];
        } else {
            return reqField;
        }
    } else {
        return [];
    }
}

//converts the requests into the URL field
function getReqURL(reqField) {
    let reqURL = spBase;
    for (let option in reqField) {
        if (option === 'diet') {
            reqURL = `${reqURL}&diet=${reqField['diet']}`
        } else if (option === 'offset') {
            reqURL = `${reqURL}&offset=${reqField.offset}`
        } else if (option == 'cuisine' ||
            option == 'intolerances' || option == 'mealType') {
            if (reqField[option].length) {
                //spoonacular wanted 'type' not 'mealType'
                if (option == 'mealType') {
                    reqURL = `${reqURL}&${'type'}=`
                } else {
                    reqURL = `${reqURL}&${option}=`
                }
                for (let i = 0; i < reqField[option].length; i++) {
                    reqURL = `${reqURL}${reqField[option][i]}`
                    if (i !== reqField[option].length - 1) {
                        reqURL = reqURL + ',';
                    }
                }
            }
        }
    }
    return reqURL;
}

//converts returned object recipe to schema type object
function convertToSchema(rawR) {
    rawR.results.forEach(r => {
        r.spoonacularId = r.id;
        r.instructions = [];
        r.analyzedInstructions[0].steps.forEach(s => {
            r.instructions.push(s.step);
        });
        r.ingredients = r.missedIngredients;
        r.ingredients.forEach(ing => {
            ing.spoonacularIngredientId = ing.id;
        });
    });
    return rawR.results;
};