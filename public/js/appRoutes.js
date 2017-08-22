angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeController',
			activeTab: '/home',
			resolve: {
				routePermitted: function(RouterService){
					var chk = RouterService.checkAccess('');
					if (chk.$$state.value.type === 'ACCESS_DENIED') {
						activeTab: '/home';
					}
					return chk;
				  }
			}
		})
		// Login page with Implicit Flow
		.when('/loginImplicit', {
			templateUrl: 'views/loginImplicit.html',
			controller: 'LoginController',
			activeTab: '/loginImplicit',
			resolve: {
				routePermitted: function(RouterService){
					var chk = RouterService.checkAccess('');
					if (chk.$$state.value.type === 'ACCESS_DENIED') {
						activeTab: '/home';
					}
					return chk;
				  }
			}
		})
		// Login page with Authorization Code Flow
		.when('/loginCode', {
			templateUrl: 'views/loginCode.html',
			controller: 'LoginController',
			activeTab: '/loginCode',
			resolve: {
				routePermitted: function(RouterService){
					var chk = RouterService.checkAccess('');
					if (chk.$$state.value.type === 'ACCESS_DENIED') {
						activeTab: '/home';
					}
					return chk;
				  }
			}
		})
		// This is where you are redirected after a successful login
		.when('/landing', {
			templateUrl: 'views/landing.html',
			controller: 'LandingController',
			activeTab: '/landing',
			resolve: {
				routePermitted: function(RouterService){
					var chk = RouterService.checkAccess('');
					if (chk.$$state.value.type === 'ACCESS_DENIED') {
						activeTab: '/home';
					}
					return chk;
				  }
			}
		})
		// Administrative functions (CRUD, Factors, etc.)
		.when('/admin', {
			templateUrl: 'views/admin.html',
			controller: 'AdminController',
			activeTab: '/admin',
			resolve: {
				routePermitted: function(RouterService){
					var chk = RouterService.checkAccess('');
					if (chk.$$state.value.type === 'ACCESS_DENIED') {
						activeTab: '/home';
					}
					return chk;
				  }
			}
		})
		// callback for Implicit flow
		.when('/implicit-callback', {
			templateUrl: 'views/implicitCallback.html',
			controller: 'ImplicitCallbackController'
		})
		.otherwise({ redirectTo: '/' });

	$locationProvider.html5Mode(true);

}]);
