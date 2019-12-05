var express = require('express');
var router = express.Router();
const User = require('../models/user');
const m = require('../controllers/recipes').meals;

/* GET users listing. */

router.get('/', isLoggedIn, function (req, res, next) {
  User.findById(req.user._id).populate('currRecipes')
    .exec(function (e, u) {
      res.render('user', { u });
    })
});

router.get('/preferences', isLoggedIn, function (req, res, next) {
  User.findById(req.user._id)
    .exec(function (e, u) {
      res.render('preferences', { u, m });
    })
});

router.get('/profile', isLoggedIn, function (req, res, next) {
  User.findById(req.user._id)
    .exec(function (e, u) {
      res.render('userProfile', { u });
    })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/google')
}

module.exports = router;
