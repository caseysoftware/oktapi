angular.module('sharingCtrl', [])
.controller('SharingController', ['$rootScope', '$scope','$route', '$http', 'OktaAuthService', 'Inspector', 'OKTA_CONFIG', function($rootScope, $scope, $route, $http, OktaAuthService, Inspector, OKTA_CONFIG) {

    var accessToken = $rootScope.oktaAuth.tokenManager.get('access-token'); 

    $scope.boxUser = {};

    // load the Box user info for the current Okta user, mapped by login
    $scope.loadBoxUser = function() {

        var data = {
            token: accessToken,
            oktaLogin: $rootScope.authenticatedUser.preferred_username
        }

        $http.post('/box/user', data)
            .then(function(res) {
                console.log(res);
                Inspector.pushHttpInspector('box-get-user', JSON.stringify(res, undefined, 2));
                $scope.boxUser = res.data;
            });
    }

    $scope.loadBoxUser();

}]);