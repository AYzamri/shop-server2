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
// *** listAllOrderss ***
app.get('/listAllOrders', function (req, res) {
    console.log("**list all orders**");
    DBUtils.Select(connection, 'Select * from Orders')
        .then(function (records) {
            console.log("**sending all orders to client...**");
            res.send((records));
        })
        .catch(function (err) {
            console.log("**Error in list orders**");
            res.status(500).send('500 - server error');
        })
});

//*****get top 5 newest products******
app.get('/getNewestProducts', function (req, res) {
    console.log("**list 5 newest records**");
    DBUtils.Select(connection, 'Select TOP 5 * from Records ORDER by ArriveDateInStore DESC')
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
app.get('/getProductsByCategory', function (req, res) {
    console.log("**products by given category**");
    var category = "'" + req.query.category + "'";
    console.log("**given category**" + category);
    DBUtils.Select(connection, 'Select * FROM Records  JOIN [RecordsCategories] ON' +
        ' Records.RecordID=[RecordsCategories].RecordID WHERE RecordsCategories.CategoryID=' + category)
        .then(function (records) {
            console.log("**sending all Records by category to client...**");
            res.send(records);
        })
        .catch(function (err) {
            console.log("**Error in products by category**");
            res.status(500).send('500 - server error');
        })
});

// *** get products by name ***
app.get('/getProductsByName', function (req, res) {
    console.log("**get product by name**");
    var productName = "'%" + req.query.name + "%'";
    console.log("**given name: " + productName);
    var query = "SELECT * from Records WHERE name LIKE " + productName;
    DBUtils.Select(connection, query)
        .then(function (records) {
            if (records.length > 0) {
                console.log("**sending all searched products to the client..**");
                res.send(records);
            }
            else res.send({"response": "no records found"});
        })
        .catch(function (err) {
            console.log("**Error in get products by name**");
            res.status(500).send('500 - server error');
        })
});

//****get top 5 selling products*****
app.get('/getbestsellingrecords', function (req, res) {
    console.log("**get top selling records**");
    var query = "select * from (select top 3 RecordID, sum(Amount) as sold from RecordsInOrders group by RecordID Order by sum(Amount) desc) AS t1 JOIN (select * from Records) AS t2 ON t1.RecordID=t2.RecordID"
    DBUtils.Select(connection, query)
        .then(function (records) {
        console.log("returned top 5 selling products to client")
            res.send((records));
        })
        .catch(function (err) {
            console.log("**Error in returning top product**");
            res.status(500).send('500 - server error');
        })
});

//***get orders by user*****
app.post('/getOrdersByUsers', function (req, res) {
    console.log("**records by given category**");
    var userName = "'" + req.body.username + "'";
    console.log("**given user**" + userName);
    DBUtils.Select(connection, 'Select Orders.OrderID, OrderDate, ShipmentDate, Currency,TotalAmount,[RecordsInOrders].RecordID,[RecordsInOrders].Amount, [Records].Name,[Records].Artist FROM Orders  JOIN [RecordsInOrders] ON Orders.OrderID=[RecordsInOrders].OrderID JOIN [Records] ON [RecordsInOrders].RecordID=[Records].RecordID WHERE Orders.ClientID=' + userName)
        .then(function (records) {
            console.log("**sending all Records by category to client...**");
            res.send((records));
        })
        .catch(function (err) {
            console.log("**Error in products by category**");
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
            console.log("** Add user categories **");
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

// *** add product-record ***
app.post('/addProduct', function (req, res) {
    console.log("**add product**");

    query = squel.insert()
        .into("Records")
        .set("Name", req.body.name)
        .set("Artist", req.body.artist)
        .set("ReleasedYear", req.body.releasedYear)
        .set("Description", req.body.description)
        .set("PicturePath", req.body.picturePath)
        .set("ArriveDateInStore", req.body.arriveDateInStore)
        .set("Price", req.body.price)
        .set("Amount", req.body.amount)
        .toString();

    DBUtils.Insert(connection, query)
        .then(getLastAddedProductId)
        .then(addRecordCategories)
        .then(function (response) {
            res.send({"response": response});
        })
        .catch(function (err) {
            console.log("**Error in add product:**");
            if (err.message.includes("Violation of PRIMARY KEY constraint")) {
                console.log("** User name already exists **");
                res.send({"response": "Username already exists"});
            }
            else {
                res.status(500).send('500 - server error');
            }
        });

    function getLastAddedProductId(response) {
        return new Promise(function (resolve, reject) {
            console.log("**Get last added product ID**");
            var query = "SELECT TOP 1 RecordID FROM Records ORDER BY RecordID DESC";
            DBUtils.Select(connection, query)
                .then(function (productId) {
                    console.log("**last added product ID: " + productId[0].RecordID + "**");
                    resolve(productId[0].RecordID);
                })
                .catch(function (err) {
                    console.log("**Error in get last added product ID**");
                    reject(err);
                })
        });
    }

    function addRecordCategories(productId) {
        return new Promise(function (resolve, reject) {
            console.log("**Add record categories..**");
            var categories = req.body.categories;
            console.log("Categories: " + categories);
            var query = "insert into RecordsCategories (RecordID, CategoryID) ";
            categories.forEach(function (category) {
                query = query + "SELECT " + productId + ", " + category + " ";
                query = query + "UNION ALL ";
            });
            query = query.substr(0, query.lastIndexOf('U'));

            DBUtils.Insert(connection, query)
                .then(function (response) {
                    console.log("** Added record categories **");
                    resolve(response);
                })
                .catch(function (err) {
                    console.log("** Error adding record categories **");
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
app.post('/getLastLoginTime', function (req, res) {
    console.log("** get last login time **");
    var userName = "'" + req.body.username + "'";
    var query = squel.select()
        .field("LastLogin")
        .from("Clients")
        .where("UserName = " + userName)
        .toString();

    DBUtils.Select(connection, query)
        .then(function (lastLogin) {
            res.send({"result": lastLogin});
        })
        .catch(function (err) {
            console.log("** Error in get last login time **");
            res.status(500).send('500 - server error');
        })
});

// ** change product inventory **
app.post("/changeProductInventory", function (req, res) {
    console.log("** change product inventory **");
    var newAmount = req.body.amount;
    var productId = req.body.id;
    if (isNaN(newAmount) || isNaN(productId)) {
        console.log("product ID or amount not a number");
        res.send({"response" : "failure - NaN"});
        return;
    }
    var query = squel.update()
        .table("Records")
        .set("ExistInInventory", newAmount)
        .where("RecordID = " + productId)
        .toString();
    DBUtils.Update(connection, query)
        .then(function (rowCount) {
            res.send({"result": rowCount === 1 ? "success" : "failure - No such RecordID"});
        })
        .catch(function (err) {
            console.log("** Error in change product inventory **");
            res.status(500).send('500 - server error');
        })
});

// ** Delete product by ID **
app.delete('/deleteProduct', function (req, res) {
    console.log("** delete product **");
    var productId = req.body.id;
    if (isNaN(productId)) {
        console.log("delete product: not a number");
        res.send({"result": "failure - NaN"});
        return;
    }
    var query = "delete from Records where RecordID = " + productId;
    DBUtils.Delete(connection, query)
        .then(function (rowCount) {
            res.send({"result": rowCount === 1 ? "success" : "failure"});
        })
        .catch(function (err) {
            console.log("** Error in delete product ** ");
            res.status(500).send('500 - server error');
        })
});

// ** Delete client by User Name **
app.delete('/deleteClient', function (req, res) {
    console.log("** delete client **");
    var userName = "'" + req.body.username + "'";
    var query = "delete from Clients where UserName = " + userName;
    DBUtils.Delete(connection, query)
        .then(function (rowCount) {
            res.send({"result": rowCount === 1 ? "success" : "failure"});
        })
        .catch(function (err) {
            console.log("** Error in delete client ** ")
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

