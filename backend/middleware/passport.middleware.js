const config = require('../config');
const secret = config.SECRET_KEY;
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

module.exports = (passport) => {
  passport.use('local-register', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password'
  }, async (email, password, done) => {
    try {
      //Save the information provided by the user to the the database
      const user = await User.create({
        "local.email": email,
        "local.password": password
      });
      //Send the user information to the next middleware
      return done(null, user);
    } catch (error) {
      done(error);
    }
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password'
  }, async (email, password, done) => {
    try {
      //Find the user associated with the email provided by the user
      const user = await User.findOne({ "local.email": email });
      if( !user ){
        //If the user isn't found in the database, return a message
        return done(null, false, { message : 'User not found'});
      }
      //Validate password and make sure it matches with the corresponding hash stored in the database
      //If the passwords match, it returns a value of true.
      const validate = await user.isValidPassword(password);
      if( !validate ){
        return done(null, false, { message : 'Wrong Password'});
      }
      //Send the user information to the next middleware
      return done(null, user, { message : 'Logged in Successfully'});
    } catch (error) {
      return done(error);
    }
  }));


  //This verifies that the token sent by the user is valid
  passport.use('jwt', new JWTstrategy({
    secretOrKey : secret,
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken()
  }, async (payload, done) => {
    try {
      //Pass the user details to the next middleware
      return done(null, payload.user);
    } catch (error) {
      done(error);
    }
  }));
}
