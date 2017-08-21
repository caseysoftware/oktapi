module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	// check that the user has permission to access the current route
	app.post('/checkRoutePermissions', function(req, res) {

		var route = req.body.route;
		var allowed = false;
		var response = {};

		console.log('/checkRoutePermissions');

		if (allowed) {
			console.log('Route ' + route + ' permitted.');
			response = {route: route, routePermitted: true};
		} else {
			console.error('Route ' + route + ' not permitted.');
			response = {route: route, routePermitted: false}
		}
		res.json(response);
	});


	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};