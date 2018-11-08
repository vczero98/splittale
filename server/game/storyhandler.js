var Story = require("../models/story"),
    logging = require("../logging");

function StoryHandler() {
  var self = this;
  var stories = [];
  const lockTime = 3 * 60 * 1000;
  var lockCtr = 0;

  var storyLocks = [];
  // Read the stories from the database
  self.start = function() {
    Story.find({}).populate("author", "fb_id name").populate("words.author", "fb_id name points").exec(function(err, foundStories) {
      foundStories.forEach((foundStory) => {
        stories.push(foundStory);
      });
    });
  }

  self.getAnyStoryToEdit = function(userID) {
    // Create an array of stories to pick from
    var availableStories = [];
    for (var i = 0; i < stories.length; i++) availableStories.push(i);

    /* Select a story at random, check if it can be edited
     * Try until no stories can are available
     */
    while (availableStories.length > 0) {
      var indexToTry = Math.floor(Math.random() * availableStories.length);
      var storyToCheck = stories[availableStories[indexToTry]];
      // TODO: Add checking for last editor
      var checkLock = isStoryLocked(storyToCheck._id);
      if (checkLock.locked && checkLock.lockedBy != userID) {
        availableStories.splice(indexToTry, 1);
      } else {
        lockStory(storyToCheck._id, userID) // Lock story for exclusice editing
        return storyToCheck;
      }
    }

    // No available stories for editing
    return null;
  }

  self.getStoryToRead = function(storyID) {
    return getStoryByID(storyID);
  }

  self.submitEdit = function(storyID, newWords, userID) {
    var story = getStoryByID(storyID);
    if (story == undefined)
      return {error: "Story not found"};
    var lockCheck = isStoryLocked(storyID)
    if (lockCheck.locked && lockCheck.lockedBy != userID)
      return {error: "Story is being edited by someone else"};
    if (!validateInput(newWords, 5))
      return {error: "Words are not valid"};

      // Submit modified story to database;
      var query = {$push: {words: {text: appendWords(newWords), author: userID}}};
      var toExec = Story.findOneAndUpdate({_id: storyID}, query, {new: true});
      toExec = toExec.populate("author", "name fb_id");
      toExec = toExec.populate("words.author", "name fb_id points");
      toExec.exec(function(err, newStory) {
      if (err) return {error: "Error adding to database," + err};
      else {
        story = newStory;
        unlockStory(storyID, userID);
        findAndUpdateStory(storyID, story);
      }
    });
  }

  self.createStory = function(title, words, category, userID) {
    if (title == undefined || title == "")
      return {error: "Invalid title"};
    if (words == undefined || !validateInput(words, 15))
      return {error: "Invalid text"};
    if (category == undefined || category == "" || isNaN(category) || category < 0)
      return {error: "Invalid category"};

    var newStory = new Story({
      title: title,
      author: userID,
      category: category,
      words: [{text: words, author: userID}]
    });

    var promise = newStory.save();
    if (!(promise instanceof Promise)) {
      return {error: "Could not save story"};
    }

    promise.then(function(retStory) {
      retStory.populate("author", "fb_id name").
      populate({path: "words.author", select: "fb_id name points"}, function(err, s) {
        if (err) {
          return {error: "Could not save story"};
        }
        stories.push(s);
      });
    });

    return {error: null};
  }

  function getStoryByID(storyID) {
    return stories.find((s) => s._id == storyID);
  }

  function findAndUpdateStory(storyID, story) {
    for (var i = 0; i < stories.length; i++) {
      if (stories[i].id == storyID) {
        stories[i] = story;
        return;
      }
    }
  }

  function isStoryLocked(storyID) {
    for (var i = 0; i < storyLocks.length; i++)
      if (storyLocks[i].story == storyID) return {locked: true, lockedBy: storyLocks[i].user};
    return {locked: false};
  }

  // Locks the story
  function lockStory(storyID, userID) {
    if (isStoryLocked(storyID).locked) return false;
    unlockFromUser(userID); // Unlock any other stories, user can only lock one story
    var lockID = lockCtr++;
    storyLocks.push({id: lockID, story: storyID, user: userID});
    logging.info("locked " + storyID + " for " + userID + ", id: " + lockID);
    setLockTimer(storyID, userID, lockID);
  }

  function setLockTimer(storyID, userID, lockID) {
    setTimeout(() => unlockStory(storyID, userID, lockID), lockTime);
  }

  function unlockFromUser(userID) {
    for (var i = 0; i < storyLocks.length; i++) {
      if (storyLocks[i].user == userID) {
        logging.info("unlocked " + storyLocks[i].story + " from " + userID);
        storyLocks.splice(i, 1);
      }
    }
  }

  // Unlocks the story if it is locked by the user
  function unlockStory(storyID, userID, lockID) {
    var index = -1;
    for (var i = 0; i < storyLocks.length; i++) {
      if (storyLocks[i].story == storyID) {
        if (storyLocks[i].user == userID) {
          // Don't run if there is a lockID but it doesn't match
          if (!(lockID !== undefined && !(storyLocks[i].id === lockID))) {
            storyLocks.splice(i, 1);
            logging.info("unlocked " + storyID + " from " + userID + ", id: " + lockID);
          }
        }
        return;
      }
    }
  }
}

// Returns true if input words are valid
function validateInput(words, maxLength) {
  var invalidWords = ["apple", "banana", "pear", "gergo"];
  var valid = true;
  valid &= words.length > 0;
  valid &= words.length <= maxLength;
  invalidWords.forEach((invalidWord) => {
    valid &= !words.includes(invalidWord);
  });
  return valid;
}

// Coverts words array to one string
function appendWords(words) {
  var string = "";
  words.forEach(word => {
    string += word + " ";
  });

  // Remove last space
  return string.substr(0, string.length - 1);
}

module.exports = StoryHandler;
