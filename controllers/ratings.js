const User = require('../models/user');
const Recipe = require('../models/recipe');
const Rating = require('../models/rating');




function create(req,res,next){
    console.log('here');
    User.findById(req.user._id, function(e,u){
        Recipe.findById(req.params.recId, function(e,r){
            Rating.create(req.body, function(e,rat){
                console.log(1, req.body);
                console.log(rat);
                u.ratings.push(rat);
                console.log(u.ratings);
                u.ratings = u.ratings.filter(element => element != null);
                u.save(function(){
                    r.ratings.push(rat);
                    console.log(r.ratings);
                    r.ratings = r.ratings.filter(element => element != null);
                    r.save(function(){
                        res.redirect(`/user/recipes/${req.params.currpre}/${req.params.recId}`);
                    });
                });
            });
        });
    });
};

module.exports = {
    create
}