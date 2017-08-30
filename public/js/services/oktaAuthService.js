angular.module('oktaAuthService', [])
    .service('OktaAuthService', ['$rootScope', '$q', '$http', '$location', 'Inspector', 'OKTA_CONFIG', 
        function($rootScope, $q, $http, $location, Inspector, OKTA_CONFIG) {

    const oAuthFlow = $rootScope.appConfig.oAuthFlow;

    var activeSession = ''; //This variable will be used by the navbar to determine if we have an active session, so it needs to be updated on each route change.

    switch (oAuthFlow) {
        case 'implicit': {
            redirectUri = OKTA_CONFIG.loginRedirectUri_implicit;
            break;
        } 
        case 'authorization_code': {
            redirectUri = OKTA_CONFIG.loginRedirectUri_code;
            break;
        }
    }

    // We'll use the Auth SDK to kick off both flows, but we will maintain session and tokens in this service. Validation will happen in the Node app.
    $rootScope.oktaAuth = new OktaAuth({
        url: OKTA_CONFIG.oktaOrgUrl,
        clientId: OKTA_CONFIG.clientId,
        redirectUri: redirectUri,
        issuer: OKTA_CONFIG.authServerUrl,
        authorizeUrl: OKTA_CONFIG.authServerAuthUrl
    });

    // Login Flows ------------------------------

    // Login entry point for implicit flow
    this.loginImplicit = function(username, password) {

        $rootScope.oktaAuth.signIn({
            username: username,
            password: password
          })
          .then(function(transaction) {
            if (transaction.status === 'SUCCESS') {
                $rootScope.oktaAuth.session.setCookieAndRedirect(transaction.sessionToken, redirectUri); // Sets a cookie on redirect
            } else {
              throw 'We do not support this transaction status yet: ' + transaction.status;
            }
          })
          .fail(function(err) {
            console.error(err);
          });
    }

    // Login entry point for authorization code flow
    this.loginCode = function(username, password) {

    }

    // Session utlilities -----------------------

    this.getSession = function() {
         return $rootScope.oktaAuth.session.get();
    }

    // Check for active session
    this.checkSession = function(req, res) {
        $rootScope.oktaAuth.session.exists()
            .then(function(res){
                activeSession = res;
                return activeSession;
            })
    }
   
    // Token utilities --------------------------

    // Add token to tokenManager - avoid calling $rootScope if possible
    this.putToken = function(tokenKey, token) {
        $rootScope.oAuth.tokenManager.add(tokenKey, token);
    }

    // Return token to client
    this.getToken = function(tokenKey) {
        return $rootScope.oktaAuth.tokenManager.get(tokenKey);
    }

    // Return prettified, decoded token to client
    this.decodePrettyToken = function(token) {
        var deferred = $q.defer();
        this.decodeToken(token)
            .then(function(decoded) {
                var pretty = prettifyToken(decoded);
                deferred.resolve(pretty);
            })
            .catch(function(err) {
                deferred.reject(err);
            });
        return deferred.promise;
      }

    // Validate the token
    this.validateToken = function(token) {
        /* TODO: copy validation code from okta_express */
        return token;
    }

    // decode JWT token into JSON
    this.decodeToken = function(token) {
        return $http.get('/decodeToken/' + token);
    }

    // private copy of prettifyToken
    function prettifyToken(token) {
        var tokenJSON = JSON.stringify(token, undefined, 2);
        var prettyJSON = tokenJSON.replace(/\\/g, '');
        prettyJSON = prettyJSON.replace(/"{"/g, '"{\n\t"');
        //prettyJSON = prettyJSON.replace(/,/g, ',\n\t');
        //prettyJSON = prettyJSON.replace(/}/g, ',\n  }');

        return prettyJSON;
    }

    // format JSON tokens for display in Inspector
    this.prettifyToken = function(token) {
        var tokenJSON = JSON.stringify(token, undefined, 2);
        var prettyJSON = tokenJSON.replace(/\\/g, '');
        prettyJSON = prettyJSON.replace(/"{"/g, '"{\n\t"');
        //prettyJSON = prettyJSON.replace(/,/g, ',\n\t');
        //prettyJSON = prettyJSON.replace(/}/g, ',\n  }');

        return prettyJSON;
    }

}]);