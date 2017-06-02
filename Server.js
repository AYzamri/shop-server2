var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var DBUtils = require("./DButils.js");
var Connection = require('tedious').Connection;
var squel = require("squel");

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
            console.log("**Error in list products**");
            res.status(500).send('500 - server error');
        })
});
//*****get top 5 newest products******
app.get('/getNewestProducts', function (req, res) {
    console.log("**list 5 newest records**");
    DBUtils.Select(connection, 'Select TOP(5) from Records ORDER by ArriveDateInStore DESC')
        .then(function (records) {
            console.log("**sending all Records to client...**");
            res.send((records));
        })
        .catch(function (err) {
            console.log("**Error in 5 newest records**");
            res.status(500).send('500 - server error');
        })
});
//***get products by category*****
app.get('/getrecordsbycategory', function (req, res) {
    console.log("**records by given category**");
    var category = "'" + req.body.category + "'";
    console.log("**given category**"+category);
    DBUtils.Select(connection, '                           ')
        .then(function (records) {
            console.log("**sending all Records to client...**");
            res.send((records));
        })
        .catch(function (err) {
            console.log("**Error in 5 newest records**");
            res.status(500).send('500 - server error');
        })
});

// *** login ***
app.post('/login', function (req, res) {
    console.log("**login**");
    var userName = "'" + req.body.username + "'";
    var password = "'" + req.body.password + "'";
    console.log("**trying to login: " + userName + " with password " + password);
    var query = "Select * FROM Clients WHERE UserName=" + userName + " AND Password=" + password;
    DBUtils.Select(connection, query)
        .then(checkIfOneRecordIsBack)
        .then(updateLoginTime)
        .then(function (response) {
            res.send({"response": response});
        })
        .catch(function (err) {
            console.log("**Error in login:**");
            res.status(500).send('500 - server error');
        });

    function checkIfOneRecordIsBack(response) {
        return new Promise(function (resolve, reject) {
            resolve(response.length === 1);
        });
    }

    function updateLoginTime(response) {
        return new Promise(function (resolve, reject) {
            console.log("** update login time **");
            var currentDate = new Date();
            var query = squel.update()
                .table("Clients")
                .set("LastLogin", currentDate.today() + " @ " + currentDate.timeNow())
                .where("UserName = " + userName)
                .toString();

            DBUtils.Update(connection, query)
                .then(function () {
                    console.log("** updated user last login time **");
                    resolve(response);
                })
                .catch(function (err) {
                    console.log("** error while updating user last login time");
                    reject(err);
                })
        });
    }
});

// *** register ***
app.post('/register', function (req, res) {
    console.log("**register**");

    query = squel.insert()
        .into("Clients")
        .set("UserName", req.body.username)
        .set("Password", req.body.password)
        .set("FirstName", req.body.firstName)
        .set("lastName", req.body.lastName)
        .set("IsAdmin", 0)
        .set("Address", req.body.address)
        .set("City", req.body.city)
        .set("Country", req.body.country)
        .set("Phone", req.body.phone)
        .set("Cellular", req.body.cellular)
        .set("Mail", req.body.mail)
        .set("CreditCard", req.body.creditCard)
        .set("Question", req.body.question)
        .set("Answer", req.body.answer)
        .toString();

    DBUtils.Insert(connection, query)
        .then(addUserCategories)
        .then(function (response) {
            res.send({"response": response});
        })
        .catch(function (err) {
            console.log("**Error in register:**");
            if (err.message.includes("Violation of PRIMARY KEY constraint")) {
                console.log("** User name already exists **");
                res.send({"response": "Username already exists"});
            }
            else {
                res.status(500).send('500 - server error');
            }
        });

    function addUserCategories(response) {
        return new Promise(function (resolve, reject) {
            console.log("**Adding client categories..**");
            var categories = req.body.categories;
            console.log(categories);
            var query = "insert into CilentsCategories (UserName, CategoryID) ";
            categories.forEach(function (category) {
                query = query + "SELECT '" + req.body.username + "', '" + category + "' ";
                query = query + "UNION ALL ";
            });
            query = query.substr(0, query.lastIndexOf('U'));

            DBUtils.Insert(connection, query)
                .then(function (response) {
                    console.log("** Added user categories **");
                    resolve(response);
                })
                .catch(function (err) {
                    console.log("** Error adding user categories **");
                    reject(err);
                })
        });
    }
});

// *** recoverPassword ***
app.post('/recoverPassword', function (req, res) {
    console.log("** Recover Password **");
    var userName = "'" + req.body.username + "'";
    var answer = "'" + req.body.answer + "'";
    var query = squel.select()
        .field("Password")
        .from("Clients")
        .where("UserName = " + userName)
        .where("Answer = " + answer)
        .toString();

    DBUtils.Select(connection, query)
        .then(function (password) {
            res.send({"result": password.length === 1 ? password : "Answer doesn't match question"});
        })
        .catch(function (err) {
            console.log("**Error in recover password:**");
            res.status(500).send('500 - server error');
        })
});

// *** last login time ***
app.post('/getLastLoginTime', function (req, res){
    console.log("** get last login time **");
    var userName = "'" + req.body.username + "'";
    var query = squel.select()
        .field("LastLogin")
        .from("Clients")
        .where("UserName = " + userName)
        .toString();

    DBUtils.Select(connection, query)
        .then(function (lastLogin){
            res.send({"result" : lastLogin});
        })
        .catch(function (err) {
            console.log("** Error in get last login time **");
            res.status(500).send('500 - server error');
        })
});

// general error handler
app.use(function (err, req, res, next) {
    console.log('unhandled error detected: ' + err.message);
    res.status(500).send('500 - server error');
});

// For todays date;
Date.prototype.today = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
};

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
};

