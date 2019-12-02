//currently working with model where user selects preferences and intolerances
//and all recipes afterwards follow those preferences/intolerances
//however, i am setting up code so user is able to change preferences/intolerances/meals
//over time

const User = require('../models/User');
const Recipe = require('../models/recipe');
const request = require('request');
require('dotenv').config();


const recipesPerCall = 1;
const spBase = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.API_KEY}&number=${recipesPerCall}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true`


function showNew(req, res, next) {
    res.render('recipes/new', { u: req.user, e: null });
}

function getNewRecipes(req, res, next) {
    let recipeReq = { diet: req.body.diet };
    recipeReq.cuisine = getArrayReq(req.body.cuisine);
    recipeReq.intolerances = getArrayReq(req.body.intolerances);
    recipeReq.mealType = getArrayReq(req.body.meal);

    //checks if same request was made previously and updates offset
    //currently findSeach function only updates if user seaches is populated
    let searched = findSearch(req.user, recipeReq);
    if (searched) {
        recipeReq.offset = searched;
    } else {
        recipeReq.offset = 0;
    }

    let APIReqURL = getReqURL(recipeReq);
    let reqOptions = { url: APIReqURL }
    console.log(APIReqURL);

    request(reqOptions, function (err, response, body) {
        if (err) {
            res.render('recipes/new', { u: req.user, e });
        };
        rawRecipes = JSON.parse(body);
        recipes = convertToSchema(rawRecipes);
        User.findById(req.user._id)
        .exec(function (e,u){
            recipeReq.offset = recipeReq.offset + rawRecipes.number;

                //command if new searches allowed: u.searches.push(recipeReq);
            //populte old recipes arr with recipes cooked last week
            u.oldRecipes = u.oldRecipes.concat(u.currRecipes);
            u.currRecipes = [];
            //saves each recipe to database
            recipes.forEach(function(recipe){
                let r = new Recipe(recipe);
                r.save(function(e){
                    if (e) {console.log(111, e);};
                });
                u.currRecipes.push(r);
            });
            u.searches[0].offset = recipeReq.offset + rawRecipes.number;
            u.save();
        });
    });

    res.redirect('/user/recipes/new');
};

module.exports = {
    showNew,
    new: getNewRecipes
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
            reqURL = `${reqURL}&offset=${reqField['offset']}`
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

//finds if similar search was made before and gives offset to update
//currently user is not allowed to update search methods because finding
//old searches would take too many for loops. will update later
function findSearch(u, searchParameters) {
    User.findById(u._id, function (err, user) {
        if (user.searches.length > 0) {
            return user.searches[0].offset;
        } else { return undefined }
    })
}

function convertToSchema(rawR) {
    rawR.results.forEach(r => {
        r.spoontacularId = r.id;
        r.instructions = [];
        r.analyzedInstructions[0].steps.forEach(s => {
            r.instructions.push(s.step);
        });
        r.ingredients = r.missedIngredients;
        r.ingredients.forEach(ing => {
            ing.spoontacularIngredientId = ing.id;
        });
    });
    return rawR.results;
};