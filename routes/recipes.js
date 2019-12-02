const express = require('express');
const router = express.Router();
const recipeCtrl = require('../controllers/recipes');

router.get('/new', isLoggedIn, recipeCtrl.showNew);
router.post('/new', isLoggedIn, recipeCtrl.create);

router.get('/:currpre', isLoggedIn, recipeCtrl.index);


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/google')
}


module.exports = router;
