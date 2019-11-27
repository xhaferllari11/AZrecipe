


function showNew(req, res, next) {
    res.render('recipes/new', { u: req.user });
}

module.exports = {
    showNew
}