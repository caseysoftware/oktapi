module.exports = {
    
    /* TODO: 
        - move secrets to separate config file. Since this config is shared with the client, we need to move any secrets stuff to a server-only config file
    */


    // Okta tenant for Oktapi Platform
    oktaTenantName: 'oktalane',
    oktaDomain: 'okta.com',
    oktaOrgUrl: 'https://oktalane.okta.com',

    oktaApiKey: '00yIZIZ9pv0miOTn5sO4kfX3YORO8UKANkUd9ulbCq', 

    // Okta Authorization Server for Oktapi Platform
    authServerId: 'aus3jupfxnblTekmg1t7',
    authServerUrl: 'https://oktalane.okta.com/oauth2/aus3jupfxnblTekmg1t7',
    authServerAuthUrl: 'https://oktalane.okta.com/oauth2/aus3jupfxnblTekmg1t7/v1/authorize',

    clientId: '0oa3jurcjaEVDibeo1t7', 
    clientSecret: 'SqbgExzbUWgQgl-gQTxb-SsU5NAcy7KjDGl-xv6p',
    responseType: ['token', 'id_token'],
    responseMode: 'code',
    scope: [
        'openid',
        'email',
        'profile'
    ],

    oktaAuthnApiEndpoint: '/api/v1/authn',
    scopes: 'openid&email&profile&address&phone&groups',
    loginRedirectUri_code: 'http://localhost:8000/authorization-code/callback',
    loginRedirectUri_implicit: 'http://localhost:8000/implicit-callback', // this was when I was redirecting to an angular page
    //loginRedirectUri_implicit: 'http://localhost:8000/implicit/callback',

    // Okta sign-in widget customziation

    //signinLogo: '/images/forged.png',
    //portalBackgroundImage: '/images/bg-6.png',                             
    //helpPage: 'http://localhost:8000/help',
    //primaryAuthTitle: 'Oktalane Portal',
    //primaryAuthUsername: 'Your Username',
    //primaryAuthUsernameTooltip: 'Enter the username you were given ...',

    // registration config
    activateOnRegister: true,
    defaultSecondEmail: "oktabrent@gmail.com"
};