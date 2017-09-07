angular
.module("configService", [])
.constant("ConfigService", {
    config : {
        appName: 'Oktapi Platform',
        authEndpoint: '/auth',
        // allowable values: 'implicit', 'authorization_code'
        oAuthFlow: 'implicit'
    },
    routes : {
        '/': {
            sessionRequired: false,
            scopesRequired: ''
        },
        '/home': {
            sessionRequired: false,
            scopesRequired: ''
        },
        '/loginImplicit': {
            sessionRequired: false,
            scopesRequired: ''				
        },
        '/loginCode': {
            sessionRequired: false,
            scopesRequired: ''				
        },
        '/landing': {
            sessionRequired: true,
            scopesRequired: ''				
        },			
        '/admin': {
            sessionRequired: true,
            scopesRequired: ['OKTAPI role - user administrator']		
        }
    }
});