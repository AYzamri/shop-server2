let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule']);
//-------------------------------------------------------------------------------------------------------------------
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['UserService', 'CartService', '$location',
    function (UserService, CartService ,$location) {
        let self = this;
        self.greeting = 'Have a nice day';
        self.userService = UserService;
        self.cartService = CartService;

        // check for user cookie
        var userNameFromCookie = self.userService.localStorage.cookie.get('username');
        if (userNameFromCookie != null) {
            self.userService.isLoggedIn = true;
            self.userService.username = userNameFromCookie;
            console.log("found cookie of: " + userNameFromCookie);
        }

        // check for cart in local storage
        var cart = self.userService.localStorage.get('cart');
        if (cart != null){
            self.cartService.cart = cart;
            self.cartService.priceSum = self.userService.localStorage.get('cartPrice');
        }

        self.isLoggedIn = self.userService.isLoggedIn;

        self.logout = function () {
            self.isLoggedIn = false;
            self.userService.isLoggedIn = false;
            self.userService.localStorage.cookie.remove('username');
            self.userService.localStorage.cookie.remove('date');
            self.userService.username = "";
            $location.path('/');
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
app.factory('UserService', ['$http', 'localStorageService', function ($http, localStorageSerivce) {
    let service = {};
    service.isLoggedIn = false;
    service.username = "";
    service.currentPage = "";
    service.localStorage = localStorageSerivce;
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

                // set cookie
                var date = new Date();
                service.localStorage.cookie.set('username', user.username);
                service.localStorage.cookie.set('date', date.today() + ", " + date.timeNow());

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

        //check for date in cookie
        let lastLoginTime = service.localStorage.cookie.get('date');
        if(lastLoginTime != null){
            message += ". last login time: " + lastLoginTime;
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
            templateUrl: "views/home.html"
        })
        .when("/login", {
            templateUrl: "views/login.html"
        })
        .when("/signup", {
            templateUrl: "views/signup.html"
        })
        .when("/records", {
            templateUrl: "views/records.html"
        })
        .when("/cart", {
            templateUrl: "views/cart.html"
        })
        .otherwise({
            redirect: '/'
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
// For today's date;
Date.prototype.today = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
};

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
};