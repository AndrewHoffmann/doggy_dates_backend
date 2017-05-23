"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
 displayName: String,
 picture: String,
 facebook: String,
});

userSchema.pre('save', function(next) {
 var user = this;
 if (!user.isModified('password')) {
   return next();
 }
 bcrypt.genSalt(10, function(err, salt) {
   bcrypt.hash(user.password, salt, function(err, hash) {
     user.password = hash;
     next();
   });
 });
});

userSchema.methods.comparePassword = function(password, done) {
 bcrypt.compare(password, this.password, function(err, isMatch) {
   done(err, isMatch);
 });
};

module.exports = mongoose.model('User', userSchema);