var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
  fb_id: String,
  name: String,
  points: String,
  date: String
});

module.exports = mongoose.model("User", UserSchema);
