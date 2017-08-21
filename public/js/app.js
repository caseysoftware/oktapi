var app = angular.module('OKTAPI', ['ngRoute', 'appRoutes', 'homeCtrl', 'loginCtrl', 'landingCtrl', 'headerCtrl', 'adminCtrl', 'routerService']);

app.run(['$rootScope', '$location', function($rootScope, $location){
    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
        console.error('$routeChangeError: ' + JSON.stringify(rejection));
        $location.path('/');
    });
    $rootScope.$on("$routeChangeSuccess", function(event, current, previous, rejection) {
        console.log('$routeChangeSuccess: ' + ' --> ' + current.loadedTemplateUrl);
    });
}]);