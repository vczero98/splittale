var categories = new Categories();
var levels = new Levels();

var story;

$("#input-text").on("input", function() {
 updateEntry();
});

// Favourites button
$("#btn-favourite").click(function() {
  if (story.isFavourite) {
    $.ajax({url: "/favourites/" + story._id, type: 'DELETE', success: function(data) {
      story.isFavourite = false;
      updateFavouriteButton();
    }});
  } else {
    $.post("/favourites", {_id: story._id}, function(data) {
      if (data) {
        story.isFavourite = true;
        updateFavouriteButton();
      }
    });
  }
});

function updateFavouriteButton() {
  var button = $("#btn-favourite");
  var text = $("#txt-favourite");
  if (story.isFavourite) {
    button.addClass("fas").removeClass("far");
    text.text("Remove favourite");
  } else {
    button.addClass("far").removeClass("fas");
    text.text("Add favourite");
  }
}

// Share button
$("#btn-share").click(function() {
  $("#shareModal").modal('show');
});

$("#share-link").on("input", function() {
  $(this).val("https://www.splittale.com/stories/" + story._id);
});

function copyToClipboard() {
  $("#share-link").select();
  document.execCommand('copy');
  $("#btn-copy-to-cl").text("Copied to clipboard");
  setTimeout(() => {$("#btn-copy-to-cl").text("Copy to clipboard")}, 5000)
}

// Update when the user's input changes
function updateEntry() {
  // Add text to story
  var inputWords = $("#input-text").val().split(" ").filter(x => x !== "");
  $("#player-text").text("");
  $("#player-text-too-long").text("");
  for (var i = 0; i < inputWords.length; i++) {
    if (i < 5) {
      $("#player-text").text($("#player-text").text() + inputWords[i] + " ");
    } else {
       $("#player-text-too-long").text($("#player-text-too-long").text() + inputWords[i] + " ");
    }

  }
  var button = $("#new-text button");
  if ($("#input-text").val() == "") {
    button.addClass("text-primary");
    button.text("Skip →");
    button.removeClass("text-info");
    button.removeClass("text-orange");
  } else {
    button.addClass("text-info");
    button.text("Add to story");
    button.removeClass("text-primary");
    button.removeClass("text-orange");
  }
}

$(document).ready(function() {
  var story = getStory(function() {
    displayStory();
  });
  $("#new-text button").click(function() {
    nextStory();
  });
});

$('body').bind('focusin focus', function(e){
  e.preventDefault();
})

function getStory(next) {
  $.get("/getstory", { name: "John", time: "2pm" }, function(data) {
    story = data;
    if (typeof next === "function") next();
  });
}

function sendStory(next) {
  $.post("/addwords", { _id: story._id, words: $("#input-text").val() }, function(data) {
    if (typeof next === "function") next(data);
  });
}

// Requires story variable to be set up
function displayStory() {
  if (story) {
    $("#story").show();
    $("#no-story").hide();
    $("#story-title").text(story.title);
    $("#story-author").text(story.author.name);
    $("#story-author-photo").attr("src", "");
    $("#story-author-photo").hide();
    addFacebookPhotoAuthor(story.author.fb_id);
    updateFavouriteButton();
    $("#share-link").val("https://splittale.com/stories/" + story._id);

    var category = categories.categoryFromID(story.category);
    if (category) $("#story-category").text(category);
    $("#input-text").val("");
    updateEntry();
    var paragraph = $("#story-main p");
    paragraph.empty();
    for (var i = 0; i < story.words.length; i++) {
      var div = document.createElement("div");
      var toolTipDiv = document.createElement("div");
      $(toolTipDiv).addClass("my-tooltip");
      var textSpan = document.createElement("span");
      $(textSpan).addClass("story-slice");
      $(textSpan).text(story.words[i].text + " ");

      // Create elements
      var tooltip = document.createElement("div");
      $(tooltip).addClass("tooltiptext");
      var profile = document.createElement("div");
      $(profile).addClass("profile");
      var photoDiv = document.createElement("div");
      $(photoDiv).addClass("photo");
      var photo = document.createElement("img");
      $(photo).hide();
      addFacebookPhoto(i, story.words[i].author.fb_id);
      var info = document.createElement("div");
      $(info).addClass("info");
      var sliceAuthor = document.createElement("p");
      $(sliceAuthor).addClass("slice-author");
      sliceAuthor.innerText = story.words[i].author.name;
      var levelDisp = document.createElement("p");
      levelDisp.innerText = "Level " + levels.levelFromPoints(story.words[i].author.points);

      // Add elements
      toolTipDiv.append(textSpan);
      toolTipDiv.append(tooltip);
      tooltip.append(profile);
      profile.append(photoDiv);
      photoDiv.append(photo);
      profile.append(info);
      info.append(sliceAuthor);
      info.append(levelDisp);
      paragraph.append(toolTipDiv);
    }

    var playerTextSpan = document.createElement("span");
    playerTextSpan.id = "player-text";
    var playerTextTooLongSpan = document.createElement("span");
    playerTextTooLongSpan.id = "player-text-too-long";
    paragraph.append(playerTextSpan);
    paragraph.append(playerTextTooLongSpan);
  } else {
    $("#story").hide();
    $("#no-story").show();
  }
}

function addFacebookPhotoAuthor(fb_id) {
  $.get("https://graph.facebook.com/v3.2/" + fb_id + "/picture?redirect=false", (data) => {
    $("#story-author-photo").attr("src", data.data.url);
    $("#story-author-photo").show();
  });
}

function addFacebookPhoto(photoNum, fb_id) {
  $.get("https://graph.facebook.com/v3.2/" + fb_id + "/picture?redirect=false", (data) => {
    var photo = $("#story-main .profile img")[photoNum];
    photo.src = data.data.url;
    $(photo).show();
  });
}

function nextStory() {
  const ANIMATION_LENGTH = 1500; // 1500 ms
  var storyDiv = $("#story");
  var animationComplete = false;
  var requestComplete = false;

  // Check if user is trying to submit
  if ($("#input-text").val() == "") {
    moveToNextStory();
  } else {
    sendStory(checkServerResponse);

    function checkServerResponse(errorInInput) {
      if (!errorInInput) {
        moveToNextStory()
      } else {
        alert(errorInInput.error);
      }
    }
  }

  function moveToNextStory() {
    // Start by moving the panel out
    storyDiv.animate({left: -1 * (storyDiv.position().left + storyDiv.width())}, ANIMATION_LENGTH, function() {
      animationComplete = true;
      step2();
    });

    getStory(() => {
      requestComplete = true;
      step2();
    });

    // Only execute once both getStory and animation are complete
    function step2() {
      if (animationComplete && requestComplete)
        storyDiv.animate({left: $(window).width()}, 0, step3);
    }

    function step3() {
      displayStory();
      storyDiv.animate({left: 0}, ANIMATION_LENGTH);
    }
  }
}
