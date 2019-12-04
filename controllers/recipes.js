//currently working with model where user selects preferences and intolerances
//and all recipes afterwards follow those preferences/intolerances
//however, i am setting up code so user is able to change preferences/intolerances/meals
//over time

const User = require('../models/user');
const Recipe = require('../models/recipe');
const Rating = require('../models/rating');
const request = require('request');
require('dotenv').config();


const recipesPerCall = 4;
const spBase = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.API_KEY}&number=${recipesPerCall}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true`


function showNew(req, res, next) {
    res.render('recipes/new', { u: req.user, e: null });
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
    Recipe.findById(req.params.recId, function (e, r) {
        User.findById(req.user._id, function(e,u){
            ratingId = r.ratings.filter(element => u.ratings.includes(element));
            if (ratingId.length) {
                Rating.findById(ratingId[0], function(e,rat){
                    res.render('recipes/show', { u, page: fieldHandler, r, rat });
                });
            } else {
                res.render('recipes/show', { u, page: fieldHandler, r, rat: null });
            }
        });
    });
}





// function getNewRecipes(req, res, next) {
//     //converts API request inputs to arrays
//     let recipeReq = { diet: req.body.diet };
//     recipeReq.cuisine = getArrayReq(req.body.cuisine);
//     recipeReq.intolerances = getArrayReq(req.body.intolerances);
//     recipeReq.mealType = getArrayReq(req.body.meal);

//     //checks if same request was made previously and updates offset
//     //finds if similar search was made before and gives offset to update
//     //currently user is not allowed to update search methods because finding
//     //old searches would take too many for loops. Will update later
//     User.findById(req.user._id, function (e, u) {
//         if (u.searches.length > 0) {
//             recipeReq.offset = u.searches[0].offset;
//         } else {
//             recipeReq.offset = 0;
//         }
//         //converts search parameter to API string
//         let APIReqURL = getReqURL(recipeReq);
//         let reqOptions = { url: APIReqURL }
//         request(reqOptions, function (err, response, body) {
//             if (err) {
//                 res.render('recipes/new', { u: req.user, e });
//             };
//             rawRecipes = JSON.parse(body);
//             //API returns a large object body and this function converts it to Schema
//             recipes = convertToSchema(rawRecipes);
//             //populte old recipes arr with recipes cooked last week
//             u.oldRecipes = u.oldRecipes.concat(u.currRecipes);
//             u.currRecipes = [];

//             let bulkWriteArr = []

//             //saves each recipe to database
//             recipes.forEach(function (recipe) {
//                 //if recipe already in my db, change reference to that
//                 //instead of saving new recipe
//                 let newRecObj = {
//                     updateOne: {
//                         filter: { spoonacularId: recipe.spoonacularId },
//                         update: { '$set': recipe },
//                         upsert: true
//                     }
//                 }
//                 bulkWriteArr.push(newRecObj);
//             });
//             console.log(bulkWriteArr);
//             Recipe.bulkWrite(bulkWriteArr)
//             .then(result => {
//                 console.log(result);
//                 //updates current recipes with  new ones.
//                 //NOTE: if recipe already existed in database from another user it will not update
//                 //but can be found using matchedCount
//                 console.log(Object.values(result.upsertedIds));
//                 var la = Object.values(result.upsertedIds);
//                 console.log(typeof(la[0]));
//                 u.currRecipes = Object.values(result.upsertedIds);
//                 u.searches[0].offset = recipeReq.offset + rawRecipes.number;
//                 if (u.searches.length < 1) { u.searches.push(recipeReq); };
//                 u.save();
//                 res.redirect('/user/recipes/current');
//             });
//         });
//     });
// };


function getNewRecipes(req, res, next) {
    //converts API request inputs to arrays
    let recipeReq = { diet: req.body.diet };
    recipeReq.cuisine = getArrayReq(req.body.cuisine);
    recipeReq.intolerances = getArrayReq(req.body.intolerances);
    recipeReq.mealType = getArrayReq(req.body.meal);

    //checks if same request was made previously and updates offset
    //finds if similar search was made before and gives offset to update
    //currently user is not allowed to update search methods because finding
    //old searches would take too many for loops. Will update later
    User.findById(req.user._id, function (e, u) {
        if (u.searches.length > 0) {
            recipeReq.offset = u.searches[0].offset
        } else {
            recipeReq.offset = 0;
        }
        //converts search parameter to API string
        let APIReqURL = getReqURL(recipeReq);
        let reqOptions = { url: APIReqURL }
        request(reqOptions, function (err, response, body) {
            if (err) {
                res.render('recipes/new', { u: req.user, e });
            };
            rawRecipes = JSON.parse(body);
            //API returns a large object body and this function converts it to Schema
            recipes = convertToSchema(rawRecipes);
            //populte old recipes arr with recipes cooked last week
            u.oldRecipes = u.oldRecipes.concat(u.currRecipes);
            u.currRecipes = [];

            let recPromises = [];
            //saves each recipe to database
            for (let i=0;i<recipes.length;i++){
                //if recipe already in my db, change reference to that
                //instead of saving new recipe
                recPromises.push(Recipe.findOne({spoonacularId: recipes[i].spoonacularId}));
            }
            Promise.all(recPromises)
            .then(function(results){
                let newRecPromises = []
                for (let i=0;i<results.length;i++){
                    if (results[i]){
                        u.currRecipes.push(results[i]);
                    } else {
                        let r = new Recipe(recipes[i]);
                        newRecPromises.push(r.save());
                    }
                }
                return Promise.all(newRecPromises);
            }).then(function(results){
                results.forEach(function(result){
                    u.currRecipes.push(result);
                });
                u.searches[0].offset = recipeReq.offset + rawRecipes.number;
                if (u.searches.length < 1) { u.searches.push(recipeReq); };
                return u.save();
            }).then(function(result){
                res.redirect('/user/recipes/current');
            });
        });
    });
};



module.exports = {
    showNew,
    create: getNewRecipes,
    index,
    show
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
        } else if (reqField[option].length) {
            reqURL = `${reqURL}&${option}=`
            for (let i = 0; i < reqField[option].length; i++) {
                reqURL = `${reqURL}${reqField[option][i]}`
                if (i !== reqField[option].length - 1) {
                    reqURL = reqURL + ',';
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