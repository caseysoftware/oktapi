angular.module('loginCtrl', [])
    .controller('LoginController', ['$scope', '$http', 'OktaAuthService', function($scope, $http, OktaAuthService) {
          
    $scope.username = '';
    $scope.password = '';

    document.getElementById("username").focus();

    // Implicit Flow
    $scope.loginImplicit = function() {    
        OktaAuthService.loginImplicit(this.username, this.password);
    }

    // Authorization Code Flow
    $scope.loginCode = function() {

    }

    /*
        TODO:
        - :8000/implicitCallback
            handle callback and redirect to landing page
    */


}]);