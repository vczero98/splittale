var categories = new Categories();

$(document).ready(function() {
  categories.categories.forEach((category) => {
    var opt = document.createElement("option");
    opt.value = category.id;
    opt.innerText = category.name;
    $("#select-category").append(opt);
  });
});

$("#inputStart").on("input", function() {
  var n = 0
  var text = $("#inputStart").val();
  text = text.trim();

  n = text.split(/\s+/).length;
  if (text == "") n = 0;

  $("#wordcount").text(n);
  if (n > 15) $("#wordcount").addClass("too-long");
  else $("#wordcount").removeClass("too-long");
})

var buttonLocked = false;

function submitStory() {
  if (buttonLocked) return;
  var body = {
    title: $("#inputTitle").val(),
    start: $("#inputStart").val(),
    category: $("#select-category").val()
  };

  var buttonLocked = true;
  $.post("/stories", body, function(data) {
    if (data.error == null) {
      window.location.href = "/my-stories";
    } else {
      $("#displayError").show();
      $("#displayError").text(data.error);
    }
    buttonLocked = false;
  });
  return;
}
