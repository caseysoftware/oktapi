angular
.module("configService", [])
.constant("ConfigService", {
    config : {
        appName: 'Oktapi Platform',
        authEndpoint: '/auth',
        // allowable values: 'implicit', 'authorization_code'
        oAuthFlow: 'implicit'
    }
});