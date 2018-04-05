

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
//const WorkerNodes = require('worker-nodes');
//const { ipcRenderer } = require('electron');
var { ipcRenderer, remote } = require('electron');
var RequestHandler = require("./workers/request-handler");

var privateConectedUsersList = [];
var usersLoginIPCollection = [];


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };



var port = process.env.PORT || 8080;        // set our port


// CUSTOM INTERNAL METHODS
//==============================================================================

function GetID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();


router.get('/', function (req, res) {
    res.json({ message: 'Welcome to the OBS super server please aks me anything...' });
});





// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/atlas/api', router);

app.use((err, request, response, next) => {
    // log the error, for now just console.log 
    response.status(500).send(err)
});

/**
 * Authenticate to the Api 
 * Using Login & password
 */
router.post('/connect', asyncMiddleware(async (req, res, next) => {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
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


    handler.checkRequestConsistency()
        .then(function (data) {
            handler.checkUserValidity(usersLoginIPCollection).then(function (data) {
                usersLoginIPCollection.push({ ip: data.ip, login: data.login });
                privateConectedUsersList.push(data);
                ipcRenderer.send("user-connected", usersLoginIPCollection);
                res.json({
                    users: usersLoginIPCollection,
                    token: userToken
                });
            }).catch(function (error) {
                console.log("error here", error)
                res.status(400).send(error);
            })
        })
        .catch(function (error) {

            res.status(400).json(error);
        });
}));





/**
 * Authenticate to the Api 
 * Using Login & password
 */
router.post('/logout', asyncMiddleware(async (req, res, next) => {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    var userData = {
        ip: ip
    };

    var handler = new RequestHandler(userData);
    handler.disconnectUser(usersLoginIPCollection, privateConectedUsersList)
        .then(function (data) {
            res.json(data);
            ipcRenderer.send("user-connected", usersLoginIPCollection);
        });

}));



// START THE SERVER
// =============================================================================
app.listen(port);
if (ipcRenderer) {
    setTimeout(function () {
        ipcRenderer.send("server-started", {});
    }, 1000);

    console.log('Magic happens on port ' + port);
}

