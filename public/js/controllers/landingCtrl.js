angular.module('landingCtrl', [])
    .controller('LandingController', ['$rootScope', '$scope','$route', '$http', 'OktaAuthService', 'Inspector', function($rootScope, $scope, $route, $http, OktaAuthService, Inspector) {


    // Intialization routines based on newly logged-in user
    /*
    $rootScope.currentUser = {};

    
    function updateCurrentUser() {
        var token = $rootScope.oktaAuth.tokenManager.get('access-token').accessToken;
        $http.get('/users/me/' + token)
        .then(function(res) {
            Inspector.pushGeneralInspector('user_me', JSON.stringify(res.data, undefined, 2))
            $rootScope.currentUser = res.data.profile.firstName + ' ' + res.data.profile.lastName;
        });
    }
    

    updateCurrentUser();

    */

}]);