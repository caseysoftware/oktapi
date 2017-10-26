var app = angular.module('OKTAPI', ['ngRoute', 'appRoutes', 'homeCtrl', 'loginCtrl', 'landingCtrl', 'headerCtrl', 'adminCtrl', 
    'configService','routerService', 'oktaAuthService', 'implicitCallbackCtrl', 'inspectorService', 'inspectorCtrl', 
    'registerCtrl', 'usersCtrl', 'userDetailsCtrl', 'groupsCtrl', 'appsCtrl', 'mfaService', 'sharingCtrl']);

/**
 * TODOs:
 *      - support for password reset and MFA enroll in login
 *      - add app chicklets to user portal
 *      - registration page
 *      - MFA factors from admin user details page
 */

loadConfig().then(bootstrapApplication);

function loadConfig() {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");
    
    return $http.get('/config')
        .then(function(res) {
            if (res.status == 200) {
            //$rootScope.oktaConfig = res.data;
            app.constant("OKTA_CONFIG", res.data);
            } else {
                console.error('Error retrieving Okta config info from /config');
            }
        })
        .catch(function(err) {
            console.error('Unable to access /config service');
        });
}

function bootstrapApplication() {
    angular.element(document).ready(function() {
        angular.bootstrap(document, ["OKTAPI"]);
    });
}

    
app.run(['$rootScope', '$location', '$http', 'ConfigService', function($rootScope, $location, $http, ConfigService){
        
        $rootScope.appConfig = ConfigService.config;

        $rootScope.unsafeIdToken = {};
        $rootScope.unsafeAccessToken = {};

        $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
            console.error('$routeChangeError: ' + rejection.type);
            $location.path('/');
        });
        $rootScope.$on("$routeChangeSuccess", function(event, current, previous, rejection) {
            //console.log('$routeChangeSuccess');
        });
}]);

