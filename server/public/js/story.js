$("#input-text").on("input", function() {
 updateEntry();
});

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
  $.get("/getstory", function(data) {
    story = data;
    if (typeof next === "function") next();
  });
}

function sendStory(next) {
  $.post("/addwords", { _id: story._id, words: $("#input-text").val() }, function(data) {
    if (typeof next === "function") next(data);
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
