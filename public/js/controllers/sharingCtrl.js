angular.module('sharingCtrl', [])
.controller('SharingController', ['$rootScope', '$scope','$route', '$http', 'OktaAuthService', 'Inspector', 'OKTA_CONFIG', function($rootScope, $scope, $route, $http, OktaAuthService, Inspector, OKTA_CONFIG) {

    var accessToken = $rootScope.oktaAuth.tokenManager.get('access-token');
    var idToken = $rootScope.oktaAuth.tokenManager.get('id-token');

    $scope.idToken = idToken.idToken;
    $scope.idTokenPayload = JSON.parse($rootScope.unsafeIdToken.data.payload); 

    var uid = $scope.idTokenPayload.sub;
    $scope.boxUser = {};

    // load the Box user info for the current Okta user, mapped by login
    $scope.loadBoxUser = function() {

        var data = {
            token: accessToken,
            oktaLogin: $scope.idTokenPayload.preferred_username
        }

        $http.post('/box/user', data)
            .then(function(res) {
                console.log(res);
                $scope.boxUser = res;
            });
    }

    $scope.loadBoxUser();

}]);