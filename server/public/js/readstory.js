$(document).ready(function() {
  $.get("/readstory/" + storyID, function(rtnStory) {
    if (!rtnStory.title) story = undefined;
    else story = rtnStory;
    displayStory();
  });
});
