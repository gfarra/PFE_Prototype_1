var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);

var app           = express();
var port          = 8000;
var url           = 'mongodb://localhost:27017/db_app';

//connect to MongoDB
mongoose.connect(url);
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log("We're connected!");
});

// parse incoming requests
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// include routes
var routes = require('./routes/router');
app.use('/', routes);

// listen on port
app.listen(port, function () {
  console.log('Express app listening on port' + port);
});