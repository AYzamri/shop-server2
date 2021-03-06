//-------------------------------------------------------------------------------------------------------------------
app.controller('cartController', ['CartService', '$location', '$window',
    function (CartService) {
        let self = this;
        self.cartService = CartService;

        self.seeRecordDetails = function (record) {
            self.recordToSee = record;
            self.toggleModal();
        };

        self.modalShown = false;
        self.toggleModal = function () {
            self.modalShown = !self.modalShown;
        };

    }]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('CartService', ['$http', 'localStorageService', 'UserService',
    function ($http, localStorageService, UserService) {
        let service = {};
        service.localStorage = localStorageService;

        // cart  is an array of products
        service.cart = [];
        service.priceSum = 0;
        service.userService = UserService;

        service.addRecordToCart = function (record) {
            console.log("CartService::addRecordToCart");

            let addRecordIndexInCart = service.recordIndexInCart(record);
            if (addRecordIndexInCart > -1) {
                service.cart[addRecordIndexInCart].Quantity++;
            }
            else {
                service.cart.push({
                    RecordID: record.RecordID,
                    Name: record.Name,
                    Artist: record.Artist,
                    Price: record.Price,
                    ReleasedYear: record.ReleasedYear,
                    Description: record.Description,
                    PicturePath: record.PicturePath,
                    ArriveDateInStore: record.ArriveDateInStore,
                    Quantity: 1
                });
            }

            service.priceSum += record.Price;
            service.updateCartCookie();
            alert("'" + record.Name + "' " + "has been added to your cart");
        };

        service.removeRecordFromCart = function (record) {
            console.log("CartService::removeRecordFromCart");

            let recordIndexInCart = service.recordIndexInCart(record);
            if (recordIndexInCart > -1) {
                // the given record is in cart
                if (service.cart[recordIndexInCart].Quantity == 1) {
                    // record has once instance in the cart
                    service.cart.splice(recordIndexInCart, 1);
                }
                else {
                    //then given record has more than one instance in the cart
                    service.cart[recordIndexInCart].Quantity--;
                }

                service.priceSum -= record.Price;
                service.updateCartCookie();
                alert("'" + record.Name + "' " + "has been removed from your cart");

            }
            else {
                alert("This Record is not in your shopping cart")
            }
        };

        service.recordIndexInCart = function (record) {
            console.log("CartService::recordIndexInCart");

            for (var i = 0; i < service.cart.length; i += 1) {
                if (service.cart[i]['RecordID'] === record.RecordID) {
                    return i;
                }
            }
            return -1;
        };

        service.updateCartCookie = function () {
            let storageCart = {};
            storageCart.items = service.cart;
            storageCart.price = service.priceSum;
            service.localStorage.set(service.userService.username, storageCart);
        };

        service.searchCartInLocalStorage = function () {
            var storage = service.userService.localStorage.get(service.userService.username);
            if (storage != null) {
                service.cart = storage.items;
                service.priceSum = storage.price;
            }
        };

        return service;
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.directive('modalDialog', function () {
    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        replace: true, // Replace with the template below
        transclude: true, // we want to insert custom content inside the directive
        link: function (scope, element, attrs) {
            scope.dialogStyle = {};
            if (attrs.width)
                scope.dialogStyle.width = attrs.width;
            if (attrs.height)
                scope.dialogStyle.height = attrs.height;
            scope.hideModal = function () {
                scope.show = false;
            };
        },
        template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
    };
});