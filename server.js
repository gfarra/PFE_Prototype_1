var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var multer = require('multer');

var app = express();
var port = 8000;
var url = 'mongodb://localhost:27017/db_app_v0';

// set the view engine to ejs
app.set('view engine', 'ejs');

//connect to MongoDB
mongoose.connect(url);
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log("We're connected!");
});

app.use(express.static(__dirname + '/public'));

//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// parse incoming requests
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// include routes
var routes = require('./routes/router');
app.use('/', routes);

app.use(function(req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});


// listen on port
server = app.listen(port, function() {
    console.log('Express app listening on port ' + port);
});

//socket.io instantiation
const io = require("socket.io")(server)

io.on('connection', (socket) => {
    console.log('New user connected')


    //default username
    socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: socket.username });
    })

    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    })
})