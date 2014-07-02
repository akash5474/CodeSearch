'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    GithubStrategy = require('passport-github').Strategy;

var configAuth = require('./auth');

/**
 * Passport configuration
 */
passport.serializeUser(function(user, done) {
  done(null, user.github_id);
});
passport.deserializeUser(function(id, done) {
  User.findOne({
    github_id: id
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    done(err, user);
  });
});

// add other strategies for more authentication flexibility
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  },
  function(email, password, done) {
    User.findOne({
      email: email.toLowerCase()
    }, function(err, user) {
      if (err) return done(err);

      if (!user) {
        return done(null, false, {
          message: 'This email is not registered.'
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          message: 'This password is not correct.'
        });
      }
      return done(null, user);
    });
  }
));

console.log(configAuth.githubAuth);
passport.use(new GithubStrategy({

      clientID      : configAuth.githubAuth.clientID,
      clientSecret  : configAuth.githubAuth.clientSecret,
      callbackURL   : configAuth.githubAuth.callbackURL

    },

    function(token, refreshToken, profile, done) {

      process.nextTick(function() {
        console.log('token', token);
        console.log('profile', profile);

        User.findOne({ name: profile.login }, function(err, user) {
          if (err) return done(err);

          if (!user) {
            var newUser = new User();

            // set all of the github information in our user model
            newUser.github_id = profile.id;
            newUser.github.id = profile.id; // set the users github id
            newUser.github.token = token; // we will save the token that github provides to the user
            newUser.github.login = profile.login;
            newUser.provider = "github";
            // save our user to the database
            newUser.save(function(err) {
              if (err) throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          } else {
            return done(null, user);
          }
        });

    });

}));


module.exports = passport;
