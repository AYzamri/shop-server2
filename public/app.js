let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule']);
//-------------------------------------------------------------------------------------------------------------------
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['UserService', '$location', '$route',
    function (UserService, $location, $route) {
        let self = this;
        self.greeting = 'Have a nice day';
        self.userService = UserService;
        self.isLoggedIn = UserService.isLoggedIn;

        self.logout = function () {
            self.isLoggedIn = false;
            UserService.isLoggedIn = false;
            $route.reload();
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', '$location', '$window',
    function (UserService, $location, $window) {
        let self = this;
        self.user = {username: '', password: ''};

        self.login = function (valid) {
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
app.controller('signupController', ['UserService', 'DataSource', '$location', '$window',
    function (UserService, DataSource, $location, $window) {
        let self = this;

        self.user = {
            username: '', password: '', firstName: '', lastName: '', email: '', categories: [],
            address: '', city: '', country: 'Israel', phone: '', cellular: '', creditCard: '', answer: '',
            question: 'What is your favorite coding language?'
        };

        self.signup = function (valid) {
            if (valid) {
                if (self.user.categories.length > 0) {
                    UserService.signup(self.user).then(function (success) {
                        $window.alert('Thank you for joining us');
                        $location.path('/login');
                    }, function (error) {
                        self.errorMessage = error.data;
                        $window.alert('registration has failed');
                    })
                }
                else {
                    self.categoryError = "Please choose at least one category";
                }
            }
        };

        self.toggleSelection = function toggleSelection(category) {
            var idx = self.user.categories.indexOf(category.value);

            // Is currently selected
            if (idx > -1) {
                self.user.categories.splice(idx, 1);
            }

            // Is newly selected
            else {
                self.user.categories.push(category.value);
            }
        };

        self.questions = ["What is your favorite food?", "What is your mother's childhood name?",
            "In which hospital were you born at?", "What was your first school?", "Who is your favorite musician?"
            , "What is your favorite coding language?"];

        self.selectedCountry = [];

        self.categories = [{name: 'Rock', value: 1}, {name: 'Pop', value: 2}, {name: 'R&B', value: 5},
            {name: 'Jazz', value: 6}, {name: 'Blues', value: 7}, {name: 'Metal', value: 8}, {name: 'Techno', value: 9},
            {name: 'House', value: 10}, {name: 'EDM', value: 11}, {name: "Funk", value: 12}, {
                name: 'Reggae', value: 13
            }];

        // Get countries from countries.xml
        var SOURCE_FILE = "resources/countries.xml";
        var xmlTransform = function (data) {
            console.log("transform data");
            var x2js = new X2JS();
            var json = x2js.xml_str2json(data);
            return json.Countries;
        };
        var setData = function (data) {
            console.log("setdata", data);
            self.countries = data;
            self.dataSet = data;
        };
        DataSource.get(SOURCE_FILE, setData, xmlTransform);
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('recordsController', ['$http', 'RecordModel', 'CartService',
    function ($http, RecordModel, CartService) {
        let self = this;
        self.fieldToOrderBy = "Name";
        self.category = 1;
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
            });

        self.getByCategory = function () {
            $http.get('/getProductsByCategory?category=' + self.category)
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

        self.addRecordToCart = function (record) {
            console.log("recordsController::addProduct");
            CartService.addRecordToCart(record);
        };

        self.removeRecordFromCart = function (record) {
            console.log("recordsController::removeRecordFromCart");
            CartService.removeRecordFromCart(record);
        }
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('recordsMainController', ['$http', 'RecordModel', 'CartService','UserService',
    function ($http, RecordModel, CartService,UserService) {
        let self = this;
        self.fieldToOrderBy = "Name";
        self.category = 1;
        self.userService = UserService;
        $http.get('/listAllProducts')
            .then(function (res) {
                //We build now ProductModel for each record
                self.records = [];
                angular.forEach(res.data, function (record) {
                        self.records.push(new RecordModel(record));
                    }
                );
                var data = ({
                    username: self.userService.username,
                });
                $http.post('/getRecommendedProducts', data)
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
            $http.get('/getProductsByCategory?category=' + self.category)
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

        self.addRecordToCart = function (record) {
            console.log("recordsController::addProduct");
            CartService.addRecordToCart(record);
        };

        self.removeRecordFromCart = function (record) {
            console.log("recordsController::removeRecordFromCart");
            CartService.removeRecordFromCart(record);
        }
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('UserService', ['$http', function ($http) {
    let service = {};
    service.isLoggedIn = false;
    service.username = "";
    service.login = function (user) {
        return $http.post('/login', user)
            .then(function (response) {
                let token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user': user.username
                };
                service.isLoggedIn = true;
                service.username = user.username;
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };

    service.helloMessage = function () {
        let message = "Hello ";
        if (service.isLoggedIn) {
            message += service.username;
        } else {
            message += "guest";
        }
        return message;
    };

    service.signup = function (user) {
        return $http.post('/register', user)
            .then(function (response) {
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };

    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('DataSource', ['$http', function ($http) {
    return {
        get: function (file, callback, transform) {
            $http.get(file, {transformResponse: transform})
                .then(function (data, status) {
                    console.log("Request succeeded", data);
                    callback(data.data.Country);
                }, function errorCallBack(data, status) {
                    console.log("Request failed " + status);
                });
        }
    };
}]);
//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "mainController"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "loginController"
        })
        .when("/signup", {
            templateUrl: "views/signup.html",
            controller: "signupController"
        })
        .when("/records", {
            templateUrl: "views/records.html",
            controller: 'recordsMainController'
        })
        .when("/cart", {
            templateUrl: "views/cart.html",
            controller: 'cartController'
        })
        .when("/StorageExample", {
            templateUrl: "views/StorageExample.html",
            controller: 'StorageExampleController'
        })
        .otherwise({
            redirect: '/'
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
