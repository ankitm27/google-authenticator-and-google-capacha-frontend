var app = angular.module('TaskManager', ['ngRoute', 'monospaced.qrcode', 'vcRecaptcha']);


// routes provides routes different html according to different url
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'homeController'
        })
        .when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'signupController'
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'loginController'
        })
});

//service to access backend api
app.factory("services", ["$http",
    function ($http) {
        //var socket = "http://13.127.73.144";
        const socket = "http://127.0.0.1:3000";
        var obj = {};
        obj.signup = function (data) {
            console.log("socket", socket);
            return $http.post(socket + '/users/signup/', data);
        };
        obj.authenticate = function (data) {
            return $http.post(socket + '/users/authenticateemailpassword/', data);
        };
        obj.login = function (data, token) {
            return $http.post(socket + '/users/login/', data, {
                "headers": {"token": token}
            });
        };
        obj.getWallet = function (token) {
            return $http.get(socket + '/wallet/iswalletexist/', {
                "headers": {"token": token}
            });
        };
        obj.generateWallet = function (data, token) {
            return $http.post(socket + '/wallet/generate/etherwallet/', data, {
                "headers": {"token": token}
            });
        };
        return obj;
    }
]);

// create the controller and inject Angular's $scope
//app.controller('homeController', function ($scope, services) {
//    $scope.message = 'Everyone come and see how good I look!';
//});


//check user is logged in
var isLoggedin = function () {
    if (window.localStorage['user'] != undefined) {
        return true;
    }
    return false;
}

//find logged in user
var loggedinUser = function () {
    if (isLoggedin()) {
        return angular.fromJson(window.localStorage['user']);
    }
    return {};
}

//find token of logged in user
var getToken = function () {
    var data = loggedinUser();
    return data.token;
}

//logged out user
var loggedout = function () {
    window.localStorage.removeItem('user');
}


//signup controller
app.controller('signupController', function ($scope, $location, services, vcRecaptchaService) {
    $scope.publicKey = "6LeuvFEUAAAAADqBBbQQ0tFYnuBpP7dVhDPXB8cM";
    $scope.isLoggedin = isLoggedin();
    $scope.removeAlert = function () {
        $scope.success = '';
        $scope.error = '';
    }
    $scope.isSuccess = false;
    $scope.isError = false;
    $scope.removeAlert();
    $scope.isLoader = true;
    $scope.ga_authenticator = false;
    $scope.submitForm = function () {
        if ($scope.password != $scope.confirm_password) {
            $scope.isSuccess = false;
            $scope.isError = true;
            $scope.error = "Please provide same password and confirm password"
        } else {
            const data = {
                "email": $scope.email,
                "password": $scope.password,
                "gRecaptchaResponse": vcRecaptchaService.getResponse()
            }
            services.signup(data).then(function (data) {
                $scope.isError = false;
                $scope.isSuccess = true;
                $scope.success = data.data.message;
                $scope.ga_authenticator = true;
                $scope.ga_secret = data.data.data.secret;
                $scope.qr_url = data.data.data.QRScanUrl
            }, function (err) {
                $scope.isSuccess = false;
                $scope.isError = true;
                if(err.data) {
                    $scope.error = err.data.message;
                }else{
                    $scope.error = "There is some problem to connect with backend server. Please wait for some time";
                }
            });
            $scope.isLoader = false;
        }
    }
});

//login controller
app.controller('loginController', function ($scope, $location, services) {
    $scope.isLoggedin = isLoggedin();
    $scope.removeAlert = function () {
        $scope.success = '';
        $scope.error = '';
    }
    $scope.isSuccess = false;
    $scope.isError = false;
    $scope.removeAlert();
    $scope.isLoader = true;
    $scope.isAuthenticated = false;
    var token = ''
    $scope.submitForm = function () {
        const data = {
            "email": $scope.email,
            "password": $scope.password,
        }
        services.authenticate(data).then(function (data) {
            $scope.isAuthenticated = true;
            $scope.success = data.data.message;
            token = data.data.data.token;
            $scope.isError = false;
            $scope.isSuccess = true;
            $scope.success = $scope.success + ". Enter the 6 digit OTP from Google Authenticator app";
        }, function (err) {
            $scope.isSuccess = false;
            $scope.isError = true;
            if(err.data) {
                $scope.error = err.data.message;
            }else{
                $scope.error = "There is some problem to connect with backend server. Please wait for some time";
            }
        });
        $scope.isLoader = false;
    }
    $scope.submitLoginForm = function () {
        const data = {
            "email": $scope.email,
            "password": $scope.password,
            "secret": $scope.otp.toString()
        }
        services.login(data, token).then(function (data) {
            window.localStorage['user'] = angular.toJson(data.data.data);
            $scope.success = data.data.message;
            $location.path("/");
        }, function (err) {
            $scope.isSuccess = false;
            $scope.isError = true;
            if(err.data) {
                $scope.error = err.data.message;
            }else{
                $scope.error = "There is some problem to connect with backend server. Please wait for some time";
            }
        });
    }
});

//home controller
app.controller('homeController', function ($scope, $location, services) {
    $scope.isLoggedin = isLoggedin();
    $scope.removeAlert = function () {
        $scope.success = '';
        $scope.error = '';
    }
    $scope.removeAlert();
    $scope.isLoader = true;
    if ($scope.isLoggedin) {
        $scope.loggedout = function () {
            loggedout();
        };
        var token = getToken();
        services.getWallet(token).then(function (data) {
            $scope.isWalletExists = data.data.data.isWalletGenerated;
            $scope.address = data.data.data.address;
        }, function (err) {
            if(err.data) {
                $scope.error = err.data.message;
            }else{
                $scope.error = "There is some problem to connect with backend server. Please wait for some time";
            }
        });
        $scope.generateWallet = function () {
            services.generateWallet({}, token).then(function (data) {
                $scope.isWalletExists = true;
                $scope.address = data.data.data.address;
            }, function (err) {
                if(err.data) {
                    $scope.error = err.data.message;
                }else{
                    $scope.error = "There is some problem to connect with backend server. Please wait for some time";
                }
            });
        }
    }
    $scope.isLoader = false;
});
