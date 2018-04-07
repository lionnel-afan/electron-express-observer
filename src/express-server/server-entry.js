// call the packages we need
var express = require("express"); // call express
var app = express(); // define our app using express
var bodyParser = require("body-parser");
var { ipcRenderer, remote } = require("electron");
var RequestHandler = require("./workers/request-handler");

var privateConectedUsersList = [];
var usersLoginIPCollection = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

var port = process.env.PORT || 8080; // set our port

// CUSTOM INTERNAL METHODS
//=========================

function GetID() {
  return (
    Math.random()
      .toString(36)
      .substr(2, 19)
  );
}

// snippet taken from http://catapulty.tumblr.com/post/8303749793/heroku-and-node-js-how-to-get-the-client-ip-address
function getClientIp(req) {
  var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.header("x-forwarded-for");
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(",");
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // If request was not forwarded
    ipAddress = req.connection.remoteAddress;
  }
  // convert from "::ffff:192.0.0.1"  to "192.0.0.1"
  if (ipAddress.substr(0, 7) == "::ffff:") {
    ipAddress = ipAddress.substr(7);
  }

  return  ipAddress == "::1" ? "localhost" : ipAddress;
}

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

router.get("/", function(req, res) {
  res.json({
    message: "Welcome to the OBS super server please aks me anything..."
  });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use("/observer/api", router);

app.use((err, request, response, next) => {
  // log the error, for now just console.log
  response.status(500).send(err);
});

/**
 * Authenticate to the Api
 * Using Login & password
 */
router.post(
  "/login",
  asyncMiddleware(async (req, res, next) => {
    var ip = getClientIp(req);
    var login = req.body ? req.body.login : undefined;
    var password = req.body ? req.body.password : undefined;

    var userToken = GetID();
    var userData = {
      ip: ip,
      login: login,
      password: password,
      token: userToken
    };

    var handler = new RequestHandler(userData);

    handler
      .checkRequestConsistency()
      .then(function(data) {
        handler
          .checkUserValidity(usersLoginIPCollection)
          .then(function(data) {
            usersLoginIPCollection.push({ ip: data.ip, login: data.login });
            privateConectedUsersList.push(data);
            ipcRenderer.send("user-connected", usersLoginIPCollection);
            res.json({
              users: usersLoginIPCollection,
              token: userToken
            });
          })
          .catch(function(error) {
            console.log("error here", error);
            res.status(400).send(error);
          });
      })
      .catch(function(error) {
        res.status(400).json(error);
      });
  })
);

/**
 * Get from the server, the Connected users List
 * Using the Token.
 */
router.post(
  "/users",
  asyncMiddleware(async (req, res, next) => {
    if (!req.body || !req.body.token) {
      res.status(400).json("Error: Token mising in the request body !");
    } else {
      var userData = {
        ip: getClientIp(req),
        token: req.body ? req.body.token : undefined
      };
      var handler = new RequestHandler(userData);
      handler
        .verifyUserToken(privateConectedUsersList)
        .then(function(data) {
          res.json({
              users : usersLoginIPCollection
          });
        })
        .catch(function(error) {
          res.status(400).json(error);
        });
    }
  })
);

/**
 * Log off from the Api
 * Using Ip adress
 */
router.post(
  "/logout",
  asyncMiddleware(async (req, res, next) => {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    var userData = {
      ip: ip
    };

    var handler = new RequestHandler(userData);
    handler
      .disconnectUser(usersLoginIPCollection, privateConectedUsersList)
      .then(function(data) {
        res.json(data);
        ipcRenderer.send("user-connected", usersLoginIPCollection);
      });
  })
);

// START THE SERVER
// ===================
app.listen(port);
//Wait 1s then send the server started event.
if (ipcRenderer) {
  setTimeout(function() {
    ipcRenderer.send("server-started", {});
  }, 1000);
}

console.log("Magic happens on port " + port);
