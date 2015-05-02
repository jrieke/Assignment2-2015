var passport = require('passport');
var dotenv = require('dotenv');
var InstagramStrategy = require('passport-instagram').Strategy;
var Instagram = require('instagram-node-lib');

var models = require('./models');

// Load environment variables from .env file
dotenv.load();

// Setup Instagram API
Instagram.set('client_id', process.env.INSTAGRAM_CLIENT_ID);
Instagram.set('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);

exports.passport = passport;
exports.Instagram = Instagram;

// Passport session setup
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



/*
 * Configure passport to work with Instagram authentication
 */
passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: process.env.INSTAGRAM_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {  // asynchronous

      models.User.findOne({'instagram.id': profile.id}, function(err, user) {
        if (err)
          return done(err);

        if (user) {  // Database record for this Instagram account exists, just update it
          return updateInstagramInformation(user, profile, accessToken, done);
        } else {  // Create a new database record
          return updateInstagramInformation(new models.User(), profile, accessToken, done);
        }
      });

    });
  }
));

/*
 * Update all Instagram data in 'user' with the information from 'profile' and 'access_token'
 * If anything was changed, save it to the database
 */
function updateInstagramInformation(user, profile, access_token, done) {
  var anythingChanged = false;

  if (user.instagram.id != profile.id) {
    user.instagram.id = profile.id;
    anythingChanged = true;
  }

  if (user.instagram.access_token != access_token) {
    user.instagram.access_token = access_token;               
    anythingChanged = true;
  }
  
  if (user.instagram.name != profile.username) {
    user.instagram.name = profile.username;
    anythingChanged = true;
  }

  if (anythingChanged) {
    user.save(function(err) {
      if (err)
        return done(err);
      return done(null, user);
      });
  } else {
    return done(null, user);
  }
}
