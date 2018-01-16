var express = require('express');
var router = express.Router();
var User = require('../models/users');
var fs = require('file-system');
var multer = require('multer');

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

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

        var birthdayDate = new Date(2000, 1, 1, 0, 0, 0, 0);

        var userData = {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          profile : {
            first_name: '',
            last_name: '',
            description: '',
            first_name: '',
            birthday: birthdayDate,
          }
        };

        //use schema.create to insert data into the db
        // Creation of the account in the DataBase
        User.create(userData, function (err, user) {
          if (err) {
            return next(err)
          } else {
            req.session.userId = user._id;
            req.session.user = user;
            console.log("User created : " + user.email + " User ID :"+ req.session.userId + "\n");
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});
          }
        });
      // Else if the app receive logmail and logpasswork --> Simpe connextion
      } else if(req.body.logmail && req.body.logpassword) {
        User.authenticate(req.body.logmail, req.body.logpassword, function (error, user) {
          if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.status = 401;
            return next(err);
          } else {
            req.session.userId = user._id;
            req.session.user = user;
            console.log("User connected :" + user.email + "\n");
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
    console.log("User disconeted :" + req.session.user.username + "\n");
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
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs',  { userProfile: req.session.user} );
})

router.get('/profile/update/profile', requiresLogin, function( req, res, next){
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profileUpdate.ejs',  { userProfile: req.session.user} );
})


// I receive the information correctly, I ppdate correctly
router.post('/profile/update/profile', requiresLogin, function(req, res, next){

      var userDataUpdate = req.session.user;
      console.log(req.session.user);
      userDataUpdate = {
        profile: {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          birthday: req.body.birthday,
          email: req.body.email,
          description: req.body.description,
        }
      };

      console.log("Receive :" + userDataUpdate.profile.first_name + userDataUpdate.profile.last_name + "\n");

      // Creation of the account in the DataBase
      User.findByIdAndUpdate(req.session.userId, { $set: userDataUpdate }, function(err, user) {
        if (err) return handleError(err);

        req.session.save( function(eir) {
          req.session.reload( function (err) {
            req.session.user = userDataUpdate;
            console.log("User updated first name :" + userDataUpdate.profile + "\n");
          });
        });
      });

      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});

})

router.get('/profile/update/about', requiresLogin, function( req, res, next){
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/aboutUpdate.ejs',  { userProfile: req.session.user} );
})


// I receive the information correctly, I ppdate correctly
router.post('/profile/update/about', requiresLogin, function(req, res, next){

      var userDataUpdate = req.session.user;
      console.log(req.session.user);
      userDataUpdate = {
        about: {
          last_destination: req.body.last_destination,
          next_destination: req.body.next_destination,
          job: req.body.job,
          company: req.body.company,
          living_place: req.body.living_place,
          from: req.body.from,
        }
      };

      console.log("Receive new informations :" + userDataUpdate + "for user : " + req.session.user.username +  "\n");

      // Creation of the account in the DataBase
      User.findByIdAndUpdate(req.session.userId, { $set: userDataUpdate }, function(err, user) {
        if (err) return handleError(err);

        req.session.save( function(eir) {
          req.session.reload( function (err) {
            req.session.user = userDataUpdate;
            console.log("User updated : :" + req.session.user.username + "\n");
          });
        });
      });

      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});

})

// Get profile picture
router.post('/profile/picture',  requiresLogin, function(req, res, next){


  var userDataUpdate = req.session.user;

  /* console.log("Picture session : " + req.file.image.path);
  userDataUpdate = req.session.user;
  userDataUpdate = {
    profile_picture: fs.readFileSync(req.file.path),
    contentType: 'image/jpg',
  };
  console.log("Picture session : " + userDataUpdate);
  User.findByIdAndUpdate(req.session.userId, { $set: userDataUpdate }, function(err, user) {
    if (err) return handleError(err);

    req.session.save( function(eir) {
      req.session.reload( function (err) {
        req.session.user = userDataUpdate;
        console.log("User updated : :" + req.file + "\n");
      });
    });
  });


  */
  upload(req,res,function(err) {
      if(err) {
          return res.end("Error uploading file.");
      }

      console.log("User updated :" + req.file.path + "\n");
      userDataUpdate = {
        profile_picture: fs.readFileSync(req.file.path),
        contentType: 'image/jpg',
      };

      User.findByIdAndUpdate(req.session.userId, { $set: userDataUpdate }, function(err, user) {
        if (err) return handleError(err);

        req.session.save( function(eir) {
          req.session.reload( function (err) {
            req.session.user = userDataUpdate;
            console.log("User updated : :" + req.session.userId + "\n");
          });
        });
      });

      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user});

  });
});





// #####################################################


// ################# Event management ##################
router.get('/createEvent',requiresLogin, function( req, res, next){
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createEvent.ejs');
})

router.post('/createEvent', requiresLogin, function( req, res, next){
  // Creation and connection
  if (req.body.name && req.body.description && req.body.date ) {
    var eventData = {
      name: req.body.name,
      date: req.body.date,
      description: req.body.description,
      ownerUser: req.session.userId,
      administrator: req.session.userId,
      participants: req.session.userId,
      address: {
        building_number: req.body.building_number,
        street_name: req.body.street_name,
        city: req.body.city,
        post_code: req.body.post_code,
        country_code : req.body.country_code
      }
    };
    Eventus.create(eventData, function (err, eventus) {

      if (err) {
        return next(err)
      } else {
        req.session.event = eventus;
        console.log("The user : " +  req.session.user.username  + " create one event. ID : " + eventus.name + "Event name : " + eventus.name + "\n");
        return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/eventUpdate.ejs', { eventusOne: req.session.event });
      }
    });
  } else {
    var err = new Error('All fields required.');
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createEvent.ejs');
  }
})

router.get('/getEvent', requiresLogin, function( req, res, next){
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/getOneEvent.ejs')
})

router.post('/getOneEvent', requiresLogin, function( req, res, next){
  console.log(req.session.user.username + " : ask for event = " + req.body._id + "\n");

  var eventusV = {
    _id: req.body._id,
  }

  Eventus.findOne(eventusV, function(err, eventusV){
    if (err) return handleError(err);
    req.session.event = eventusV;
    console.log("We have found one event : " + eventusV.name + " for the user : " + req.session.user.username + "\n")
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayOneEvent.ejs', { eventusOne: req.session.event });
  })

})

router.get('/getAllEvents', requiresLogin, function( req, res, next){

  var owner = {
    ownerUser: req.session.userId,
  }

  Eventus.find(owner, function(err, eventus){
    if (err) return handleError(err);
    console.log("Research all events by ower. The owner is : " + req.session.user.username + "\n");
    req.session.event = eventus;
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayMyEvents.ejs', {eventusList: req.session.event});
  })

})

router.post('/updateEvent', requiresLogin, function( req, res, next){

  var updateHour = Date.now();
  if (req.body.name && req.body.description && req.body.date ) {
    var eventDataUpdate = {
      name: req.body.name,
      date: req.body.date,
      description: req.body.description,
      address: {
        building_number: req.body.building_number,
        street_name: req.body.street_name,
        city: req.body.city,
        post_code: req.body.post_code,
        country_code : req.body.country_code,
      },
      updated : updateHour,
    };

  Eventus.findByIdAndUpdate(req.body._id, { $set: eventDataUpdate }, function(err, eventusV) {

      if (err) return handleError(err);
      req.session.event = eventDataUpdate;
      req.session.event._id = req.body._id;
      console.log("Event updated : " +   eventDataUpdate.name + " by " + req.session.user.username + "\n" );
      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayOneEvent.ejs', { eventusOne: req.session.event });

      });
    }
})


router.get('/getEventList', requiresLogin, function(req, res, next){

  Eventus.find(function(err, eventListRequest){
    if (err) return handleError(err);
    console.log(" We found :" + eventListRequest + "\n");
    req.session.eventRequest = eventListRequest;

    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayEventList.ejs', { eventList: req.session.eventRequest });
  })

})
// #####################################################

// ################ user management ####################

router.get('/getUser', requiresLogin, function(req, res, next){
  return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/getUser.ejs')
})

router.post('/getUser', requiresLogin, function(req, res, next){
  var userRequest;




  if( req.body.username) {
    req.body.username = req.body.username.replace('/','');

    console.log(req.session.user.username + " : request this user profile by username => " + req.body.username + "\n");
    userRequest = {
      username: req.body.username,
    }

    User.findOne(userRequest, function(err, userRequest){
      if (err) return handleError(err);
      console.log(" We found :" + userRequest + "\n");
      req.session.userRequest = userRequest;
      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayUserProfile.ejs', { userRequest: req.session.userRequest });
    })
  } else if(req.body._id) {
    console.log(req.session.user.username + " : request this user profile by _id => " + req.body._id + "\n");

    userRequest = {
      _id: req.body._id,
    }

    User.findOne(userRequest, function(err, userRequest){
      if (err) return handleError(err);
      console.log(" We found :" + userRequest + "\n");
      req.session.userRequest = userRequest;
      return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayUserProfile.ejs', { userRequest: req.session.userRequest });
    })
  }
})

router.get('/getUserList', requiresLogin, function(req, res, next){

  User.find(function(err, userListRequest){
    if (err) return handleError(err);
    console.log(" We found :" + userListRequest + "\n");
    req.session.userRequest = userListRequest;
    console.log(" We found :" + req.session.userRequest + "\n");

    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayUserList.ejs', { userList: req.session.userRequest });
  })


})


module.exports = router;
