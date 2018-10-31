var inDebug = process.env.DEBUG_MESSAGES == 1;

var logging = {};

logging.debug = function(message) {
  console.log("DEBUG: " + message);
}

logging.info = function(message) {
  console.log("INFO: " + message);
}

logging.error = function(message) {
  console.log("ERROR: " + message);
}

module.exports = logging;
