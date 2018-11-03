var mongoose = require("mongoose");

var FavouriteSchema = new mongoose.Schema({
  u_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  s_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story"
  }
});

module.exports = mongoose.model("Favourite", FavouriteSchema);
