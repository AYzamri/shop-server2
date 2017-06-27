app.factory('RecordModel', ['$http', function($http) {
    function RecordModel(record) {
        if (record)
            this.setData(record);
    }
    RecordModel.prototype = {
        setData: function(recordData) {
            angular.extend(this, recordData);
        },
        load: function(recordID) {
            $http.get('/listAllProducts/' + recordID).then(function(recordData) {
                this.setData(recordData);
            });
        },
        add: function () {
            $http.post('/listAllProducts', this).then(function(res) {
            });
        }
    };
    return RecordModel;
}]);