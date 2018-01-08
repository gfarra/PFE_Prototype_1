var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile:{
      first_name: {
        type: String,
        unique: false,
        required: false,
        trim: false,
      },
      last_name: {
        type: String,
        unique: false,
        required: false,
        trim: false,
      },
      profile_picture: {
        type: String,
        unique: false,
        required: false,
        trim: true,
      },
      birthday: {
        type: Date,
        unique: false,
        required: false,
      },
      email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        unique: false,
        required: false,
        trim: false,
      },
    },
    about: {
      next_destination: {
        type: String,
        unique: false,
        required: false,
        trim: true,
      },
      last_destination: {
        type: String,
        unique: false,
        required: false,
        trim: false,
      },
      last_friends_added: {
        type: [mongoose.Schema.Types.ObjectId],
        unique: false,
        required: false,
        trim: false
      },
      from : {
        type: String,
        unique: false,
        required: false,
        trim: false
      },
      job : {
        type: String,
        unique: false,
        required: false,
        trim: false
      },
      company : {
        type: String,
        unique: false,
        required: false,
        trim: false
      },
      living_place : {
        type: String,
        unique: false,
        required: false,
        trim: false
      },
    },
    friends_list: {
      type: [mongoose.Schema.Types.ObjectId],
      unique: false,
      required: false,
      trim: false,
    },
    pictures : {
        type: [String],
        required: false,
    },
    visited_country_list: {
        type: [Number],
        required: false,
    },
    last_events: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
    },
    next_events: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
    },


});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

// Hash of password
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
