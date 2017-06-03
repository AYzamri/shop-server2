/**
 * Created by amitp on 30/05/2017.
 */

var Request = require('tedious').Request;

exports.Select = function (connection, query) {
    console.log("** Select **");
    console.log("**Query is: " + query + "**");
    return new Promise(function (resolve, reject) {
        var req = new Request(query, function (err) {
            if (err) {
                console.log("**Select error: " + err.message + "**");
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
            console.log('select request Completed with ' + req.rowCount + ' rows');
            console.log(res);
            resolve(res);
        });

        connection.execSql(req);
    });
};

exports.Insert = function (connection, query) {
    console.log("** Insert **");
    console.log("**Query is: " + query + "**");
    return new Promise(function (resolve, reject) {
        var req = new Request(query, function (err) {
            if (err) {
                console.log(err.message);
                reject(err);
            }
        });
        req.on('requestCompleted', function () {
            console.log("Insert completed with " + req.rowCount + " rows");
            resolve("success");
        });

        connection.execSql(req);
    });
};

exports.Update = function (connection, query) {
    console.log("** Update **");
    console.log("**Query is: " + query + "**");
    return new Promise(function (resolve, reject) {
        var req = new Request(query, function (err) {
            if (err) {
                console.log(err.message);
                reject(err);
            }
        });
        req.on('requestCompleted', function () {
            console.log("Update completed with " + req.rowCount + " rows");
            resolve(req.rowCount);
        });

        connection.execSql(req);
    });
};

exports.Delete = function (connection, query) {
    console.log("** Delete **");
    console.log("**Query is: " + query + "**");
    return new Promise(function (resolve, reject) {
        var req = new Request(query, function (err) {
            if (err) {
                console.log(err.message);
                reject(err);
            }
        });
        req.on('requestCompleted', function () {
            console.log("Delete completed with " + req.rowCount + " rows");
            resolve(req.rowCount);
        });

        connection.execSql(req);
    });
};