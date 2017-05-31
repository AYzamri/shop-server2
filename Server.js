var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var DBUtils = require("./DButils.js");
var Connection = require('tedious').Connection;

var app = express(); // activating express
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

var port = 5000;
app.listen(port, function () {
    console.log('**listening to port: ' + port + '**');
});

var config = {
    userName: 'aaa',
    password: 'Admin1234!',
    server: 'shop-server.database.windows.net',
    requestTimeout: 30000,
    options: {encrypt: true, database: 'Shop'}
};

var connection = new Connection(config);
connection.on('connect', function (err) {
    if (err) {
        console.error('error connection: ' + err.stack);
        return;
    }
    console.log("**Connected azure**");
});

app.get('/', function (req, res) {
    console.log('Homepage GET');
    res.send('GET is called to your homepage');
});

// *** listAllProducts ***
app.get('/listAllProducts', function (req, res) {
    console.log("**list all products**");
    DBUtils.Select(connection, 'Select * from Records')
        .then(function (records) {
            console.log("**sending all Records to client...**");
            res.send((records));
        })
        .catch(function (err) {
            console.log("**Error in list products:**" + err.message);
            res.status(500).send('500 - server error');
        })
});

// *** login ***
app.post('/login', function (req, res) {
    console.log("**login**");
    var userName = "'" + req.body.username  + "'";
    var password = "'" + req.body.password + "'";
    console.log("**trying to login: " + userName + " with password " + password);
    var query = "Select * FROM Clients WHERE UserName=" + userName + " AND Password=" + password;
    DBUtils.Select(connection, query)
        .then(function (users) {
            res.send(users.length === 1);
        })
        .catch(function (err) {
            console.log("**Error in login: " + err.message + "**");
            res.status(500).send('500 - server error');
        })
});

// general error handler
app.use(function (err, req, res, next) {
    console.log('unhandled error detected: ' + err.message);
    res.status(500).send('500 - server error');
});

