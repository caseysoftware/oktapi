angular.module('routerService', [])
	.service('RouterService', ['$q','$http', '$location', function($q, $http, $location) {

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
			'/login': {
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

		// TODO: this is just a placeholder. Need a function to check if there's an active Okta session.
		var tmpCheckSession = function() {
			return false;
		};

		// Check to see if the user has access to the current path based on 1) whether an active session is required, and 2) whether the user has the necessary scopes
		this.checkAccess = function() {

			var currentPath = $location.$$path;
			var sessionExempt = true;
			var sessionValid = false;
			var scopeExempt = true;
			var scopeValid = false;

			console.log('RouterService ' + currentPath + ' sessionRequired: '  + JSON.stringify(routes[currentPath]['sessionRequired']));

			sessionExempt = !routes[currentPath]['sessionRequired'];
			if (!sessionExempt) {
				activeSession = tmpCheckSession();
				if (activeSession) {
					sessionValid = true;
				} else {
					sessionOk = false;
					console.error('RouterService - an active session is required to access this resourse.');
				}	
			} 

			console.log('RouterService - scopesRequired: '  + JSON.stringify(routes[currentPath]['scopesRequired']) + " " + routes[currentPath]['scopesRequired'].length);
			scopeExempt = (routes[currentPath]['scopesRequired'].length <= 0);
			if (!scopeExempt) {
				$http.post("/checkRoutePermissions", { userToken: "blah", route: currentPath })
				.then(function(res) {
					scopeValid = res.data.routePermitted;
					if (!scopeValid) { 
						console.error('RouterService - the user does not possess the required scopes to access this resource.');
					}
				});
			} 

			/* TODO: we're lucky this is working. Should be doing this from the .then() of the service */
			var sessionOk = sessionExempt + sessionValid;
			var scopeOk = scopeExempt + scopeValid;
			permitted = sessionOk * scopeOk;
			
			if (permitted == 1) {
				return $q.when(true);
			} else {
				return $q.reject({ type: 'ACCESS_DENIED' });
			}
		}
	}]);


