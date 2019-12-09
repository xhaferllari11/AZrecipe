var express = require('express');
const passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { u: req.user });
});
router.get('/auth/google', passport.authenticate(
  'google', {scope: ['profile','email']}
));
router.get('/oauth2callback',passport.authenticate(
  'google', {
    successRedirect: '/user',
    failureRedirect: '/'
  }
));
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
