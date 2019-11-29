const express = require('express');
const router = express.Router();
const recipeCtrl = require('../controllers/recipes');

router.get('/new', recipeCtrl.showNew);
router.post('/new', recipeCtrl.new);


module.exports = router;
