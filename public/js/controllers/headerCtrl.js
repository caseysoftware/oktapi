angular.module('headerCtrl', []).controller('HeaderController', ['$rootScope', '$scope', '$location', '$route', 'ConfigService', 'Inspector', 'OktaAuthService', function($rootScope, $scope, $location, $route, ConfigService, Inspector, OktaAuthService) {

    /* TODO
        - stop using $rootScope, use OktaAuthService instead
        - signout should call OktaAuth Service, not $rootScope directly
        - signout should redirect to /home and refresh the nav bar
    */

    $scope.$on('$routeChangeSuccess', function() {
        // not in use but could be handy
    });

    $scope.loggedIn = function() {
        return OktaAuthService.activeSession;
    }

    // check to see if 1) we need an active session to see this tab, and 2) if we have an active session
    $scope.checkSession = function(currentRoute) {
        return ConfigService.routes[currentRoute].sessionRequired ? OktaAuthService.activeSession : true;
    }

    // We're having to override the class on navbar elements to make sure tabs for unpermitted routes don't look active. 
    // This is because we are blocking inaccessable routes with $q.reject and redirecting back to home.
    $scope.getClass = function (viewLocation) { 
        var activeTab = ($route.current ? $route.current.activeTab : '/home');
        var active = viewLocation == activeTab; 
        if (active) { 
            return 'active';
        } else {
            return 'inactive';
        };
    };

    // Determine which login buttons to display based on the active flows configured in the ConfigService
    $scope.displayFlow = function(tabFlow) {
        var activeFlow = ConfigService.config.oAuthFlow;
        var isActive =  tabFlow === activeFlow;
        return isActive;
    }

    // Handle logout
    $scope.logout = function() {
        console.log('Active session? ' + $rootScope.oktaSessionToken);
        OktaAuthService.activeSession = false;
        Inspector.initInspectors();
        $rootScope.oktaAuth.signOut()
        .then(function() {
            $rootScope.$broadcast('refreshInspectors', '');
            console.log('successfully logged out');
            console.log('Active session? ' + $rootScope.oktaSessionToken);
          })
          .fail(function(err) {
            console.error(err);
          });
        $rootScope.oktaAuth.tokenManager.clear();
        $location.path('/home');
    }

}]);