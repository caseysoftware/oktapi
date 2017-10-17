module.exports = {
    
    /* TODO: 
        - move secrets to separate config file. Since this config is shared with the client, we need to move any secrets stuff to a server-only config file
    */



    /* Run locally vs Heroku ------------------------- */

    // Login redirect URL

    //loginRedirectUri_code: 'http://localhost:8000/authorization-code/callback',       // unused
    //loginRedirectUri_implicit: 'http://localhost:8000/implicit-callback',               // --> local
    //loginRedirectUri_implicit: 'https://oktapi.herokuapp.com/implicit-callback',      // Heroku no SSL
    loginRedirectUri_implicit: 'https://oktapi.bgoktademo.com/implicit-callback',     // --> Heroku SSL on bgoktademo.com
    
    // okta-api-proxy settings

    oktaApiProxyUrl: 'https://okta-api-proxy.herokuapp.com',                            // --> Heroku no SSL
    //oktaApiProxyUrl: 'http://localhost:5000',                                             // --> local

    // OIDC ID Token to SAML Assertion Service
    oidcSamlServiceUrl: 'http://localhost:8080/OktaTokenService/TokenService',

    /* end local vs Heroku config -------------------- */

    mode: 'offline',

    // Okta tenant for Oktapi Platform
    oktaTenantName: 'oktalane',
    oktaDomain: 'okta.com',
    oktaOrgUrl: 'https://oktalane.okta.com',
    defaultSecondEmail: 'oktabrent@gmail.com',

    oktaApiKey: '00yIZIZ9pv0miOTn5sO4kfX3YORO8UKANkUd9ulbCq', 
    clientId: '0oa3jurcjaEVDibeo1t7', 
    clientSecret: 'SqbgExzbUWgQgl-gQTxb-SsU5NAcy7KjDGl-xv6p',

    // Okta Authorization Server for Oktapi Platform
    authServerId: 'aus3jupfxnblTekmg1t7',
    authServerUrl: 'https://oktalane.okta.com/oauth2/aus3jupfxnblTekmg1t7',
    authServerAuthUrl: 'https://oktalane.okta.com/oauth2/aus3jupfxnblTekmg1t7/v1/authorize',
    audience: '0oa3pxkd9bpZgKAZk1t7', 
    issuerUrl: 'https://oktalane.okta.com/oauth2/aus3jupfxnblTekmg1t7',
    responseType: ['token', 'id_token'],
    responseMode: 'code',
    scope: [
        'openid',
        'email',
        'profile',
        'me:read',
        'users:read',
        'users:edit',
        'users:create',
        'users:delete'
    ],

    oktaAuthnApiEndpoint: '/api/v1/authn',
 
    // registration config
    activateOnRegister: true,
    defaultSecondEmail: "oktabrent@gmail.com",

    // user page config
    maxUserListSize: 10,

};