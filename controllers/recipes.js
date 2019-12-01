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
    let searched = findSearch(req.user, recipeReq);
    if (searched) {
        recipeReq.offset = [searched.offset];
    } else {
        recipeReq.offset = [0];
    }

    let APIReqURL = getReqURL(recipeReq);
    let reqOptions = {
        url: APIReqURL
    }
    console.log(APIReqURL);
    request(reqOptions, function (err, response, body) {
        if (err) {
            console.log(e)
            res.render('recipes/new', { u: req.user, e });
        };
        rawRecipes = JSON.parse(body);
        recipes = convertToSchema(rawRecipes);
        let recipe = new Recipe(recipes[0]);
        recipe.save(function (e, r) {
            if (e) {
                console.log(e)
                res.render('recipes/new', { u: req.user, e });
            };
            console.log('savedddddd', r);
            console.log('userID', req.user._id)
            User.findById(req.user._id).exec(function (e, u) {
                console.log(u);
                console.log(req.user._id);
                recipeReq.offset = recipeReq.offset[0];
                u.searches.push(recipeReq);
                u.currRecipes = [];
                u.currRecipes.push(r);
                console.log('pushed to user');
                u.save();
            });
        })

    });

    res.redirect('/user/recipes/new');
}

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

//uses the find method in array to find searches before, not the mongoose find
function findSearch(u, searchParameters) {
    User.find({ _id: u._id }, function (err, user) {
        if (user.searches) {
            return user.searches.find(function (s) {
                s.cuisine == searchParameters.cuisine &&
                    s.intolerances == searchParameters.intolerances &&
                    s.mealType == searchParameters.mealType &&
                    s.diet == searchParameters.diet
            });
        } else { return undefined }
    })
}

function convertToSchema(rawR) {
    console.log(rawR)
    rawR.results.forEach(r => {
        r.spoontacularId = r.id;
        r.instructions = [];
        r.analyzedInstructions[0].steps.forEach(s => {
            r.instructions.push(s.step);
        });
        r.ingredients = r.missedIngredients;
        r.ingredients.forEach(ing => {
            ing.spoontacularIngredientId = ing.id;
        })
    });
    return rawR.results;
}