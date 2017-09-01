angular.module('landingCtrl', [])
    .controller('LandingController', ['$scope','$route', '$http', 'OktaAuthService', 'Inspector', function($scope, $route, $http, OktaAuthService, Inspector) {

    $scope.user = {};
    $scope.userApiam = {};

    function testUser(mode) {
        $http.get('/users/me:' + mode)
            .then(function(res) {
                $scope.user = JSON.stringify(res.data, undefined, 2);
            });
        }

testUser('default');
testUser('apiam');

}]);