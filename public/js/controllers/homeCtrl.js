angular.module('homeCtrl', [])
    .controller('HomeController', ['$scope','$route', '$http', 'OKTA_CONFIG', function($scope, $route, $http, OKTA_CONFIG) {

    $scope.appDisplayName = OKTA_CONFIG.appDisplayName;

}]);