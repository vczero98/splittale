function Categories() {
  var self = this;

  self.categories = [{
    id: 1,
    name: "Animals"
  }, {
    id: 2,
    name: "Travel"
  }, {
    id: 3,
    name: "Fan fiction"
  }, {
    id: 4,
    name: "Food"
  }];

  self.categoryFromID = function(id) {
    for (var i = 0; i < self.categories.length; i++) {
      if (self.categories[i].id == id)
        return self.categories[i].name;
    }

    return null;
  }
}

function Levels() {
  var self = this;

  var levels = [
    {level: 0, points: 0},
    {level: 1, points: 5},
    {level: 2, points: 10},
    {level: 3, points: 20}
  ];

  self.levelFromPoints = function(points) {
    for (var i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].points)
        return levels[i].level;
    }
  }
}
