angular.module('headerCtrl', []).controller('HeaderController', ['$rootScope', '$scope', '$http', '$location', '$route', 'ConfigService', 'Inspector', 'OktaAuthService', function($rootScope, $scope, $http, $location, $route, ConfigService, Inspector, OktaAuthService) {

    /* TODO
        - stop using $rootScope, use OktaAuthService instead
        - signout should call OktaAuth Service, not $rootScope directly
        - signout should redirect to /home and refresh the nav bar
    */
    $scope.navbarElements = {};

    $scope.$on('$routeChangeSuccess', function() {
        // not in use but could be handy
    });

    $rootScope.$on('rootScope:buildNav', function(event, data) {
        $scope.getNavElements(data.activeSession, data.accessToken);
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

    /* TODO: check roles and stuff them into an array on OktaAuthService for reference. Here, match the required claims against the users */
    // Check to see if the user has the appropriate claims for this route. Don't display the nav control if not */

    // Determine which login buttons to display based on the active flows configured in the ConfigService
    $scope.displayFlow = function(tabFlow) {
        var activeFlow = ConfigService.config.oAuthFlow;
        var isActive =  tabFlow === activeFlow;
        return isActive;
    };

    // Generate navbar based on user claims 
    $scope.getNavElements = function(activeSession, accessToken) {
        $http.post('/navbar/', {activeSession: activeSession, accessToken: accessToken})
            .then(function(res) {
                $scope.navbarElements = res.data;
            });
    };

    // Handle logout
    $scope.logout = function() {
        $rootScope.oktaAuth.signOut()
        .then(function() {
            $rootScope.oktaAuth.tokenManager.clear();
            $rootScope.oktaSessionToken = {};
            OktaAuthService.activeSession = false;
            $rootScope.currentUser = '';
            Inspector.initInspectors();
            console.log('successfully logged out');
            $rootScope.$broadcast('refreshInspectors', '');
            $location.path('/home');
            $scope.$apply();
          })
          .fail(function(err) {
            console.error(err);
            $location.path('/home');
            $scope.$apply();
          });
    }

}]);