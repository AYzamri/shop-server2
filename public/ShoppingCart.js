//-------------------------------------------------------------------------------------------------------------------
angular.module('myApp').controller('cartController', ['CartService', '$location', '$window',
    function (CartService, $location, $window) {
        let self = this;
        self.cartService = CartService;

    }]);
//-------------------------------------------------------------------------------------------------------------------
angular.module('myApp').factory('CartService', ['$http', function ($http) {
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
            id: record.RecordID,
            name: record.Name,
            artist: record.Artist,
            price: record.Price
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
            if (service.cart[i]['id'] === record.RecordID) {
                return i;
            }
        }
        return -1;
    };

    return service;
}]);