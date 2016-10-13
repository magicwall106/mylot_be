'use strict';
const _ = require('lodash');
const async = require('async');
const graph = require('fbgraph');
const User = require('../models/User');

exports.postApiAuthFacebook = (req, res, next) => {
  const access_token = req.body.access_token;
  const expires_in = req.body.expires_in;
  graph.setAccessToken(access_token);

  async.waterfall([
    function (done) {
      graph.get(`me?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, user) => {
        done(err, user);
      });
      //search access token == profile
    },
    function (user, done) {
      User.findOne({ email: user.email }, (err, existingUser) => {
        if (err) { done(err); }
        if (existingUser) {
          return res.status(200).json({ existing: true, user: existingUser });
        }
        newuser.email = user.email;
        newuser.facebook = user.id;
        newuser.phone = '';
        newuser.role = process.env.ROLE_USER;
        newuser.tokens.push({ kind: 'facebook', access_token });
        newuser.profile.fristname = user.first_name || '';
        newuser.profile.lastname = user.last_name || '';
        newuser.profile.website = user.link || '';
        newuser.profile.gender = user.gender || '';
        newuser.profile.location = user.locale || '';
        newuser.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;

        newuser.save((err) => {
          if (err) { done(err) }
          return res.status(200).json({ existing: faslse, user: newuser });
        });
      });
    }
  ], (err) => {
    if (err) { return res.status(400).json(err) }
  });
};