# PFE_Prototype_1
Début du projet - Meeting network

I have develop :
-> Creation User Database - Done

Function : 
Creation of an user - Done
Connection - Done
Hash password - Done
Request user profile - Done

Problems:
Add information - Done the 27/12/2017
Modifie informations - Done the 27/12/2017


27/12/2017: 
Create event DataBase - Done
Add information in user database - Done the 27/12/2017
Modifie informations in user database - Done the 27/12/2017

Problems minor 27/12/2017:
Add information in user database - Problem of refresh in the HTML page after adding informations
Modifie informations in user database - Problem of refresh in the HTML page after the modification of informations

Urgent problem 27/12/2017:
Accès to profile tab - Not working.

28/12/2017
I have to create some Functions :
Create one event
Modifie one event
Request one event
Request all events

// Account creation and loggin or loggin.
router.post('/) {
  req.body.email && req.body.username && req.body.password && req.body.passwordConf
  OR 
  req.body.logmail && req.body.logpassword
  
  --> send object var = userProfile
}

router.get(/profile , requiresLogin) {
   req.session.user
   
   --> send object var = userProfile
}

router.get(/logout , requiresLogin) {}

// Actually allow to modifie first and last name
router.post(/profile/update) {
  req.body._id && req.body.first_name &&  req.body.last_name
  
   --> Return home page
}


//Create an event, I have to modifie the way to set up the date, the day is correct but not the time
router.post(/createEvent , requiresLogin) {
  req.body.name && req.body.date && req.body.building_number && req.body.street_name && req.body.city && req.body.post_code && req.body.country_code
  
  
   --> send object  var = eventusOne
}

router.post('/getOneEvent', requiresLogin ){
  req.body._id && req.session.user.username
  
  --> send object  var = eventusOne
})

router.get('/getAllEvents, requiresLogin){
  req.session.userId
  
  
  --> send object var = eventusList
}

router.post('/updateEvent', requiresLogin) {
    req.body.name && req.body.date && req.body.building_number && req.body.street_name && req.body.city && req.body.post_code && req.body.country_code
  
   --> send object var = eventusOne
}

router.post('/getUser', requiresLogin) {
  req.body.username
  OR
  req.body._id
  
  --> send object var = userRequest
}

router.get('/getUserList', requiresLogin) {

   --> send object var = userList
}
