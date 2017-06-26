let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule']);
//-------------------------------------------------------------------------------------------------------------------
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['UserService', function (UserService) {
    let vm = this;
    vm.greeting = 'Have a nice day';
    vm.userService = UserService;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', '$location', '$window',
    function(UserService, $location, $window) {
        let self = this;
        self.user = {username: '', password: ''};

        self.login = function(valid) {
            if (valid) {
                    UserService.login(self.user).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/');
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('log-in has failed');
                })
            }
        };
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('signupController', ['UserService', '$location', '$window',
    function(UserService, $location, $window) {
        let self = this;

        self.login = function(valid) {
            if (valid) {
                UserService.login(self.user).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/');
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('log-in has failed');
                })
            }
        };

        self.countries = [];
        self.categories = ['Rock', 'Jazz', 'Pop', 'Blues', 'Metal', 'Techno', 'House', 'EDM', 'Funk', 'Reggae'];
        self.selectedCategories = [];
        
        self.toggleSelection = function toggleSelection(fruitName) {
            var idx = self.selection.indexOf(fruitName);

            // Is currently selected
            if (idx > -1) {
                self.selection.splice(idx, 1);
            }

            // Is newly selected
            else {
                self.selection.push(fruitName);
            }
        };

    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('recordsController', ['$http', 'RecordModel', function($http, RecordModel) {
        let self = this;
        self.fieldToOrderBy = "Name";
        self.category=1;
                        $http.get('/getBestSellingProducts')
                            .then(function (res) {
                                //We build now ProductModel for each record
                                self.topselingrecords = [];
                                angular.forEach(res.data, function (record) {
                                        self.topselingrecords.push(new RecordModel(record));
                                    }
                                );
                                $http.get('/getNewestProducts')
                                    .then(function (res) {
                                        //We build now ProductModel for each record
                                        self.newrecords = [];
                                        angular.forEach(res.data, function (record) {
                                                self.newrecords.push(new RecordModel(record));

                                            }
                                        );

                                    })
                })
            ;
    self.getByCategory = function () {
        $http.get('/getProductsByCategory?category='+self.category)
            .then(function (res) {
                //We build now ProductModel for each record
                self.records = [];
                angular.forEach(res.data, function (record) {
                        self.records.push(new RecordModel(record));
                    }
                );
            })
            .catch(function (e) {
                self.records = [];
            });

    };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('recordsmainController', ['$http', 'RecordModel', function($http, RecordModel) {
    let self = this;
    self.fieldToOrderBy = "Name";
    self.category=1;
    $http.get('/listAllProducts')
        .then(function (res) {
            //We build now ProductModel for each record
            self.records = [];
            angular.forEach(res.data, function (record) {
                    self.records.push(new RecordModel(record));
                }
            );
            var data = ({
                username: "amit"
            });
            $http.post('/getRecommendedProducts',data)
                .then(function (res) {
                    //We build now ProductModel for each record
                    console.log(res);
                    self.recommendedrecords = [];
                    angular.forEach(res.data, function (record) {
                            self.recommendedrecords.push(new RecordModel(record));
                        }
                    );
                })
        });
    self.getByCategory = function () {
        $http.get('/getProductsByCategory?category='+self.category)
            .then(function (res) {
                //We build now ProductModel for each record
                self.records = [];
                angular.forEach(res.data, function (record) {
                        self.records.push(new RecordModel(record));
                    }
                );
            })
            .catch(function (e) {
                self.records = [];
            });

    };
}]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('UserService', ['$http', function($http) {
    let service = {};
    service.isLoggedIn = false;
    service.login = function(user) {
        return $http.post('/login', user)
            .then(function(response) {
                let token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user' : user.username
                };
                service.isLoggedIn = true;
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html",
            controller : "mainController"
        })
        .when("/login", {
            templateUrl : "views/login.html",
            controller : "loginController"
        })
        .when("/signup", {
            templateUrl : "views/signup.html",
            controller : "signupController"
            })
        .when("/records", {
            templateUrl : "views/records.html",
            controller: 'recordsmainController'
        })
        .when("/StorageExample", {
            templateUrl : "views/StorageExample.html",
            controller: 'StorageExampleController'
        })
        .otherwise({redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
