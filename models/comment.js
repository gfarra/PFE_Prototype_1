var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  owner: {
    type: String,
    unique: false,
    required: true,
    trim: true,
  },
  event_ref: {
    type: mongoose.Schema.Types.ObjectId,
    unique: false,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    unique: false,
    required: true,
    trim: false,
  },
  like: {
    type: [String],
    unique: false,
    required: false,
    trim: false,
  },
  comment_picture: {
    link: String,
    unique: true,
    required: false,
    trim: true,
  },
)};

var eventus = mongoose.model('Comment', CommentSchema);
module.exports = comment;
