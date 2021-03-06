const User = require('../models/user');
const Recipe = require('../models/recipe');
const Rating = require('../models/rating');

function create(req,res,next){
    User.findById(req.user._id, function(e,u){
        Recipe.findById(req.params.recId, function(e,r){
            Rating.create(req.body, function(e,rat){
                u.ratings.push(rat);
                u.save(function(){
                    r.ratings.push(rat);
                    r.save(function(){
                        res.redirect(`/user/recipes/${req.params.currpre}/${req.params.recId}`);
                    });
                });
            });
        });
    });
};

function update(req,res,next){
    User.findById(req.user._id, function(e,u){
        Recipe.findById(req.params.recId, function(e,r){
            ratingId = u.ratings.filter(element => r.ratings.includes(element));
            if (ratingId.length){
                //find and update
                Rating.findByIdAndUpdate(ratingId[0],req.body,function(){
                    res.redirect(`/user/recipes/${req.params.currpre}/${req.params.recId}`);
                })
                // In case comment is not matched
            } else {
                Rating.create(req.body, function(e,rat){
                    u.ratings.push(rat);
                    u.save(function(){
                        r.ratings.push(rat);
                        r.save(function(){
                            res.redirect(`/user/recipes/${req.params.currpre}/${req.params.recId}`);
                        });
                    });
                });
            };
        });
    });
}

function delRating(req,res){
    User.findById(req.user._id, function(e,u){
        Recipe.findById(req.params.recId, function(e,r){
            ratingId = u.ratings.filter(element => r.ratings.includes(element));
            Rating.findByIdAndRemove(ratingId, function(e){
                r.ratings.splice(u.ratings.findIndex(el => (el._id ==ratingId[0])),1);
                u.ratings.splice(u.ratings.findIndex(el => (el._id ==ratingId[0])),1);
                Promise.all([r.save(),u.save()])
                .then(function(results){
                    res.redirect(`/user/recipes/${req.params.currpre}/${req.params.recId}`);
                });
            });
        });
    });
}

module.exports = {
    create,
    update,
    delete: delRating
}