var express    = require("express"),
    middleware = require("../middleware"),
    router     = express.Router(),
    logging    = require("../logging"),
    mongoose   = require("mongoose"),
    Story      = require("../models/story"),
    Favourite  = require("../models/favourite");

module.exports = function(storyHandler) {
  router.get("/write", middleware.isLoggedIn, function(req, res) {
    res.render("write");
  });

  router.get("/getstory", middleware.isLoggedIn, function(req, res) {
    var story = storyHandler.getAnyStoryToEdit(req.user._id);

    if (story) {
      // Check if the story is in favourites
      Favourite.count({u_id: req.user._id, s_id: story._id}, function(err, count) {
        if (err) {
          logging.error(err);
        } else {
          var returnStory = story.toObject();
          returnStory.isFavourite = count > 0;
          res.send(returnStory);
        }
      });
    } else {
      res.send(story);
    }
  });

  router.post("/addwords", middleware.isLoggedIn, function(req, res) {
    var newWords = req.body.words.split(" ").filter(x => x !== "");
    var storyID = req.body._id;

    res.send(storyHandler.submitEdit(storyID, newWords, req.user._id));
  });

  // Stories - NEW route
  router.get("/stories/new", middleware.isLoggedIn, function(req, res) {
    res.render("new-story");
  });

  // Stories - INDEX route
  router.get("/stories/:id", function(req, res) {
    res.render("story", {storyID: req.params.id});
  });

  // Stories - CREATE route
  router.post("/stories", middleware.isLoggedIn, function(req, res) {
    var title = req.body.title;
    var words = req.body.start;
    words = words.split(" ").filter(x => x !== "");
    var category = req.body.category;
    logging.info("Request for new story " + title + " " + words + " " +  category + " from " + req.user._id);
    var error = storyHandler.createStory(title, words, category, req.user._id);
    res.send(error);
  });

  // Favourites - INDEX route
  router.get("/favourites", middleware.isLoggedIn, function(req, res) {
    Favourite.find({u_id: req.user._id}).
    populate("s_id", "_id title words.a category").
    exec(function(err, favs) {
      if (err) {
        logging.error(err);
        res.redirect("/");
      } else {
        var stories = [];
        favs.forEach((fav) => {stories.push(fav.s_id)});
        res.render("favourites", {stories: stories});
      }
    });
  });

  // Stories - NEW route
  router.get("/readstory/:id", function(req, res) {
    res.send(storyHandler.getStoryToRead(req.params.id));
  });

  router.get("/my-stories", middleware.isLoggedIn, function(req, res) {
    Story.find({author: req.user._id}).select("_id title words.a category").exec(function(err, stories) {
      if (err) {
        logging.error(err);
        res.redirect("/");
      } else {
        stories = stories.sort((a, b) => b.words.length - a.words.length);
        res.render("mystories", {stories: stories});
      }
    });
  });

  // Favourites - CREATE route
  router.post("/favourites", middleware.isLoggedIn, function(req, res) {
    var storyID = req.body._id;
    if (!mongoose.Types.ObjectId.isValid(storyID)) {
      res.send(false);
    } else {
      // Check if the story exists
      Story.count({_id: storyID}, function(err, count) {
        if (err) {
          logging.error(err);
          res.send(false);
        } else {
          if (count == 0) {
            res.send(false);
          } else {
            checkIfInFavourites();
          }
        }
      });
    }

    function checkIfInFavourites() {
      Favourite.count({u_id: req.user._id, s_id: storyID}, function(err, count) {
        if (err) {
          res.send(false);
        } else {
          if (count > 0) {
            res.send(false);
          } else {
            addFavourite();
          }
        }
      })
    }

    function addFavourite() {
      Favourite.create({u_id: req.user._id, s_id: storyID}, function(err) {
        if (err) {
           res.send(false);
        } else {
           res.send(true);
        }
      });
    }
  });

  // Favourites - DESTROY route
  router.delete("/favourites/:id", middleware.isLoggedIn, function(req, res) {
    var storyID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(storyID)) {
      res.send(false);
    } else {
      Favourite.deleteOne({u_id: req.user._id, s_id: storyID}, function(err) {
        if (err) {
          res.send(false);
        } else {
          res.send(true);
        }
      });
    }
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
