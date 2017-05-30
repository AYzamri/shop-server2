var express = require('express'); // Loading the express module to the server.
var bodyParser = require('body-parser');
var app = express(); // activating express
var Connection = require('tedious').Connection;
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());
var Request = require('tedious').Request;
// var DButils = require('DButils');


var port = 5000;
app.listen(port, function () {
    console.log('listening to port: ' + port);
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
    console.log("Connected azure");
});

app.get('/', function (req, res) {
    res.send('Welcome to my page!');
    console.log('get completed');
});

app.get('/listProducts', function (req, res) {
    var allMovies = Select(connection, 'Select * from Movies')
        .then(function (movies) {
            res.send(movies);
        });
    res.send("list products");
});


function Select(connection, query) {
    return new Promise(function (resolve, reject) {
        var req = new Request(query, function (err, rowCount) {
            if (err) {
                console.log(err);
                reject(err.message);
            }
        });
        var res = [];
        var properties = [];
        req.on('columnMetadata', function (columns) {
            columns.forEach(function (column) {
                if (column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row) {
            var item = {};
            for (i = 0; i < row.length; i++) {
                item[properties[i]] = row[i].value;
            }
            res.push(item);
        });
        req.on('requestCompleted', function () {
            console.log('requestCompleted with ' + req.rowCount + ' rows');
            console.log(res);
            resolve("success");
        });

        connection.execSql(req);
    });
}