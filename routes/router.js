var express = require('express');
var router = express.Router();
var User = require('../models/users');


router.post('/CreateUser', function(req, res, next){
console.log("OK");
  if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
      console.log("OK");
      var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        passwordConf: req.body.passwordConf,
      }

      //use schema.create to insert data into the db
      User.create(userData, function (err, user) {
        if (err) {
          return next(err)
        } else {
          console.log("User created!");
          return res.redirect('/profile');
        }
      });
    }


})

module.exports = router;
