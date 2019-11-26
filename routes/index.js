var express = require('express');
const passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/userprofile', function(req, res, next) {
  console.log(req.user);
  console.log(req.query);
  
  res.render('userprofile',{});
});
router.get('/auth/google', passport.authenticate(
  'google', {scope: ['profile','email']}
));
router.get('/oauth2callback',passport.authenticate(
  'google', {
    successRedirect: '/userprofile',
    failureRedirect: '/'
  }
));
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
