const express = require('express');
// const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');
var controllers = require('./controllers');
const webpack = require ('webpack');
// const webpackMiddleware = require('webpack-middleware');
// const webpackConfig  = require('../webpack.config');
const mongoose = require ('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require ('bcrypt')


var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//use passport
app.use(require('express-session')({
	secret: 'secretforsession',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// configure passport
const User = require('./dbSchemas/user');

passport.use(new LocalStrategy(
	{usernameField:"email", passwordField:"password"},
  	function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) {console.log('error in findone',err); return done(err); }
	  if (!user) { console.log("not user found");return done(null, false); }
	//   bcrypt password here
	  bcrypt.compare( password, user.password, (err, res)=>{
			if(err) return done(err);
			if(res === false) {
				return done(null,false)
			}else{
				return done(null, user)
			}
	  } )
    //   return done(null, user);
    });
  }
));
	
passport.serializeUser(
	function(User, done) {
	done(null, User.id);
}
);
  
passport.deserializeUser(
	function(id, done) {
	User.findById(id, function(err, user) {
	  done(err, user);
	});}
);

// DB connection
mongoose.connect(config.dbURL
	,{useMongoClient:true}
);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// autoIncrement.initialize(db);

app.use(express.static(path.join(__dirname,'../client')));


controllers.set(app);

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/index.html'));
	
});


module.exports.start = () => app.listen(config.port, () => console.log('App listening on port '+ config.port));
