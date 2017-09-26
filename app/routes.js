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
const mode = oktaConfig.mode;

const oktaOrg = oktaConfig.oktaOrgUrl;
const oktaApiProxyUrl = oktaConfig.oktaApiProxyUrl;
const authServerId = oktaConfig.authServerId;

module.exports = function(app) {

	// server routes ===========================================================
	
	/* TODO: move Okta stuff into a different controller */
	// Okta API proxy routes 

	// userinfo
	app.post('/userinfo', function(req, res) {
		
		var token = req.body.accessToken;
		var attribute = req.body.attribute;
		var requestUrl = oktaOrg + '/oauth2/' + authServerId + '/v1/userinfo';

		const options = {
			uri: requestUrl,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache',
				'Authorization': 'Bearer ' + token
			}
		};

		request(options, function(error, response, body) {
			if (error) {
				console.error('/userinfo ' + error);
				res.send(error);
			}
			if (response) {
				if (response.statusCode == 200) {
					res.send(body);
				} else {
					console.log('/userinfo ' + response.statusCode + ' ' + response.statusMessage);
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
	function verifyRoute(route, parent, routeParams, activeSession, token) {

		var currentRoute = {};

		if (parent) {
			currentRoute = clientRoutes.routes[parent].children[route];
		} else {
			currentRoute = clientRoutes.routes[route];		// lookup the route criteria in clientRoutes
		}

		// If a session is required and we don't have one, return false
		if (currentRoute.sessionRequired && !activeSession) {
			console.log('Route ' + currentRoute.displayName + ' requires an active session, and there is none.');
			return false;
		}

		// If the route shoud be hidden when there is an active session, return false. For example, register and login pages
		if (currentRoute.hideIfSession && activeSession) {
			console.log('Route ' + currentRoute.displayName + ' should be hidden if there is an active session, and there is one.');
			return false;
		}

		// Check the claims on the access token to see if they meet the requirements for this route		
		return checkClaimsforRoute(currentRoute, routeParams.claimsRequired, token);;
	};

	// Check to see if the users access token has the claims required for this route 
	function checkClaimsforRoute(route, requiredClaims, token) {
		
		/* TODO: add boolean for and vs or requirements on the claims */

		var validClaim = true;
		var roles = {};
		var msg = '';

		if (requiredClaims.length < 1) {
			msg = 'No custom claims are required for route ' + route.displayName;
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
			msg = 'Access token is missing the following claim(s) for ' + route.displayName + ': ' + JSON.stringify(requiredClaims);
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
			msg = 'Access token contains necessary claim(s) for ' + route.displayName + ': ' +  JSON.stringify(requiredClaims);
			console.log(msg);
			return {routePermitted: true, msg: msg};
		} else {
			msg = 'Access token is missing the following claim(s) for ' + route.displayName + ': ' + JSON.stringify(missingClaims);
			console.log(msg);
			return {routePermitted: false, msg: msg};
		}
	}	

	function parseNavElements(routes, parsedRoutes, parent, parentParams, token, activeSession) {

		// {route: route, visible: routeParams.visible, displayName: routeParams.displayName, children: routeParams.children};

		if (routes) {
			for (route in routes) {
				var routeParams = routes[route];
				if (routes[route].hasOwnProperty('children')) {
					//parsedRoutes[route] = {route: route, visible: routeParams.visible, displayName: routeParams.displayName , children: []};
					parseNavElements(routes[route].children, parsedRoutes, route, routeParams, token, activeSession);
				} else {
					//console.log('current route: ' + route);
					if (parent) {
						routeVerification = verifyRoute(route, parent, routeParams, activeSession, token);
						routePermitted = routeVerification.routePermitted;
						if (routePermitted) {
							if (!parsedRoutes[parent]) {
								parsedRoutes[parent] = {route: parent, visible: parentParams.visible, displayName: parentParams.displayName , children: []};
							}
							parsedRoutes[parent].children.push({route: route, visible: routeParams.visible, displayName: routeParams.displayName});
						}
						//console.log('** parsedRoutes[parent] ' + parent + ' ' + JSON.stringify(parsedRoutes));
					} else {
						routeVerification = verifyRoute(route, '', routeParams, activeSession, token);
						routePermitted = routeVerification.routePermitted;
						if (routePermitted) parsedRoutes[route] = {route: route, visible: routeParams.visible, displayName: routeParams.displayName};
					}
					
				}
			}
		} else {
			console.log('current route: ' + route);
		}

		//console.log('Parsed Routes: ' + JSON.stringify(parsedRoutes));
		return parsedRoutes;
	}

	// TODO: is this just a test function?
	app.get('/recurse', function(req, res) {

		var routes = clientRoutes.routes;
		var parsedRoutes = {};
		var parent = '';
		var children = {};

		var navRoutes = parseNavElements(routes, parsedRoutes, parent);

		res.json(navRoutes);

	});

	/* TODO: this could be cleaner, probably recursive. */
	// Return a JSON array of navbar routes available to the user based on session state and claims in their access token
	app.post('/navbar', function(req, res) {

		var activeSession = req.body.activeSession;
		var token = req.body.accessToken;
		var navbarRoutes = {};
		var routes = clientRoutes.routes;
		var parsedRoutes = {};
		var parent = '';
		var parentParams = '';
		var routePermitted = false;

		var navRoutes = parseNavElements(routes, parsedRoutes, parent, parentParams, token, activeSession);


		/* TODO: this is being replaced by the recursive stuff .......

		for (var route in routes) {
			routePermitted = false;
			if (routes.hasOwnProperty(route)) {
				var routeParams = routes[route];
				var navRoute = {route: route, visible: routeParams.visible, displayName: routeParams.displayName, children: routeParams.children};
				if (routeParams.children) {
					var childRoutes = {};
					for (var child in routeParams.children) {
						if (routeParams.children.hasOwnProperty(child)) {
							var childRouteParams = routeParams.children[child];
							var childRoute = {route: child, visible: childRouteParams.visible, displayName: childRouteParams.displayName, children: childRouteParams.children};
							var childRouteVerification = verifyRoute(route, child, childRouteParams, activeSession, token);
							var childRoutePermitted = childRouteVerification.routePermitted;
							if (childRoutePermitted) {
								var routeString = JSON.stringify(child);
								childRoutes[routeString] = childRoute;
								routePermitted = true;
							}
						}
					}
					if (routePermitted) {
						navRoute.children = childRoutes;
					}
				} else {
					var routeVerification = verifyRoute(route, '', routeParams, activeSession, token);
					routePermitted = routeVerification.routePermitted;
				}

				console.log('/navbar for ' + route + ' ' + routePermitted);
				if (routePermitted) {
					var routeString = JSON.stringify(route);
					navbarRoutes[routeString] = navRoute;
				}
			}
		}
		res.json(navbarRoutes);
		... end of stuff to be refactored with recursive algorithm */
		res.json(navRoutes);

	});

	// Check for appropriate claims (roles) in the users access token before granting access to the route.
	// This is used by routerService to gate access to routes using route resolve in the Angular app.
	app.post('/checkClaims', function(req, res) {
		
		var route = req.body.route;
		var token = req.body.accessToken;
		var currentRoute = {};

		for (rte in clientRoutes.routes) {
			if (rte == route) {
				currentRoute = clientRoutes.routes[rte];
				break;
			} 
			if (clientRoutes.routes[rte].children) {
				for (child in clientRoutes.routes[rte].children) {
					if (child == route) {
						currentRoute = clientRoutes.routes[rte].children[child];
						break;
					}
				}
			}
		}

		if (currentRoute) {
			requiredClaims = currentRoute.claimsRequired;
			routePermission = checkClaimsforRoute(currentRoute, requiredClaims, token);
			res.json(routePermission);
		} else {
			console.error('Unable to determine required claims for route ' + route);
			res.send(false);
		}

	});


	// Final decision on route authorization
	app.post('/routePermission', function(req, res) {

		var activeSession = req.body.activeSession;
		var claimsValid = req.body.claimsValid;
		var route = req.body.route;
		var token = req.body.accessToken;
		var currentRoute = {};

		for (rte in clientRoutes.routes) {
			if (rte == route) {
				currentRoute = clientRoutes.routes[rte];
				break;
			} 
			if (clientRoutes.routes[rte].children) {
				for (child in clientRoutes.routes[rte].children) {
					if (child == route) {
						currentRoute = clientRoutes.routes[rte].children[child];
						break;
					}
				}
			}
		}

		if (currentRoute) {
			claimsRequired = currentRoute.claimsRequired;
			sessionRequired = currentRoute.sessionRequired
			routePermission = checkClaimsforRoute(currentRoute, requiredClaims, token);
		} else {
			console.error('Error reading required claims and session info for route ' + route);
			res.send(false);
		}

		//var claimsRequired = clientRoutes.routes[route].claimsRequired;
		//var sessionRequired = clientRoutes.routes[route].sessionRequired

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