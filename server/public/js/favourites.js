var categories = new Categories();

$(document).ready(function() {
  var cats = $(".category");
  for (var i = 0; i < cats.length; i++) {
    $(cats[i]).text(categories.categoryFromID($(cats[i]).text()));
  }
});
