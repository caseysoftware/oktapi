angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	var sessionValid = false;
	var scopeValid = false;
	var permitted = false;

	$routeProvider
		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeController',
			activeTab: '/home',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /home successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		}) 
		.when('/home', {
			templateUrl: 'views/home.html',
			controller: 'HomeController',
			activeTab: '/home',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /home successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		}) 
		.when('/register', {
			templateUrl: 'views/register.html',
			controller: 'RegisterController',
			activeTab: '/register',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /register successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		}) 
		// Login page with Implicit Flow
		.when('/loginImplicit', {
			templateUrl: 'views/loginImplicit.html',
			controller: 'LoginController',
			activeTab: '/loginImplicit',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /loginImplicit successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		// Login page with Authorization Code Flow
		.when('/loginCode', {
			templateUrl: 'views/loginCode.html',
			controller: 'LoginController',
			activeTab: '/loginCode',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /loginCode successful');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		// This is where you are redirected after a successful login
		.when('/landing', {
			templateUrl: 'views/landing.html',
			controller: 'LandingController',
			activeTab: '/landing',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /landing successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		// Administrative functions (CRUD, Factors, etc.)
		.when('/admin', {
			templateUrl: 'views/admin.html',
			controller: 'AdminController',
			activeTab: '/admin',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /admin successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		.when('/users', {
			templateUrl: 'views/users.html',
			controller: 'UsersController',
			activeTab: '/users',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /users successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		.when('/userDetails', {
			templateUrl: 'views/userDetails.html',
			controller: 'UserDetailsController',
			activeTab: '/users',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /userDetails successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		.when('/apps', {
			templateUrl: 'views/apps.html',
			controller: 'AppsController',
			activeTab: '/users',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /apps successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		.when('/groups', {
			templateUrl: 'views/groups.html',
			controller: 'GroupsController',
			activeTab: '/groups',
			resolve: {
				routePermitted: ['RouterService', function(RouterService) {
					return RouterService.checkRoutePermissions().then(function(res) {
						console.log('Route change to /groups successful.');
					})
					.catch(function(err) {
						activeTab: '/home';
						throw(err);
					})
				}]
			}
		})
		// callback for Implicit flow
		.when('/implicit-callback', {
			templateUrl: 'views/implicitCallback.html',
			controller: 'ImplicitCallbackController'
		})
		//.otherwise({ redirectTo: '/' });

	$locationProvider.html5Mode(true);

}]);
