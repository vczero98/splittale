var express          = require("express"),
    router           = express.Router(),
    passport         = require("passport"),
    FacebookStrategy = require("passport-facebook"),
    User             = require("../models/user");

module.exports = function(passportObj) {
  passportObj.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: ['picture', 'name']
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log("profile is:");
      console.log(profile);
      console.log("=================");
      User.findOne({
      'fb_id': profile.id
      }, function(err, user) {
        if (err) {
          return cb(err);
        }
        console.log(profile);
        // No user was found, create account
        if (!user) {
          user = new User({
            fb_id: profile.id,
            name: profile.name.givenName,
            points: 0
          });
          user.save(function(err) {
            if (err) console.log(err);
            return cb(err, user);
          });
        } else {
          //found user. Return
          return cb(err, user);
        }
      });
    }
  ));

  router.get('/auth/facebook',
    passport.authenticate('facebook'));

  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/write');
    });

  // Logout route
  router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });

  return router;
}
