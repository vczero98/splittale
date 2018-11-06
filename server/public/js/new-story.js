var categories = new Categories();

$(document).ready(function() {
  categories.categories.forEach((category) => {
    var opt = document.createElement("option");
    opt.value = category.id;
    opt.innerText = category.name;
    $("#select-category").append(opt);
  });
});

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
