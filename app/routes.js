const oktaConfig = require('../config/oktaconfig');

//const request = require('request');
const querystring = require('querystring');
const jws = require('jws');
const jwk2pem = require('pem-jwk').jwk2pem;
const path = require('path');
const fs = require('fs');
const cachedJwks = {};


module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	// return app configuration info to client app
	app.get('/config', function(req, res) {
		res.json(oktaConfig);
	});

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

	// callback for implicit flow goes directly to Angular app

	// callback for authorization code flow
	app.get('/authorization-code/callback', function(req, res) {
		console.log('GET authorization-code/callback request');
		
	})

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};