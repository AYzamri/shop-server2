//-------------------------------------------------------------------------------------------------------------------
app.controller('cartController', ['CartService', '$location', '$window',
    function (CartService, $location, $window) {
        let self = this;
        self.cartService = CartService;

        self.seeRecordDetails = function (record) {
            self.recordToSee = record;
            self.toggleModal();
        };

        self.modalShown = false;
        self.toggleModal = function() {
            self.modalShown = !self.modalShown;
        };

    }]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('CartService', ['$http', function ($http) {
    let service = {};

    // this is the shopping cart which will be presented in cart.html
    // array of products, each product is represented:
    // {id, name, artist, price, quantity}
    service.cart = [];

    // when product goes inside the cart - increase priceSum with it's price
    // when product goes outside the cart - decrease priceSum with it's price
    service.priceSum = 0;

    service.addRecordToCart = function (record) {
        console.log("CartService::addRecordToCart");

        service.cart.push({
            RecordID: record.RecordID,
            Name: record.Name,
            Artist: record.Artist,
            Price: record.Price,
            ReleasedYear: record.ReleasedYear,
            Description: record.Description,
            PicturePath: record.PicturePath,
            ArriveDateInStore: record.ArriveDateInStore
        });
        alert("'" + record.Name + "' " + "has been added to your cart")
        service.priceSum += record.Price;
    };

    service.removeRecordFromCart = function (record) {
        console.log("CartService::removeRecordFromCart");

        let recordIndexInCart = service.recordIndexInCart(record);
        if (recordIndexInCart > -1) {
            service.cart.splice(recordIndexInCart, 1);
            service.priceSum -= record.Price;
            alert("'" + record.Name + "' " + "has been removed from your cart")
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

    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.directive('modalDialog', function() {
    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        replace: true, // Replace with the template below
        transclude: true, // we want to insert custom content inside the directive
        link: function(scope, element, attrs) {
            scope.dialogStyle = {};
            if (attrs.width)
                scope.dialogStyle.width = attrs.width;
            if (attrs.height)
                scope.dialogStyle.height = attrs.height;
            scope.hideModal = function() {
                scope.show = false;
            };
        },
        template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
    };
});