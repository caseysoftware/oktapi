angular.module('oktaAuthService', [])
    .service('OktaAuthService', ['$rootScope','$q','$http', '$location', 'Inspector', function($rootScope, $scope, $q, $http, $location, Inspector) {

    const oAuthFlow = $rootScope.appConfig.oAuthFlow;
    var redirectUri = '';

    switch (oAuthFlow) {
        case 'implicit': {
            redirectUri = $rootScope.oktaConfig.loginRedirectUri_implicit;
            break;
        } 
        case 'authorization_code': {
            redirectUri = $rootScope.oktaConfig.loginRedirectUri_code;
            break;
        }
    }

    $rootScope.oktaAuth = new OktaAuth({
        url: $rootScope.oktaConfig.oktaOrgUrl,
        clientId: $rootScope.oktaConfig.clientId,
        redirectUri: redirectUri,
        issuer: $rootScope.oktaConfig.authServerUrl,
        authorizeUrl: $rootScope.oktaConfig.authServerAuthUrl
    });

    this.loginImplicit = function() {   
        $rootScope.oktaAuth.token.getWithRedirect({
            responseType: $rootScope.oktaConfig.responseType,
            scopes: $rootScope.oktaConfig.scope
        });
    }

}]);