var express = require('express');
var router = express.Router();
var User = require('../models/users');


router.post('/', function(req, res, next){

    if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {

        var userData = {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          passwordConf: req.body.passwordConf,
        };

        //use schema.create to insert data into the db
        User.create(userData, function (err, user) {
          if (err) {
            return next(err)
          } else {
            req.session.userId = user._id;
            console.log("User created!");
            return res.redirect('/profile');
          }
        });
      } else if(req.body.logmail && req.body.logpassword) {
        console.log("ID reveived");
        User.authenticate(req.body.logmail, req.body.logpassword, function (error, user) {
          if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.status = 401;
            return next(err);
          } else {
            req.session.userId = user._id;
            req.session.user = user;
            console.log(user);
            // return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs');
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});
          }
        })

      } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
      }

})

router.post('/profile/update', function(req, res, next){
    if (req.body.first_name &&  req.body.last_name)  {
      console.log(req.body.first_name + req.body.last_name);
    }
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});
})

router.get('/index', function (req, res, next) {
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/index.ejs');
})

module.exports = router;
