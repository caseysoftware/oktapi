var app = angular.module('OKTAPI', ['ngRoute', 'appRoutes', 'homeCtrl', 'loginCtrl', 'landingCtrl', 'headerCtrl', 'adminCtrl', 'configService','routerService', 
    'oktaAuthService', 'implicitCallbackCtrl', 'inspectorService', 'inspectorCtrl']);

app.run(['$rootScope', '$location', '$http', 'ConfigService', function($rootScope, $location, $http, ConfigService){

    $rootScope.appConfig = ConfigService.config;

    $http.get('/config')
        .then(function(res) {
            if (res.status == 200) {
                $rootScope.oktaConfig = res.data;
            } else {
                console.error('Error retrieving Okta config info from /config');
            }
        })
        .catch(function(err) {
            console.error('Unable to access /config service');
        });

    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
        console.error('$routeChangeError: ' + JSON.stringify(rejection));
        $location.path('/');
    });
    $rootScope.$on("$routeChangeSuccess", function(event, current, previous, rejection) {
        console.log('$routeChangeSuccess: ' + ' --> ' + current.loadedTemplateUrl);
    });
}]);