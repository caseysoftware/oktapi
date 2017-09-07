const oktaConfig = require('../config/oktaconfig');
const clientRoutes = require('../config/clientRoutes');

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

	// Client app support routes ======================================================

	// return app configuration info to client app. We are sharing the config between server and client
	app.get('/config', function(req, res) {
		res.json(oktaConfig);
	});

	// Routing helper apps
	
	// Check to see if the current route is accessible to the user, based on session and claims in access token
	function verifyRoute(route, routeParams, activeSession, token) {
		var currentRoute = clientRoutes.routes[route];		// lookup the route criteria in clientRoutes

		// If a session is required and we don't have one, return false
		if (currentRoute.sessionRequired && !activeSession) {
			console.log('Route ' + route + ' requires an active session, and there is none.');
			return false;
		}
		// Check the claims on the access token to see if they meet the requirements for this route		
		return checkClaimsforRoute(route, routeParams.claimsRequired, token);;
	};

	// Check to see if the users access token has the claims required for this route 
	function checkClaimsforRoute(route, requiredClaims, token) {
		
		/* TODO: add boolean for and vs or requirements on the claims */

		var validClaim = true;
		var roles = {};
		var msg = '';

		if (requiredClaims.length < 1) {
			msg = 'No custom claims are required for route ' + route;
			console.log(msg);
			var res = {routePermitted: true, msg: msg};
			return {routePermitted: true, msg: msg};
		} 

		if (token.length > 0) {
			const decoded = jws.decode(token);
			if (!decoded) {	
				validClaim = false;
				var msg = 'Token could not be decoded.'
				console.log(msg);
				return {routePermitted: false, msg: msg};
			}
			roles = JSON.parse(decoded.payload).roles;
		}
		
		if (!roles) {
			validClaim = false;
			msg = 'Access token is missing the following claim(s) for ' + route + ': ' + JSON.stringify(requiredClaims);
			console.log(msg);
			return {routePermitted: false, msg: msg};
		}

		var hits = 0;
		var missingClaims = [];
		for (i=0;i<requiredClaims.length;i++) {
			if (!roles.includes(requiredClaims[i])) {
				validClaim = false;
				missingClaims.push(requiredClaims[i]);
			}
		}
		
		if (validClaim) {
			msg = 'Access token contains necessary claim(s) for ' + route + ': ' +  JSON.stringify(requiredClaims);
			console.log(msg);
			return {routePermitted: true, msg: msg};
		} else {
			msg = 'Access token is missing the following claim(s) for ' + route + ': ' + JSON.stringify(missingClaims);
			console.log(msg);
			return {routePermitted: false, msg: msg};
		}
	}	

	// Return a JSON array of navbar routes available to the user based on session state and claims in their access token
	app.post('/navbar', function(req, res) {

		var activeSession = req.body.activeSession;
		var token = req.body.accessToken;
		var navbarRoutes = {};
		var routes = clientRoutes.routes;

		for (var route in routes) {
			if (routes.hasOwnProperty(route)) {
				var routeParams = routes[route];
				var navRoute = route;
				var routeVerification = verifyRoute(route, routeParams, activeSession, token);
				var routePermitted = routeVerification.routePermitted;
				console.log('/navbar for ' + route + ' ' + routePermitted);
				if (routePermitted) {
					var routeString = JSON.stringify(route);
					navbarRoutes[routeString] = navRoute;
				}
			}
		}
		res.json(navbarRoutes);
	});

	// Check for appropriate claims (roles) in the users access token before granting access to the route.
	// This is used by routerService to gate access to routes using route resolve in the Angular app.
	app.post('/checkClaims', function(req, res) {
		
		var route = req.body.route;
		var token = req.body.accessToken;
		var requiredClaims = clientRoutes.routes[route].claimsRequired;
		var routePermission = checkClaimsforRoute(route, requiredClaims, token);
		res.json(routePermission);
	});


	// Final decision on route authorization
	app.post('/routePermission', function(req, res) {

		var activeSession = req.body.activeSession;
		var claimsValid = req.body.claimsValid;
		var route = req.body.route;
		var token = req.body.accessToken;
		var claimsRequired = clientRoutes.routes[route].claimsRequired;
		var sessionRequired = clientRoutes.routes[route].sessionRequired
		var sessionExempt = !sessionRequired;
		var claimExempt =  claimsRequired.length < 1;

		var sessionOk = sessionExempt ? sessionExempt : activeSession;
		var claimsOk = claimExempt ? claimExempt : claimsValid;

		permitted = sessionOk && claimsOk;

		console.log('/routePermission for ' + route + ': ' + permitted);

		res.json({routePermitted: permitted});
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