var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    path             = require('path'),
    passport         = require("passport"),
    expressSession   = require("express-session"),
    MongoStore       = require('connect-mongo')(expressSession),
    server           = require('http').createServer(app),
    middleware       = require("./middleware"),
    https            = require("https");

var logging      = require("./logging"),
    StoryHandler = require("./game/storyhandler");

var storyHandler = new StoryHandler();
storyHandler.start();

var User = require("./models/user");
var Story = require("./models/story");

var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var port          = process.env.PORT,
    serverAddress = process.env.ADDRESS;

var storyCount = 0;

app.set("view engine", "ejs");
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, '/views'));

// Passport configuration
var myExpressSession = expressSession({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore
});

app.use(myExpressSession);

app.use(passport.initialize());
app.use(passport.session());

// Routes
var authRoutes = require("./routes/auth")(passport);
var storiesRoutes = require("./routes/stories")(storyHandler);

// Locals
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.displayNavBar = true;
  next();
});

app.get("/", middleware.isLoggedOut, function(req, res) {
  res.render("landing", {displayNavBar: false});
});

if (process.env.DEBUG_MESSAGES == 1) {
  app.get("/reset", function(req, res) {
    var me = req.user._id;
    var stories = [{
      title: "The day we met",
      author: me,
      category: 1,
      words: [
        {text: "In a land far far away,", author: me},
        {text: "there was a little boy.", author: me},
        {text: "This boy was always looking", author: me},
        {text: "for a friend to play", author: me},
        {text: "with. One day, he met", author: me},
        {text: "a little dog, whose tail", author: me}
      ]
    }, {
      title: "The Italian family",
      author: me,
      category: 2,
      words: [
        {text: "Once upon a time,", author: me},
        {text: "in a land far far away,", author: me},
        {text: "there lived an Italian king", author: me},
        {text: "who never liked when someone", author: me},
        {text: "ate pizza.", author: me},
        {text: "so he decided to ban", author: me},
        {text: "pizza in his kingdom, but", author: me}
      ]
    }, {
      title: "The ducks go shopping",
      author: me,
      category: 3,
      words: [
        {text: "Once upon a time,", author: me},
        {text: "here was a little duck", author: me},
        {text: "who wanted to buy new", author: me},
        {text: "flip-flops for his father.", author: me},
        {text: "His father was an old", author: me},
        {text: "duck who always played", author: me}
      ]
    }];

    // Reset the stories
    Story.remove({}, function(err) {
      if (err) {
        res.send(err);
      } else {
        Story.insertMany(stories, function(err) {
          if (err) {
            res.send(err);
          } else {
            res.send("Done<br><a href='/write'>Back</a>");
          }
        });
      }
    });
  });
}

app.use("/", authRoutes);
app.use("/", storiesRoutes);

server.listen(port, serverAddress, function () {
  console.log('Server listening at ' + serverAddress + ":" + port);
});
