angular.module('loginCtrl', [])
    .controller('LoginController', ['$rootScope', '$scope', '$http', 'OktaAuthService', function($rootScope, $scope, $http, OktaAuthService) {
          
    /* TODO 
        - switch from using $rootScope to store the the auth 
    */

    $scope.username = '';
    $scope.password = '';
    $scope.loginErrorMsg = '';

    document.getElementById("username").focus();

    // Implicit Flow
    $scope.loginImplicit = function() {    
        var failed = false;
        OktaAuthService.loginImplicitCallback(this.username, this.password)
        .then(function(transaction) {
            if (transaction.status === 'SUCCESS') {
                $rootScope.oktaAuth.session.setCookieAndRedirect(transaction.sessionToken, redirectUri); // Sets a cookie on redirect
            } else {
              throw 'We do not support this transaction status yet: ' + transaction.status;
            }
          })
          .fail(function(err) {
            console.log('Login failed: ' + err);
            $scope.$emit('LOGINFAILED');
          });
    }

    $scope.$on('LOGINFAILED', function(event, args) {
        $scope.loginErrorMsg = 'The username or password you entered is incorrect.';
        $scope.password = '';
        document.getElementById("username").focus();
        $scope.$apply()
    });

    // Authorization Code Flow
    $scope.loginCode = function() {

    }

    /*
        TODO:
        - :8000/implicitCallback
            handle callback and redirect to landing page
    */


}]);