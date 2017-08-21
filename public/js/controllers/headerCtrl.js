angular.module('headerCtrl', []).controller('HeaderController', ['$rootScope', '$scope', '$location', '$route', function($rootScope, $scope, $location, $route) {

    $scope.$on('$routeChangeSuccess', function() {
        // not in use but could be handy
    });

    // We're having to override the class on navbar elements to make sure tabs for unpermitted routes don't look active. 
    // This is because we are blocking inaccessable routes with $q.reject and redirecting back to home.
    $scope.getClass = function (viewLocation) { 
        var activeTab = ($route.current ? $route.current.activeTab : '/home');
        var active = viewLocation == activeTab; 
        if (active) { 
            return 'active';
        } else {
            return 'disabled';
        };
    };

}]);