var mongoose = require("mongoose");

var StorySchema = new mongoose.Schema({
	author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  category: Number,
  title: String,
  words: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("Story", StorySchema);
