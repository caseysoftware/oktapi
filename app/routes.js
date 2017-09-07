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
	app.get('/users/me/:token', function(req, res) {
		
		var token = req.params.token;
		//var requestUrl = 'http://localhost:5000' + '/users/me';
		var requestUrl = 'https://okta-api-proxy.herokuapp.com' + '/users/me';

		const options = {
			uri: requestUrl,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache',
 				'Authorization': 'Bearer ' + token
			}
		};
	
		request(options, function(error, response, body) {
			if (error) {
				console.error('/users/me/:token ' + error);
				res.send(error);
			}
			if (response) {
				if (response.statusCode == 200) {
					res.send(body);
				} else {
					console.log('/users/me/:token ' + response.statusCode + ' ' + response.statusMessage);
					res.send(response.statusCode + ' ' + response.statusMessage);
				}
			}
		})

	});

	// App support routes ======================================================

	// return app configuration info to client app
	app.get('/config', function(req, res) {
		res.json(oktaConfig);
	});

	/* TODO: this is a dummy function now. It should really be called "checkClaims" */
	// check that the user has permission to access the current route
	app.post('/checkRoutePermissions', function(req, res) {

		var token = req.body.accessToken;
		var requiredClaims = req.body.requiredClaims;
		var allowed = true;
		var response = {};

		if (requiredClaims.length < 1) {
			allowed = true; 
			res.json({routePermitted: true});
			return;
		} 

		const decoded = jws.decode(token);
		if (!decoded) {	
			allowed = false;
			console.log('Token could not be decoded.');
			res.send({routePermitted: false});
			return;
		}
		var roles = JSON.parse(decoded.payload).roles;
		
		if (!roles) {
			allowed = false;
			console.log('Token has no \' roles \' claim.');
			res.send({routePermitted: false});
			return;
		}
		
		var hits = 0;
		var missingClaims = [];
		for (i=0;i<requiredClaims.length;i++) {
			if (!roles.includes(requiredClaims[i])) {
				allowed = false;
				missingClaims.push(requiredClaims[i]);
			}
		}

		if (allowed) {
			//console.log('Route ' + route + ' permitted.');
			response = {routePermitted: true};
		} else {
			//console.error('Route ' + route + ' not permitted.');
			response = {routePermitted: false, missingClaims: missingClaims}
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