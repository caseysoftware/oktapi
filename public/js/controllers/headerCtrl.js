angular.module('headerCtrl', ['ngSanitize']).controller('HeaderController', ['$rootScope', '$scope', '$sce', '$http', '$location', '$route', '$q', 'ConfigService', 'Inspector', 'OktaAuthService', 'OKTA_CONFIG', function($rootScope, $scope, $sce, $http, $location, $route, $q, 
    ConfigService, Inspector, OktaAuthService, OKTA_CONFIG) {

    /* TODO
        - stop using $rootScope, use OktaAuthService instead
        - signout should call OktaAuth Service, not $rootScope directly
        - signout should redirect to /home and refresh the nav bar
    */
    $scope.navbarElements = {};
    $scope.currentNav = '';
    $scope.appDisplayName = OKTA_CONFIG.appDisplayName;

    $scope.$on('$routeChangeSuccess', function() {
        // not in use but could be handy
    });

    $rootScope.$on('rootScope:buildNav', function(event, data) {
        $scope.getNavElements(data.activeSession, data.accessToken)
            .then(function(res) {
                $scope.navbarElements = res;
                $scope.prettyNavbarElements = JSON.stringify(res, undefined, 2);
                //console.log($scope.navbarElements);
                Inspector.pushGeneralInspector('navbar-html', $scope.prettyNavbarElements);
                updateNav();
            });
    });

    $scope.loggedIn = function() {
        return OktaAuthService.activeSession;
    }

    // check to see if 1) we need an active session to see this tab, and 2) if we have an active session
    $scope.checkSession = function(currentRoute) {
        return ConfigService.routes[currentRoute].sessionRequired ? OktaAuthService.activeSession : true;
    }

    /*
    // Check to see if we should display (ng-if) this element based on...
    $scope.displayNavElement = function(currentElement) {
        
        var displayElement = true;

        displayElement = (currentElement == '/register' && OktaAuthService.activeSession) ? true : false;

        return displayElement;
    };
    */

    // Redraw the HTML for the dynamic navbar
    function updateNav() {
        
        var navHtml = '';
        var subNav = '';
        var navElements = $scope.navbarElements;
    
        //console.log($scope.navbarElements)

        for (nav in navElements) {
            if (navElements[nav].visible) {
                if (navElements[nav].children) {
                    navHtml +=  '<li class="nav-item ' + getClass(navElements[nav]) + '" ng-class="dropdown ' + getClass(nav) + '">';
                    navHtml += '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + navElements[nav].displayName + ' <span class="caret"></span></a>';
                    navHtml += '<ul class="dropdown-menu" role="menu">';
                    for (child in navElements[nav].children) {
                        subNav = '';
                        //console.log('nav kids: ' + navElements[nav].children[child].route + ' ' + navElements[nav].children[child].displayName);
                        if (navElements[nav].children[child].visible) {
                            subNav = '<li class="nav-item ' + getClass(navElements[nav].children[child]) + '" ng-class="nav-item"><a class="nav-link" href="' + navElements[nav].children[child].route + '">' + navElements[nav].children[child].displayName + '</a></li>';
                        }
                        //console.log('subNav: ' + subNav);
                        navHtml += subNav;
                    }
                    navHtml += '</ul></li>'
                } else {
                    navHtml += '<li class="nav-item ' + getClass(navElements[nav]) + '" ng-class="nav-item ' + getClass(nav) + '"><a class="nav-link" href="' + nav + '">' + navElements[nav].displayName + '</a></li>\n';        
                }
            }
        }
        $scope.currentNav = $sce.trustAsHtml(navHtml);
    }


    // We're having to override the class on navbar elements to make sure tabs for unpermitted routes don't look active. 
    // This is because we are blocking inaccessable routes with $q.reject and redirecting back to home.
    //$scope.getClass = function(navElement) { 

    function getClass(navElement) {
        
        var elementClass = '';
        var activeTab = ($route.current ? $route.current.activeTab : '/home');
        var active = navElement.route == activeTab; 
        var children = {};

        children = navElement.children;

        if (children) {
            for (child in navElement.children) {
                if (navElement.children[child].route == activeTab) active = true;
                //console.log("Checking nav children of " + navElement.displayName + "  " + navElement.children[child].route + ' ' + activeTab + " " + active);
            }
        }

        if (active) { 
            elementClass += 'active';
        } else {
            elementClass += 'inactive';
        };

        return elementClass;
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
       
        var deferred = $q.defer();

        $http.post('/navbar', {activeSession: activeSession, accessToken: accessToken})
            .then(function(res) {
                //$scope.navbarElements = res.data;
                //$scope.prettyNavbarElements = JSON.stringify(res.data, undefined, 2);
                deferred.resolve(res.data);
            })
            .catch(function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
    };

    // Handle logout
    $scope.logout = function() {
        $rootScope.oktaAuth.signOut()
        .then(function() {
            OktaAuthService.activeSession = false;
            OktaAuthService.clearSessions();
            $rootScope.oktaAuth.tokenManager.clear();
            $rootScope.oktaSessionToken = {};
            $rootScope.currentUser = {};
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