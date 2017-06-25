/**
 * Created by Hasidi on 20/06/2017.
 */

// it is just an example! It no means it is the right way to handle storage global calls!!!!!
//Follow the design principles you have learned during lessons!!!
angular.module("myApp")
    .controller('StorageExampleController', ['localStorageService','$window', function (localStorageService, $window) {
    let self = this;
    self.value1 = '';
    self.value2 = '';

    self.addData = function () {
        let lsLength = localStorageService.length();
        let valueStored = localStorageService.get(self.key1);
        if (!valueStored) {
            if (localStorageService.set(self.key1, self.value1))
                $window.alert('data was added successfully');
            else
                $window.alert('failed to add the data');
        }
        else
            $window.alert('failed to add the data');

        localStorageService.get(key);
    };
    self.deleteData = function () {
        let valueStored = localStorageService.get(self.key1);
        if (valueStored) {
            localStorageService.remove(self.key1);
            $window.alert('data was deleted successfully');
        }
        else
            $window.alert('failed to delete the data');
    };

    self.addCookie = function () {
        let cookieVal = localStorageService.cookie.get(self.cookieKey);
        if (!cookieVal)
            if (localStorageService.cookie.set(self.cookieKey,self.cookieValue, 3))
                $window.alert('cookie was added successfully');
            else
                $window.alert('failed to add the cookie');
        else
            $window.alert('failed to add the cookie');
    };

    self.deleteCookie = function () {

        let cookieVal = localStorageService.cookie.get(self.cookieKey);
        if (cookieVal) {
            localStorageService.cookie.remove(self.cookieKey);
            $window.alert('data was deleted successfully');
        }
        else
            $window.alert('failed to delete the cookie');
    };
}]);