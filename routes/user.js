var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/', function(req, res, next) {
  console.log('user: ', req.user);
  console.log('query', req.query);
  
  res.render('user',{u: req.user});
});


module.exports = router;
