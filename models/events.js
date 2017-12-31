var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  description: {
    type: String,
    unique: false,
    required: false,
    trim: false
  },
  ownerUser: {
    type: mongoose.Schema.Types.ObjectId,
    unique: false,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  address: {
    building_number: Number,
    street_name: String,
    city: String,
    post_code: Number,
    country_code: Number
  },
  updated: {
    type: Date,
    default: Date.now
  },
  creation: {
    type: Date,
    default: Date.now
  }
});

// Event is already take, I choose -> latin word : "eventus"...
var eventus = mongoose.model('Event', EventSchema);
module.exports = eventus;