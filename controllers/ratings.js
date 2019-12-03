const User = require('../models/user');
const Recipe = require('../models/recipe');
const Rating = require('../models/rating');




function create(req,res,next){
    let fieldHandler = (req.params.currpre == 'current') ? 'currRecipes' : 'oldRecipes';
    User.findById(req.user._id, function(e,u){
        Recipe.findById(req.params.recId, function(e,r){
            console.log(req.body);
            res.redirect(`/user/recipes/${req.params.currpre}/${req.params.recId}`);
        });
    });
}

module.exports = {
    create
}