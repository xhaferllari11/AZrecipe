const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
},
    function (accessToken, refreshToken, profile, done) {
        User.findOne({ googleId: profile.id }, function (e, u) {
            if (e) { return done(e); }
            if (u) {
                return done(null, u);
            } else {
                var newUser = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id
                })
                newUser.save(function (e) {
                    if (e) { return done(e); }
                });
                return done(null, newUser)
            }
        })
    }));

passport.serializeUser(function (u, done) {
    done(null, u.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, u) {
        done(err, u);
    });
});
