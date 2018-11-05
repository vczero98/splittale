var categories = new Categories();

$(document).ready(function() {
  categories.categories.forEach((category) => {
    var opt = document.createElement("option");
    opt.value = category.id;
    opt.innerText = category.name;
    $("#select-category").append(opt);
  });
});
