const User = require('../models/user');
require('dotenv').config();


const recipesPerCall = 7;
const spBase = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.API_KEY}&number=${recipesPerCall}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true`


function showNew(req, res, next) {
    res.render('recipes/new', { u: req.user });
}

function getNewRecipes(req, res, next) {
    console.log(req.body);
    let recipeReq = { diet: req.body.diet };
    recipeReq.cuisine = getArrayReq(req.body.cuisine);
    recipeReq.intolerances = getArrayReq(req.body.intolerances);
    recipeReq.mealType = getArrayReq(req.body.meal);
    let APIReqURL = getReqURL(recipeReq);
    console.log(recipeReq);
    console.log(APIReqURL);

    res.redirect('/user/recipes/new');
}

module.exports = {
    showNew,
    new: getNewRecipes
}



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

function getReqURL(reqField) {
    let reqURL = spBase;
    for (let option in reqField) {
        if (option === 'diet') {
            reqURL = `${reqURL}&diet=${reqField['diet']}`
        } else if (reqField[option].length) {
            reqURL = `${reqURL}&${option}=`
            for (let i = 0; i<reqField[option].length; i++) {
                reqURL = `${reqURL}${reqField[option][i]},`
            }
        }
    }
    return reqURL;
}
