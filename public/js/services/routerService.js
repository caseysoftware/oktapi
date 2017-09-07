angular.module('routerService', [])
	.service('RouterService', ['$rootScope', '$q', '$http', '$location', 'OktaAuthService', 'ConfigService', 'Inspector', function($rootScope, $q, $http, $location, OktaAuthService, ConfigService, Inspector) {

		var sessionExempt = true;
		var sessionValid = true;
		var scopeExempt = true;
		var scopeValid = true;

		var token = '';
		var routes = ConfigService.routes;					// get the route session/scope config from the ConfigService

		// Check to see if there's an active Okta session
		checkSession = function() {	
			return $rootScope.oktaAuth.session.exists();
		}

		/* TODO: change references from scopes to claims */
		/* TODO: move checkScopes (claims) and to oktaAuthService.
			Check each route change, but then stuff them into an array on OktaAuthSErvice 
			so other controllers (like headerController) can get to them.

		*/

		// Check to see if the user has the necessary scopes
		function checkScopes(requiredClaims) {
			var currentPath = $location.$$path;
			var token = $rootScope.oktaAuth.tokenManager.get('access-token').accessToken;
			var requiredClaims = routes[currentPath]['scopesRequired'];
			return $http.post("/checkRoutePermissions", { accessToken: token, requiredClaims: requiredClaims});
		}

		// Check to see if we have access to the route
		function checkAccess(sessionValid, scopeValid) {
			
			// check to see if the current route requires an active session and/or specific scopes
			var currentPath = $location.$$path;
			var sessionExempt = !routes[currentPath]['sessionRequired'];
			var scopesNeeded =  routes[currentPath]['scopesRequired'].length;
			var scopeExempt =  (scopesNeeded <= 0);

			var deferred = $q.defer();
			var sessionOk = sessionExempt ? sessionExempt : sessionValid;
			var scopeOk = scopeExempt ? scopeExempt : scopeValid;

			permitted = sessionOk && scopeOk;
		
			console.log('Route decision: [Session required: ' + !sessionExempt + ' | active:  ' + sessionValid + '] [Scopes required: ' + !scopeExempt + ' | present: ' + scopeValid + ']');
	
			deferred.resolve(permitted);

			return deferred.promise;
		}

		this.checkRoutePermissions = function() {
			var sessionValid = false;
			var scopeValid = false;
			var permitted = false;
			var idToken = {};
			var accessToken = {};
			var deferred = $q.defer();

			checkSession()
				.then(function(res) {
					OktaAuthService.activeSession = res;						// set activeSession on OktaAuthService on every route change. That variable is used by the navbar.
					sessionValid = res;
					if (sessionValid) {
						$rootScope.$broadcast('rootScope:handleActiveSession');
					} else { 
						$rootScope.$broadcast('rootScope.handleNoActiveSession');
					}
					checkScopes() 
						.then(function(res) {
							scopeValid = res.data.routePermitted;
							if (res.data.missingClaims) console.log('Missing claims: ' + JSON.stringify(res.data.missingClaims, undefined, 2));
							var session = OktaAuthService.getSession()
								.then(function(session) {
									OktaAuthService.prettifyToken(session)
										.then(function(pretty) {
											Inspector.pushSessionInspector('okta-session-token', pretty);
										});
								})
								.then(function(err) {
									console.log('Unable to get current session from OktaAuthService.');
								});

								// This section is just here to refresh the Inspector with the current session and token info - no other purpose
								// ----------------------------------------------------------------
								idToken = OktaAuthService.getToken('id-token');
								accessToken = OktaAuthService.getToken('access-token');
								if (idToken) {
									Inspector.pushTokenInspector('id-token-jwt', idToken.idToken);
									OktaAuthService.decodePrettyToken(idToken.idToken)
									.then(function(pretty) {
										Inspector.pushTokenInspector('id-token', pretty);
									});
								}
								if (accessToken) {
									Inspector.pushTokenInspector('access-token-jwt', accessToken.accessToken);
									
									OktaAuthService.decodePrettyToken(accessToken.accessToken)
									.then(function(pretty) {
										Inspector.pushTokenInspector('access-token', pretty);
									});
								}
								// ----------------------------------------------------------------

								checkAccess(sessionValid, scopeValid)
								.then(function(res) {
									permitted = res;
									if (permitted) {
										deferred.resolve(true);
									} else {
										deferred.reject({ type: 'ACCESS_DENIED' });
									}
								});
						});
						
				});
				return deferred.promise;
			}
	}]);


