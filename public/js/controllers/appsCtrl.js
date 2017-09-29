angular.module('appsCtrl', [])
.controller('AppsController', ['$rootScope', '$scope','$route', '$http', 'OktaAuthService', 'OKTA_CONFIG', function($rootScope, $scope, $route, $http, OktaAuthService, OKTA_CONFIG) {

    var accessToken = $rootScope.oktaAuth.tokenManager.get('access-token');
    var idToken = $rootScope.oktaAuth.tokenManager.get('token');
   
    $scope.idTokenPayload = JSON.parse($rootScope.unsafeIdToken.data.payload);
    $scope.successMsg = '';
    $scope.errorMsg = '';

    /* TODO: probably don't need target URL */
    // post to a route that will call Mike's OIDC ID Token to SAML assertion translation service
    // Mike's service will redirect, so display the response below
    $scope.handleOIDCtoSAML = function() {

        var payload = {sub: $scope.idTokenPayload.sub}
        var successMsg = '';
        var errorMsg = ''

        $http.post('/utils/oidc2saml', payload)
            .then(function(res) {
                if (res.status == 301) {
                    successMsg = 'User was successfully redirected to OIDC ID Token -> SAML Assertion translation service.';
                    console.log(successMsg);
                    $scope.successMsg = successMsg;
                } else {
                    errorMsg = 'There was an error accessing the OIDC ID Token -> SAML Assertion translation service.';
                    console.error(errorMsg);
                    $scope.errorMsg = errorMsg;
                }
            })
            .catch(function(error) {
                errorMsg = 'Uncaught exception accessing the OIDC ID Token -> SAML Assertion translation service: ' + error;
                console.error(errorMsg);
                $scope.errorMsg = errorMsg;
            });
    }

    $scope.handleClearMsg = function() {
        $scope.successMsg = '';
        $scope.errorMsg = '';
    }
    
}]);