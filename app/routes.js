const oktaConfig = require('../config/oktaconfig');

//const request = require('request');
const querystring = require('querystring');
const jws = require('jws');
const jwk2pem = require('pem-jwk').jwk2pem;
const path = require('path');
const fs = require('fs');
const cachedJwks = {};
const request = require('request');


module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes


	// Okta API proxy routes

	app.get('/users/me/:mode', function(req, res) {
		
		var mode = req.params.mode;
		var requestUrl = 'http://localhost:5000' + '/users/me/' + mode;

		const options = {
			uri: requestUrl,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache'
			}
		};
	
		request(options, function(error, response, body) {
			if (response.statusCode == 200) {
				res.send(body);
			} else {
				if (error) {
					console.log(error);
					res.json(error);
				} else {
					res.json('Unexpected error in /users/me');
				}
			} 
		})

	});

	// App support routes ======================================================

	// return app configuration info to client app
	app.get('/config', function(req, res) {
		res.json(oktaConfig);
	});

	/* TODO: this is a dummy function now. It should really be called "checkScopes" */
	// check that the user has permission to access the current route
	app.post('/checkRoutePermissions', function(req, res) {

		var route = req.body.route;
		var allowed = false;
		var response = {};

		if (allowed) {
			//console.log('Route ' + route + ' permitted.');
			response = {route: route, routePermitted: true};
		} else {
			//console.error('Route ' + route + ' not permitted.');
			response = {route: route, routePermitted: false}
		}
		res.json(response);
	});

	// decode JWT token
	app.get('/decodeToken/:token', function(req, res) {
		var token = req.params.token;
		const decoded = jws.decode(token);
		if (!decoded) {	
			res.status(401).send('id_token could not be decoded from the response');
		}
		res.json(decoded);
	});

	app.get('/implicit/callback', function(req, res) {
		let nonce;
        let state;
        
        // Before initiating the /token request, validate that the user's state
        // matches what we expect. The client sends a state parameter to Okta in
        // the /authorize request, and sets these cookies for validation here on the
        // server side.
        if (req.cookies['okta-oauth-nonce'] && req.cookies['okta-oauth-state']) {
            nonce = req.cookies['okta-oauth-nonce'];
            state = req.cookies['okta-oauth-state'];
        }
        else {
            res.status(401).send('"state" and "nonce" cookies have not been set before the /callback request');
            return;
        }
	});

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