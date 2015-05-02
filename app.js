var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var Instagram = require('instagram-node-lib');
var async = require('async');
var mongoose = require('mongoose');
var app = express();

var auth = require('./auth');
var Instagram = auth.Instagram;

// Connect to database
mongoose.connect(process.env.MONGODB_CONNECTION_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Database connected succesfully.");
});



// Express app configuration
app.engine('handlebars', handlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true}));
app.use(auth.passport.initialize());
app.use(auth.passport.session());
app.set('port', process.env.PORT || 3000);


/*
 * Route middleware that redirects to /login if the user is not logged in
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  } else {
    res.redirect('/login');
  }
}


app.get('/login', function(req, res) {
  res.render('login');
});


app.get('/', ensureAuthenticated, function(req, res){
  res.redirect('/location');
});

app.get('/location', ensureAuthenticated, function(req, res) {
  res.render('location');
});

app.get('/activity', ensureAuthenticated, function(req, res) {
  res.render('activity');
});

app.get('/compete', ensureAuthenticated, function(req, res) {
  res.render('compete');
});


/*
 * Send a JSON with the number of media counts for each user that is being followed.
 */
app.get('/mediaCounts', ensureAuthenticated, function(req, res){
  
  Instagram.users.follows({ 
    user_id: req.user.instagram.id,
    access_token: req.user.instagram.access_token,
    complete: function(data) {
      // an array of asynchronous functions
      var asyncTasks = [];
      var mediaCounts = [];
       
      data.forEach(function(item){
        asyncTasks.push(function(callback){
          // asynchronous function!
          Instagram.users.info({ 
              user_id: item.id,
              access_token: req.user.ig_access_token,
              complete: function(data) {
                mediaCounts.push(data);
                callback();
              }
            });            
        });
      });
      
      // Now we have an array of functions, each containing an async task
      // Execute all async tasks in the asyncTasks array
      async.parallel(asyncTasks, function(err){
        // All tasks are done now
        if (err) return err;
        res.json({users: mediaCounts});        
      });
    }
  });
});


/*
 * Send a JSON with the recent images and locations for all users that are being followed.
 */
app.get('/imageLocations', ensureAuthenticated, function(req, res) {

  Instagram.users.follows({
    user_id: req.user.instagram.id,
    access_token: req.user.instagram.access_token,
    complete: function(data) {

      var asyncTasks = [];
      var images = [];
       
      data.forEach(function(item){
        asyncTasks.push(function(callback) {
          Instagram.users.recent({ 
              user_id: item.id,
              access_token: req.user.ig_access_token,
              complete: function(data) {
                data.forEach(function(item) {
                  if (item.location && item.location.longitude && item.location.latitude)
                    images.push(item);
                });
                callback();
              }
            });            
        });
      });
      
      async.parallel(asyncTasks, function(err){
        if (err) return err;
        res.json({images: images});        
      });

    }
  });

});


/*
 * Send a JSON with information about the instagram user itself and one random user that is being followed.
 */
app.get('/competitors', ensureAuthenticated, function(req, res) {

  var asyncTasks = [];
  var randomUser;
  var you;

  asyncTasks.push(function(callback) {
    Instagram.users.follows({
      user_id: req.user.instagram.id,
      access_token: req.user.instagram.access_token,
      complete: function(data) {

        randomUser = data[Math.floor(Math.random()*(data.length+1))];

        Instagram.users.info({ 
          user_id: randomUser.id,
          access_token: req.user.ig_access_token,
          complete: function(data) {
            randomUser = data;
            callback();
          }
        });
      }
    });
  });

  asyncTasks.push(function(callback) {
    Instagram.users.info({
      user_id: req.user.instagram.id,
      access_token: req.user.instagram.access_token,
      complete: function(data) {
        you = data;
        callback();
      }
    });
  });

  async.parallel(asyncTasks, function(err){
    // All tasks are done now
    if (err) 
      return res.redirect('/error');
    res.json({user: randomUser, you: you});
  });  

});


/*
 * Simple error page with a button that redirects to /
 */
app.get('/error', function(req, res) {
  res.render('error');
});

/*
 * Routes for Instagram authentication
 */
app.get('/auth/instagram',
  auth.passport.authenticate('instagram'));

app.get('/auth/instagram/callback', 
  auth.passport.authenticate('instagram', {successRedirect: '/location', failureRedirect: '/error'}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// Start the server and go
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
