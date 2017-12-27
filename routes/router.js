var express = require('express');
var router = express.Router();
var User = require('../models/users');

// rediction to create an User
router.get('/CreateAccount', function (req, res, next) {
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/CreateAccount.ejs');
})

// rediction for logIn User
router.get('/LogIn', function (req, res, next) {
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/LogIn.ejs');
})

// Creation and/or connection of an user
router.post('/', function(req, res, next){

    // Creation and connection
    if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {

        var userData = {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          passwordConf: req.body.passwordConf,
        };

        //use schema.create to insert data into the db
        // Creation of the account in the DataBase
        User.create(userData, function (err, user) {
          if (err) {
            return next(err)
          } else {
            req.session.userId = user._id;
            req.session.user = user;
            console.log("User created!" + user.email);
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});
          }
        });
      // Else if the app receive logmail and logpasswork --> Simpe connextion
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
            console.log("User connecte!" + user.email);
            // return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs');
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});
          }
        })
      // Other cases --> eroor
      } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
      }

})

// Get profile information , i have an eror here, cookies problem....
router.get('/profile', function(req, res, next){
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs');
})

// I receive the information correctly, I have to push the information of the databse. Work in progress
router.post('/profile/update', function(req, res, next){
    if (req.body.first_name &&  req.body.last_name)  {
      console.log(req.body.first_name + req.body.last_name);
    }
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});
})

// Homage for test : Connection and creation of the account OK
// Problem with profile.... Look line 66
router.get('/index', function (req, res, next) {
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/index.ejs');
})


module.exports = router;
