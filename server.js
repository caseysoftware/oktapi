// modules =================================================
const express           = require('express');
const http              = require('http');
const app               = express();
const httpServer        = http.createServer(app);
const os                = require('os');
const bodyParser        = require('body-parser');
const methodOverride    = require('method-override');
const passport          = require('passport');
const JwtBearerStrategy = require('passport-oauth2-jwt-bearer').Strategy;
const request           = require('request');

// configuration ===========================================
var okta = require('./config/oktaconfig');   
var port = process.env.PORT || 8000; // set our port

const https = false;
const issuerUrl = okta.issuerUrl;
const metadataUrl = issuerUrl + '/.well-known/openid-configuration';
const orgUrl = okta.oktaOrgUrl;
const audience = okta.audience;

console.log();
console.log('Listener Port:\n\t' + port);
console.log('Issuer URL:\n\t' + issuerUrl);
console.log('Audience URI:\n\t' + okta.audience);
console.log('Metadata URL:\n\t' + metadataUrl);
console.log('Organization URL:\n\t' + orgUrl);
console.log();

app.set('port', port);

app.use('/js', express.static(__dirname + '/js'));
app.use('/bower_components', express.static(__dirname + '/../bower_components'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/partials', express.static(__dirname + '/partials'));

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/images will be /images for users
app.use(passport.initialize());



/*
var express = require('express');
var app = express();

app.use('/js', express.static(__dirname + '/js'));
app.use('/bower_components', express.static(__dirname + '/../bower_components'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/partials', express.static(__dirname + '/partials'));

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname });
});
*/

// routes ==================================================
require('./app/routes')(app);   // pass our application into our routes


/*
// start app ===============================================
app.listen(port);	
console.log('Oktapi server running on port: ' + port); 		
exports = module.exports = app; // expose app
*/



/**
 * Fetch metadata to obtain JWKS signing keys
 */


/* offline mode 

console.log('fetching issuer metadata configuration from %s...', metadataUrl);
request({
  json: true,
  uri: metadataUrl,
  strictSSL: true
}, function(err, res, body) {
  if (err || res.statusCode < 200 || res.statusCode >= 300) {
    console.log('Unable to fetch issuer metadata configuration due to HTTP Error: %s ', res.statusCode);
    return process.exit(1);
  }

  end offline mode */

/**
 * Configure JwtBearerStrategy with JWKS
 */

 /* offline mode

 console.log('trusting tokens signed with keys from %s...', res.body.jwks_uri);
  passport.use(new JwtBearerStrategy({
    issuer: issuerUrl,
    audience: audience,
    realm: 'OKTA',
    jwksUrl: res.body.jwks_uri
  }, function(token, done) {
    // done(err, user, info)
    return done(null, token);
  }));

  end offline mode */

/**
 * Start Server
 */

  console.log();
  console.log('starting server...');
  httpServer.listen(app.get('port'), function() {
    var scheme   = https ? 'https' : 'http',
        address  = httpServer.address(),
        hostname = os.hostname();
        baseUrl  = address.address === '0.0.0.0' ?
          scheme + '://' + hostname + ':' + address.port :
          scheme + '://localhost:' + address.port;

    console.log('listening on port: ' + app.get('port'));
    console.log();
  });

/* offline mode

});

end offline mode*/