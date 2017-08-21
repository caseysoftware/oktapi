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

		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'LoginController',
			activeTab: '/login',
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

		.otherwise({ redirectTo: '/' });

	$locationProvider.html5Mode(true);

}]);
