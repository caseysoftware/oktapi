angular.module('registerCtrl', [])
.controller('RegisterController', ['$scope','$route', '$location', '$http', 'OKTA_CONFIG', function($scope, $route, $location, $http, OKTA_CONFIG) {

    $scope.currentUser = {};
    $scope.currentUser.profile = {};
    $scope.currentUser.profile.secondEmail = '';
    $scope.successMsg = '';
    $scope.errorMsg = '';

    $scope.handleRegister = function() {
        $scope.errorMsg = '';
        $scope.successMsg = '';
        var data = {
            profile: $scope.currentUser.profile
        };
        
        console.log('handleRegister() $scope.currentUser.profile: ' + JSON.stringify($scope.currentUser.profile));

        $http.post("/register", data) 
            .then(function(res) {
                if (res.data.statusCode == 200) {
                    $scope.successMsg = "Please check your email for instructions to complete your registration. Welcome aboard, " + $scope.currentUser.profile.firstName + "!";
                } else {
                    $scope.errorMsg = res.data.body.errorCauses[0].errorSummary;
                }   
            });
    }

    // close the registration form, go back to home
    $scope.handleClose = function() {
        $location.path('/home');
    }

    $scope.currentUser.profile.secondEmail = OKTA_CONFIG.defaultSecondEmail;

}]);