const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const park = require('./models/park'); // changed from user to park
const jwt = require('jwt-simple');
const path = require('path');
const request = require('request');
const moment = require('moment');

mongoose.connect('mongodb://andrew:quidfacit01@ds011912.mlab.com:11912/doggydates');	// copy link from mlab, replace user and password, delete < >

app.use(cors());
app.use(express.static('app'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// Post park.  Request and response.  Creating object on frontend (park.js stuff)
app.post('/park', function(req,res){
    let Park = new park ({"name" : req.body.name, "location" : req.body.location, "address": req.body.address, "description" : req.body.description , "images" : req.body.images});
    Park.save(err=>{
        if(err) return res.json({err});
        park.find().exec((err,response)=>{
            if(err) res.json({err});
            res.json(response);
        });
    });
})

// Get all parks
app.get('/park', function(req,res){
    park.find().exec((err,response)=>{
        if(err) return res.json({err});
        res.json(response);
    });
})

// Get single park ....... changing when Jake responds
app.get('/park/:id', function(req,res){
    let id = req.params.id;
    park.findOne({_id:id}).exec((err,response)=>{
        if(err) return res.json({err});
        res.json(response);
    });
})

// Delete a single park
app.delete('/park/:id', function(req,res){
    let id = req.params.id;
    park.remove({_id:id}).exec((err)=>{
        if(err) return res.json({err});
        park.find().exec((err,response)=>{
            if(err) res.json({err});
            res.json(response);
        })
    });
})


function createJWT(user) {
 var payload = {
   sub: user._id,
   iat: moment().unix(),
   exp: moment().add(14, 'days').unix()
 };
 return jwt.encode(payload, 'andysapp');
}

app.post('/auth/facebook', function(req, res) {
  var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: 'b1eb4b832dc45d2b9d51093462b2630c',
    redirect_uri: req.body.redirectUri
  };


  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      console.log(accessToken.error.message)
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      if (req.header('Authorization')) {
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createJWT(existingUser);
            console.log(token);
            return res.send({ token: token });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, 'andysapp');
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.facebook = profile.id;
            user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3. Create a new user account or return an existing one.
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createJWT(existingUser);
            return res.send({ token: token });
          }
          var user = new User();
          user.facebook = profile.id;
          user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.displayName = profile.name;
          user.save(function() {
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
})