module.exports = {
    routes : {
        '/': {
            sessionRequired: false,
            claimsRequired: ''
        },
        '/home': {
            sessionRequired: false,
            claimsRequired: ''
        },
        '/loginImplicit': {
            sessionRequired: false,
            claimsRequired: ''				
        },
        '/loginCode': {
            sessionRequired: false,
            claimsRequired: ''				
        },
        '/landing': {
            sessionRequired: true,
            claimsRequired: ''				
        },			
        '/admin': {
            sessionRequired: true,
            claimsRequired: ['OKTAPI role - user administrator']		
        }
    }
};