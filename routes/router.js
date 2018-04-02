var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Eventus = require('../models/events');
var fs = require('file-system');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('userPhoto');



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
router.get('/index', function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/index.ejs');
})

// #####################################################

// ############## Account Management & connection ######
// rediction to create an User
router.get('/createAccount', function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createAccount.ejs');
})

// rediction for logIn User
router.get('/logIn', function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/logIn.ejs');
})

// Creation and/or connection of an user
router.post('/', function(req, res, next) {

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
            profile: {
                first_name: '',
                last_name: '',
                description: '',
                first_name: '',
                birthday: birthdayDate,
            }
        };

        // use schema.create to insert data into the db
        // Creation of the account in the DataBase
        User.create(userData, function(err, user) {
            if (err) {
                return next(err)
            } else {
                req.session.userId = user._id;
                req.session.user = user;
                console.log("User created : " + user.email + " User ID :" + req.session.userId + "\n");
                return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user });
            }
        });
        // Else if the app receive logmail and logpasswork --> Simpe connextion
    } else if (req.body.logmail && req.body.logpassword) {
        User.authenticate(req.body.logmail, req.body.logpassword, function(error, user) {
                if (error || !user) {
                    var err = new Error('Wrong email or password.');
                    err.status = 401;
                    return next(err);
                } else {


                    req.session.userId = user._id;
                    req.session.user = user;

                    var cutoff = new Date();
                    cutoff.setDate(cutoff.getDate());


                    var userIdRequest = {
                        _id: req.session.userId,
                    }

                    User.findOne(userIdRequest, function(err, userRequest) {
                        if (err) return handleError(err);
                        req.session.user.userRequest = userRequest;
                        var eventData = {
                            date: {
                                $lt: cutoff,
                            },
                            participants: req.session.user.userRequest._id,
                        };


                        Eventus.find(eventData, function(err, eventus) {
                            if (err) return handleError(err);
                            req.session.user.pastEvent = eventus;
                            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user });
                        })
                    });
                    //sreturn res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user });
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
router.get('/logout', requiresLogin, function(req, res, next) {
    if (req.session) {
        // delete session object
        console.log("User disconeted :" + req.session.user.username + "\n");
        req.session.destroy(function(err) {
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
router.get('/profile', requiresLogin, function(req, res, next) {
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate());


    var userIdRequest = {
        _id: req.session.userId,
    }

    User.findOne(userIdRequest, function(err, userRequest) {
        if (err) return handleError(err);
        req.session.user.userRequest = userRequest;
        var eventData = {
            date: {
                $lt: cutoff,
            },
            participants: req.session.user.userRequest._id,
        };


        Eventus.find(eventData, function(err, eventus) {
            if (err) return handleError(err);
            req.session.user.pastEvent = eventus;
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profile.ejs', { userProfile: req.session.user });
        })
    });
})

router.get('/profile/update/profile', requiresLogin, function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/profileUpdate.ejs', { userProfile: req.session.user });
})


// I receive the information correctly, I ppdate correctly
router.post('/profile/update/profile', requiresLogin, function(req, res, next) {

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

        req.session.save(function(eir) {
            req.session.reload(function(err) {
                req.session.user = user;
            });
        });
        res.redirect('/Profile');
    });


})

router.get('/profile/update/about', requiresLogin, function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/aboutUpdate.ejs', { userProfile: req.session.user });
})


// I receive the information correctly, I ppdate correctly
router.post('/profile/update/about', requiresLogin, function(req, res, next) {


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


    // Creation of the account in the DataBase
    User.findByIdAndUpdate(req.session.userId, { $set: userDataUpdate }, function(err, user) {
        if (err) return handleError(err);

        req.session.save(function(eir) {
            req.session.reload(function(err) {
                req.session.user = user;

            });
        });
        res.redirect('/Profile');
    });
})

// Get profile picture
router.post('/profile/picture', requiresLogin, function(req, res, next) {


    var userDataUpdate = req.session.user;

    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }

        console.log("User updated :" + req.file.path + "\n");
        userDataUpdate = {
            profile_picture: fs.readFileSync(req.file.path),
            contentType: 'image/jpg',
        };

        User.findByIdAndUpdate(req.session.userId, { $set: userDataUpdate }, function(err, user) {
            if (err) return handleError(err);

            req.session.save(function(eir) {
                req.session.reload(function(err) {
                    req.session.user = user;
                });
            });
        });

        res.redirect('/Profile');

    });
});

// #####################################################


// ################# Event management ##################
router.get('/createEvent', requiresLogin, function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createEvent.ejs', { userProfile: req.session.user });
})

router.post('/createEvent', requiresLogin, function(req, res, next) {
    // Creation and connection
    console.log("The user : " + req.body.name + " create one event. ID : " + req.body.description + "Event name : " + req.body.date + "\n");

    if (req.body.name && req.body.description && req.body.date) {
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
                country_code: req.body.country_code
            }
        };
        Eventus.create(eventData, function(err, eventus) {

            if (err) {
                return next(err)
            } else {
                req.session.user.event = eventus;
                console.log("The user : " + req.session.user.username + " create one event. ID : " + eventus.name + "Event name : " + eventus.name + "\n");
                return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/eventUpdate.ejs', { userProfile: req.session.user });
            }
        });
    } else {
        var err = new Error('All fields required.');
        return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/createEvent.ejs', { userProfile: req.session.user });
    }
})

router.get('/getEvent', requiresLogin, function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/getOneEvent.ejs', { userProfile: req.session.user })
})





router.get('/research', requiresLogin, function(req, res, next) {

    var researchev = {
        name: req.query.name,
    };

    var researchus = {
        username: req.query.name,
    };

    Eventus.find(researchev, function(err, eventusV) {
        if (err) return handleError(err);
        req.session.user.eventRequest = eventusV;

        console.log(req.session.user.eventRequest + "\n");

        User.find(researchus, function(err, user) {
            if (err) return handleError(err);
            req.session.user.userRequest = user;

            console.log(req.session.user.userRequest + "\n");
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/research.ejs', { userProfile: req.session.user });
        })


    });

})
const util = require('util')
router.get('/GetOneEvent', requiresLogin, function(req, res, next) {

    var eventusV;
    console.log(req.query._id + "\n");

    if (req.query._id) {
        eventusV = {
            _id: req.query._id,
            name: req.query.name,
        }
        console.log(req.query._id + "\n");

        Eventus.find(eventusV, function(err, eventusV) {
            if (err) return handleError(err);
            req.session.user.event = eventusV;
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayOneEvent.ejs', { userProfile: req.session.user });
        })

    } else {
        console.log(" BUG" + "\n");
    }


})

router.get('/editOneEventId', requiresLogin, function(req, res, next) {
    console.log(req.session.user.username + " : ask for event = " + req.body.name + "\n");

    var eventusV = {
        _id: req.query._id,
    };

    Eventus.findOne(eventusV, function(err, eventusV) {
        if (err) return handleError(err);
        req.session.user.event = eventusV;
        console.log("We have found one event : " + eventusV.name + " for the user : " + req.session.user.username + "\n")
        return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/eventUpdate.ejs', { userProfile: req.session.user });
    })

})

router.get('/getAllEvents', requiresLogin, function(req, res, next) {

    var owner = {
        ownerUser: req.session.userId,
    };

    Eventus.find(owner, function(err, eventus) {
        if (err) return handleError(err);
        console.log("Research all events by ower. The owner is : " + eventus + "\n");
        req.session.user.eventList = eventus;
        console.log("Research all events by ower. The owner is : " + req.session.user.eventList + "\n");
        return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayMyEvents.ejs', { userProfile: req.session.user });
    });

})

router.post('/updateEvent', requiresLogin, function(req, res, next) {

    var updateHour = Date.now();
    if (req.body.name && req.body.description && req.body.date) {
        var eventDataUpdate = {
            name: req.body.name,
            date: req.body.date,
            description: req.body.description,
            address: {
                building_number: req.body.building_number,
                street_name: req.body.street_name,
                city: req.body.city,
                post_code: req.body.post_code,
                country_code: req.body.country_code,
            },
            updated: updateHour,
        };

        Eventus.findByIdAndUpdate(req.body._id, { $set: eventDataUpdate }, function(err, eventusV) {

            if (err) return handleError(err);
            req.session.user.event = eventusV;
            req.session.user.event._id = req.body._id;
            console.log("Event updated : " + eventDataUpdate.name + " by " + req.session.user.username + "\n");
            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayOneEvent.ejs', { userProfile: req.session.user });

        });
    }
})


router.post('/Event/picture', requiresLogin, function(req, res, next) {


    var eventus = req.session.user;

    upload(req, res, function(err) {
        if (err) {
            console.log(req.body._id + "\n");
            console.log("Event updated :" + req.file + "\n");
            return res.end("Error uploading file." + req.body._id);
        }

        console.log("Event updated :" + req.file.path + "\n");
        EventDataUpdate = {
            _id: req.body._id, // ADD ID,
            event_picture: fs.readFileSync(req.file.path),
            contentType: 'image/jpg',
        };

        Eventus.findByIdAndUpdate(req.session.user, { $set: userDataUpdate }, function(err, user) {
            if (err) return handleError(err);

            req.session.save(function(eir) {
                req.session.reload(function(err) {
                    req.session.user = user;
                });
            });
        });

        res.redirect('/Profile');

    });
});


router.get('/getEventList', requiresLogin, function(req, res, next) {

        Eventus.find(function(err, eventListRequest) {
            if (err) return handleError(err);
            console.log(" We found :" + eventListRequest + "\n");
            req.session.user.eventList = eventListRequest;

            return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayEventList.ejs', { userProfile: req.session.user });
        });

    })
    // #####################################################

// ################ user management ####################

router.get('/getUser', requiresLogin, function(req, res, next) {
    return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/getUser.ejs', { userProfile: req.session.user })
})

router.get('/getUsername', requiresLogin, function(req, res, next) {
    var userRequest;

    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate());


    if (req.query._id) {
        console.log(req.session.user._id + " : request this user profile by username => " + req.query._id + "\n");
        userRequest = {
            _id: req.query._id,
        }

        User.findOne(userRequest, function(err, userRequest) {
            if (err) return handleError(err);
            req.session.user.userRequest = userRequest;
            var eventData = {
                date: {
                    $lt: cutoff,
                },
                participants: req.session.user.userRequest._id,
            };

            Eventus.find(eventData, function(err, eventus) {
                if (err) return handleError(err);
                req.session.user.pastEvent = eventus;
                return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayUserProfile.ejs', { userProfile: req.session.user });
            })


        })
    } else {
        console.log(" BUG" + "\n");
    }
})

router.get('/getUserList', requiresLogin, function(req, res, next) {

    User.find(function(err, userListRequest) {
        if (err) return handleError(err);
        console.log(" We found :" + userListRequest + "\n");
        req.session.user.userList = userListRequest;
        console.log(" We found :" + req.session.user.userRequest + "\n");

        return res.render('C:/Users/Gabriel/Documents/GitHub/PFE_Prototype_1/views/pages/displayUserList.ejs', { userProfile: req.session.user });
    })
})

module.exports = router;