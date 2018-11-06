var categories = new Categories();
var levels = new Levels();

var story;

function copyToClipboard() {
  $("#share-link").select();
  document.execCommand('copy');
  $("#btn-copy-to-cl").text("Copied to clipboard");
  setTimeout(() => {$("#btn-copy-to-cl").text("Copy to clipboard")}, 5000)
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
    if (mode == "write") {
      updateEntry();
    }
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

// Share button
$("#btn-share").click(function() {
  $("#shareModal").modal('show');
});

$("#share-link").on("input", function() {
  $(this).val("https://www.splittale.com/stories/" + story._id);
});
