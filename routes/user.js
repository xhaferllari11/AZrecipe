var express = require('express');
var router = express.Router();
const User = require('../models/user');

/* GET users listing. */

router.get('/', isLoggedIn, function(req, res, next) {
  User.findById(req.user._id).populate('currRecipes')
  .exec(function(e,u){
    res.render('user',{u});
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/google')
}

module.exports = router;
