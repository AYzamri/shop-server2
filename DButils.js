/**
 * Created by amitp on 30/05/2017.
 */

var Request = require('tedious').Request;

exports.Select = function (connection, query) {
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
            resolve(res);
        });

        connection.executeSql(req);
    });
}