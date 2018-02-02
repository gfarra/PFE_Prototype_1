var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: false,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    unique: false,
    required: false,
    trim: true,
  },
  ownerUser: {
    type: String,
    unique: false,
    required: true,
    trim: true,
  },
  administrator: {
    type: [String],
    unique: false,
    required: true,
    trim: true,
  },
  participants: {
    type: [String],
    unique: false,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  address: {
    building_number: Number,
    street_name: String,
    city: String,
    post_code: Number,
    country_code: Number,
    gps_latitude: Number,
    gps_longitude: Number,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  creation_date: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  pictures : {
      type: [String],
      required: false,
  },
  event_picture: {
      type: [String],
      required: false,
  },
  like: {
    type: [String],
    unique: false,
    required: false,
    trim: false,
  },
});

// Event is already take, I choose -> latin word : "eventus"...
var eventus = mongoose.model('Event', EventSchema);

module.exports = eventus;
