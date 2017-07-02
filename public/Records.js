app.controller('recordsController', ['$http', 'RecordModel', 'CartService', 'UserService', '$location',
    function ($http, RecordModel, CartService, UserService, $location) {
        let self = this;
        self.fieldToOrderBy = "Name";
        self.category = 1;
        self.userService = UserService;

        self.getBestSellingProducts = function () {
            return new Promise(function (resolve, reject) {
                $http.get('/getBestSellingProducts')
                    .then(function (res) {
                            //We build now ProductModel for each record
                            self.topselingrecords = [];
                            angular.forEach(res.data, function (record) {
                                    self.topselingrecords.push(new RecordModel(record));
                                }
                            );
                            resolve();
                        }, function (reason) {
                            console.log(reason.message);
                            reject();
                        }
                    )
            })
        };

        self.getNewestProducts = function () {
            $http.get('/getNewestProducts')
                .then(function (res) {
                    //We build now ProductModel for each record
                    self.newrecords = [];
                    angular.forEach(res.data, function (record) {
                            self.newrecords.push(new RecordModel(record));
                        }
                    );

                })
        };

        if (!$location.path().match('/records')) {
            // perform calls to the Server to get products in Home page
            self.getBestSellingProducts()
                .then(self.getNewestProducts);
        }

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
    }
])
;
//-------------------------------------------------------------------------------------------------------------------
app.controller('recordsMainController', ['$http', 'RecordModel', 'CartService', 'UserService', '$location',
    function ($http, RecordModel, CartService, UserService, $location) {
        let self = this;
        self.fieldToOrderBy = "Name";
        self.recommendedFieldToOrderBy = "Name";
        self.category = 1;
        self.userService = UserService;
        self.data = ({
            username: self.userService.username
        });
        self.orderByHistory = {Name: 0, Artist: 0, ReleasedYear: 0, Price: 0};
        self.recommendedOrderByHistory = {Name: 0, Artist: 0, ReleasedYear: 0, Price: 0};

        self.listAllProducts = function () {
            return new Promise(function (resolve, reject) {
                $http.get('/listAllProducts')
                    .then(function (res) {
                            //We build now ProductModel for each record
                            self.records = [];
                            angular.forEach(res.data, function (record) {
                                    self.records.push(new RecordModel(record));
                                }
                            );
                            resolve();
                        }, function (reason) {
                            console.log(reason.message);
                            reject();
                        }
                    )
            })
        };

        self.getRecommendedProducts = function () {
            $http.post('/getRecommendedProducts', self.data)
                .then(function (res) {
                    //We build now ProductModel for each record
                    self.recommendedrecords = [];
                    angular.forEach(res.data, function (record) {
                            self.recommendedrecords.push(new RecordModel(record));
                        }
                    );
                })

        };

        if ($location.path().match('/records')) {
            // perform calls to the Server to get products in Records page
            self.listAllProducts()
                .then(self.getRecommendedProducts);
        }

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
        };

        self.orderByClick = function (category) {
            self.fieldToOrderBy = category;
            self.shouldReverse = false;

            self.orderByHistory[category]++;
            let numberOfClicks = self.orderByHistory[category];
            if (numberOfClicks % 2 != 0) {
                //filter in reverse order
                self.shouldReverse = "true";
            }
        };

        self.recommendedOrderByClick = function (category) {
            self.recommendedFieldToOrderBy = category;
            self.recommendedShouldReverse = false;

            self.recommendedOrderByHistory[category]++;
            let numberOfClicks = self.recommendedOrderByHistory[category];
            if (numberOfClicks % 2 != 0) {
                //filter in reverse order
                self.recommendedShouldReverse = "true";
            }
        }
    }]);
//-------------------------------------------------------------------------------------------------------------------