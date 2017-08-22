angular.module('implicitCallbackCtrl', [])
    .controller('ImplicitCallbackController', ['$rootScope', '$scope','$route', 'OktaAuthService', 'Inspector', function($rootScope, $scope, $route, OktaAuthService, Inspector) {

    $rootScope.oktaAuth.token.parseFromUrl()
        .then(function(tokenArray) {
            console.log('LandingController tokenArray: ' + tokenArray);
            Inspector.pushTokenInspector('access-token', tokenArray[1]);
            Inspector.pushTokenInspector('id-token', tokenArray[0]);
        });

        // redirect to landing if login is successful

}]);