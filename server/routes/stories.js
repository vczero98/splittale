var express    = require("express"),
    middleware = require("../middleware"),
    router     = express.Router(),
    logging    = require("../logging"),
    Story      = require("../models/story");

module.exports = function(storyHandler) {
  router.get("/write", middleware.isLoggedIn, function(req, res) {
    res.render("write");
  });

  router.get("/getstory", middleware.isLoggedIn, function(req, res) {
    var story = storyHandler.getAnyStoryToEdit(req.user._id);
    // var storyNum = storyCount++ % stories.length;
    // console.log("Replying with " + story)

    res.send(story);
  });

  router.post("/addwords", middleware.isLoggedIn, function(req, res) {
    var newWords = req.body.words.split(" ").filter(x => x !== "");
    var storyID = req.body._id;

    res.send(storyHandler.submitEdit(storyID, newWords, req.user._id));
  });

  router.get("/my-stories", middleware.isLoggedIn, function(req, res) {
    Story.find({author: req.user._id}, function(err, stories) {
      if (err) {
        logging.error(err);
        res.redirect("/");
      } else {
        res.render("mystories", {stories: stories});
      }
    });
  });

  return router;
}

function appendWords(words) {
  var string = "";
  words.forEach(word => {
    string += word + " ";
  });

  // Remove last space
  return string.substr(0, string.length - 1);
}
