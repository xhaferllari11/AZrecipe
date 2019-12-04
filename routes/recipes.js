const express = require('express');
const router = express.Router();
const recipeCtrl = require('../controllers/recipes');
const ratingCtrl = require('../controllers/ratings');

router.get('/new', isLoggedIn, recipeCtrl.showNew);
router.post('/new', isLoggedIn, recipeCtrl.create);

router.get('/:currpre', isLoggedIn, recipeCtrl.index);
router.get('/:currpre/:recId', isLoggedIn, recipeCtrl.show);
router.post('/:currpre/:recId', isLoggedIn, ratingCtrl.create);
router.put('/:currpre/:recId', isLoggedIn, ratingCtrl.update);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/google')
}


module.exports = router;
