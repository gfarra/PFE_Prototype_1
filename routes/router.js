var express = require('express');
var router = express.Router();
var User = require('../models/users');

var Eventus = require ('../models/events');

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

// ################## INDEX #############################

// Homa page for test : Connection and creation of the account OK
// problem with profile, look get profile
router.get('/index', function (req, res, next) {
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/index.ejs');
})

// #####################################################

// ############## Account Management & connection ######
// rediction to create an User
router.get('/createAccount', function (req, res, next) {
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createAccount.ejs');
})

// rediction for logIn User
router.get('/logIn', function (req, res, next) {
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/logIn.ejs');
})

// Creation and/or connection of an user
router.post('/', function(req, res, next){

    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
      var err = new Error('Passwords do not match.');
      err.status = 400;
      res.send("passwords dont match");
      return next(err);
    }

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
            console.log("User created : " + user.email + " \n User ID :"+ req.session.userId);
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
            console.log("User connected :" + user.email);
            // return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/Profile.ejs');
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

// GET for logout logout
router.get('/logout', requiresLogin, function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/index.ejs');
      }
    });
  }
});
// #####################################################

// ############## Own user profile Management ##########
router.get('/profile', requiresLogin, function( req, res, next){
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs');
})

// I receive the information correctly, I ppdate correctly
router.post('/profile/update', requiresLogin, function(req, res, next){
      req.session.reload(function(err) {
        req.session.userId = req.body._id;
      });
      console.log(  req.session.userId );

    if (req.body._id && req.body.first_name &&  req.body.last_name)  {

      var userDataUpdate = {
        first_name: req.body.first_name,
        last_name: req.body.last_name
      };

      console.log("Receive :" + userDataUpdate.first_name + userDataUpdate.last_name);

      // Creation of the account in the DataBase
      User.findByIdAndUpdate(req.session.userId, { $set: userDataUpdate }, function(err, user) {
        if (err) return handleError(err);

        req.session.save( function(eir) {
          req.session.reload( function (err) {
            req.session.user.last_name = userDataUpdate.last_name;
            req.session.user.first_name = userDataUpdate.first_name;
            console.log("User updated :" +   userDataUpdate.first_name + " and " + userDataUpdate.last_name);
          });
        });
      });

      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});

    } else {
      console.log("Bug");
    }

})
// #####################################################


// ################# Event management ##################
router.get('/createEvent',requiresLogin, function( req, res, next){
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createEvent.ejs');
})

router.post('/createEvent', requiresLogin, function( req, res, next){
  // Creation and connection
  console.log(req.session.user);
  if (req.body.name && req.body.date && req.body.building_number && req.body.street_name && req.body.city && req.body.post_code && req.body.country_code) {
    console.log("Var Load...");
    var eventData = {
      name: req.body.name,
      date: req.body.date,
      ownerUser: req.session.userId,
      address: {
        building_number: req.body.building_number,
        street_name: req.body.street_name,
        city: req.body.city,
        post_code: req.body.post_code,
        country_code : req.body.country_code
      }
    };
    console.log(eventData);
    Eventus.create(eventData, function (err, eventus) {
      console.log("Func create");
      if (err) {
        return next(err)
      } else {
        console.log("Event created!" + eventus._id);
        return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});
      }
    });
  } else {
    var err = new Error('All fields required.');
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createEvent.ejs');
  }
})

router.get('/getEvent', requiresLogin, function( req, res, next){
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/getOneEvent.ejs')
  //res.redirect('/getOneEvent?_id=' + req.body._id);
})

router.post('/getOneEvent', requiresLogin, function( req, res, next){
  console.log(req.session.userId + " : ask for event = " + req.body._id);

  var eventusV = {
    _id: req.body._id,
  }

  console.log("#####################");

  Eventus.findOne(eventusV, function(err, eventusV){
    if (err) return handleError(err);
    console.log(eventusV);
    req.session.event = eventusV;
    console.log("#####################");
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayOneEvent.ejs', { eventusOne: req.session.event });
  })

})

router.get('/getAllEvents', requiresLogin, function( req, res, next){
  console.log(req.session.user);
  console.log(req.session.userId);
  var owner = {
    ownerUser: req.session.userId,
  }
  console.log("#####################");

  Eventus.find(owner, function(err, eventus){
    if (err) return handleError(err);
    console.log(eventus);
    console.log("#####################");
  })

  return eventus;
})

router.post('/updateEvent', requiresLogin, function( req, res, next){
  console.log(req.body._id);
  console.log(req.session.userId);

  var eventDataUpdate = {
    _id: req.body._id,
    name: req.body.name,
    date: req.body.date,
    ownerUser: req.session.userId,
    address: {
      building_number: req.body.building_number,
      street_name: req.body.street_name,
      city: req.body.city,
      post_code: req.body.post_code,
    }
  };
  console.log(eventDataUpdate);

  Eventus.findByIdAndUpdate(eventDataUpdate._id, { $set: eventDataUpdate }, function(err, eventusV) {

      if (err) return handleError(err);
      req.session.event = eventusV;
      console.log("Event updated :" +   eventDataUpdate.name );
      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayOneEvent.ejs', { eventusV: req.session.event });

      });

})
// #####################################################

// ################ user management ####################

router.get('/getUser', requiresLogin, function(req, res, next){
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/getUser.ejs')
})

router.post('/getUser', requiresLogin, function(req, res, next){
  var userRequest;

  if( req.body.username) {
    console.log(req.session.userId + " : request this user profile by username => " + req.body.username);

    userRequest = {
      username: req.body.username,
    }

    User.findOne(userRequest, function(err, userRequest){
      if (err) return handleError(err);
      console.log(" We found :" + userRequest);
      req.session.userRequest = userRequest;
      console.log("#####################");
      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayUserProfile.ejs', { userRequest: req.session.userRequest });
    })
  } else if(req.body._id) {
    console.log(req.session.userId + " : request this user profile by _id => " + req.body._id);

    userRequest = {
      _id: req.body._id,
    }

    User.findOne(userRequest, function(err, userRequest){
      if (err) return handleError(err);
      console.log(" We found :" + userRequest);
      req.session.userRequest = userRequest;
      console.log("#####################");
      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayUserProfile.ejs', { userRequest: req.session.userRequest });
    })
  }
})

router.get('/getUserList', requiresLogin, function(req, res, next){
  var userList;

  User.find(function(err, userList){
    if (err) return handleError(err);
    console.log(userList);
    console.log("#####################");
    req.session.userRequest = userList

    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/userList.ejs', { userList: req.session.userList });

  })
})




module.exports = router;
