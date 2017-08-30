angular.module('implicitCallbackCtrl', [])
    .controller('ImplicitCallbackController', ['$rootScope','$route', '$routeParams', '$location', 'OktaAuthService', 'Inspector', function($rootScope, $route, $routeParams, $location, OktaAuthService, Inspector) {

    $rootScope.$broadcast('refreshInspectors', '');

    $rootScope.oktaAuth.token.getWithoutPrompt({
        responseType: ['id_token', 'token'],
        sessionToken: $rootScope.oktaAuth.session  
    })
    .then(function(tokenArray) {
        Inspector.pushTokenInspector('id-token-jwt', tokenArray[0].idToken);
        Inspector.pushTokenInspector('access-token-jwt', tokenArray[1].accessToken);
        

        $rootScope.oktaAuth.tokenManager.add('id-token', tokenArray[0]);
        $rootScope.oktaAuth.tokenManager.add('access-token', tokenArray[1]);

        //OktaAuthService.putToken('id-token', tokenArray[0]);
        //OktaAuthService.putToken('access-token', tokenArray[1]);

        OktaAuthService.decodeToken(tokenArray[1].accessToken)
            .then(function(res) {
                if (res.status == 200) {
                    Inspector.pushTokenInspector('access-token', OktaAuthService.prettifyToken(res.data));
                } else {
                    console.error('Error decoding access token.');
                }
            });

        OktaAuthService.decodeToken(tokenArray[0].idToken)
            .then(function(res) {
                if (res.status == 200) {
                    Inspector.pushTokenInspector('id-token', OktaAuthService.prettifyToken(res.data));
                } else {
                    console.error('Error decoding id token.');
                }
            })            
            .catch(function(err) {
                console.error('Error decoding ID token: ' + err);  
            });

        $rootScope.oktaAuth.session.get() 
            .then(function(session) {
                $rootScope.oktaSessionToken = session;
                Inspector.pushTokenInspector('okta-session-token', OktaAuthService.prettifyToken(session));
            })
            .catch(function(err) {
                console.error('Error decoding access token: ' + err);  
            });

            OktaAuthService.activeSession = true;
            $location.path('/landing');

    })
    .catch(function(err) {
        console.error('Error retrieving tokens: ' + err);
    });
}]);