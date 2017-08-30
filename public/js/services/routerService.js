angular.module('routerService', [])
	.service('RouterService', ['$rootScope', '$q', '$http', '$location', 'OktaAuthService', function($rootScope, $q, $http, $location, OktaAuthService) {

		var sessionExempt = true;
		var sessionValid = true;
		var scopeExempt = true;
		var scopeValid = true;

		var token = '';
		
		const routes = {
			'/': {
				sessionRequired: false,
				scopesRequired: ''
			},
			'/home': {
				sessionRequired: false,
				scopesRequired: ''
			},
			'/loginImplicit': {
				sessionRequired: false,
				scopesRequired: ''				
			},
			'/loginCode': {
				sessionRequired: false,
				scopesRequired: ''				
			},
			'/landing': {
				sessionRequired: true,
				scopesRequired: ''				
			},			
			'/admin': {
				sessionRequired: true,
				scopesRequired: 'users:read, users:write'				
			}
		}

		// Check to see if there's an active Okta session
		checkSession = function() {	
			var currentPath = $location.$$path;
			return $rootScope.oktaAuth.session.exists() 
		}

		// Check to see if the user has the necessary scopes
		function checkScopes() {
			var currentPath = $location.$$path;
			return $http.post("/checkRoutePermissions", { userToken: "blah", route: currentPath });
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
			var deferred = $q.defer();

			checkSession()
				.then(function(res) {
					sessionValid = res;
					checkScopes() 
						.then(function(res) {
							scopeValid = res.data.routePermitted;
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


