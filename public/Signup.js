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