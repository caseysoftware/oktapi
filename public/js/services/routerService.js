angular.module('routerService', [])
	.service('RouterService', ['$rootScope', '$q', '$http', '$location', 'OktaAuthService', 'ConfigService', 'Inspector', function($rootScope, $q, $http, $location, OktaAuthService, ConfigService, Inspector) {

		var sessionExempt = true;
		var sessionValid = true;
		var claimExempt = true;
		var claimValid = true;

		this.accessToken = '';
		this.activeSession = false;

		var token = ''; /*TODO: is this used? */
		var routes = ConfigService.routes;					// get the route session/claim config from the ConfigService

		// Check to see if there's an active Okta session
		checkSession = function() {	
			return $rootScope.oktaAuth.session.exists();
		}

		// Check to see if the user has the necessary claims (roles) for this route
		function checkClaims(requiredClaims) {
			var currentPath = $location.$$path;
			this.accessToken = this.activeSession ? $rootScope.oktaAuth.tokenManager.get('access-token').accessToken : '';

			return $http.post("/checkClaims", { accessToken: this.accessToken, route: currentPath});
		}

		// Check to see if we have access to the route
		function checkAccess(sessionValid, claimsValid) {		
			var currentPath = $location.$$path;
			this.accessToken = this.activeSession ? $rootScope.oktaAuth.tokenManager.get('access-token').accessToken : '';
			return $http.post('/routePermission', {activeSession: sessionValid, claimsValid: claimsValid, route: currentPath, accessToken: this.accessToken});
		}

		this.checkRoutePermissions = function() {
			var sessionValid = false;
			var claimsValid = false;
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
						this.activeSession = true;
					} else { 
						$rootScope.$broadcast('rootScope.handleNoActiveSession');
						this.activeSession = false;
					}
					checkClaims() 
						.then(function(res) {
							// Generate the navbar
							$rootScope.$broadcast('rootScope:buildNav', {activeSession: this.activeSession, accessToken: this.accessToken});
							claimsValid = res.data.routePermitted;
							console.log('Checking required claims: ' + res.data.msg);
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

								checkAccess(sessionValid, claimsValid)
								.then(function(res) {
									permitted = res.data.routePermitted;
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


