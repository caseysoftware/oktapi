module.exports = {
    routes : {
        '/': {
            visible: false,
            displayName: '',
            sessionRequired: false,
            hideIfSession: false,
            claimsRequired: ''
        },
        '/home': {
            visible: true,
            displayName: 'Home',
            sessionRequired: false,
            hideIfSession: false,
            claimsRequired: ''
        },
        '/register': {
            visible: true,
            displayName: 'Register',
            sessionRequired: false,
            hideIfSession: true,
            claimsRequired: '',
        },
        '/loginImplicit': {
            visible: false,
            displayName: 'Login (implicit)',
            sessionRequired: false,
            hideIfSession: true,
            claimsRequired: '',
        },
        '/loginCode': {
            visible: false,
            displayName: 'Login (code)',
            sessionRequired: false,
            hideIfSession: true,
            claimsRequired: ''	
        },
        '/landing': {
            visible: true,
            displayName: 'Landing',
            sessionRequired: true,
            hideIfSession: false,
            claimsRequired: ''
        },			
        '/admin': {
            visible: true,
            displayName: 'Admin',
            sessionRequired: true,
            hideIfSession: false,
            claimsRequired: [''],
            children: {
                '/users': {
                    visible: true,
                    displayName: 'Users',
                    sessionRequired: true,
                    claimsRequired: ['OKTAPI role - user administrator'],
                },
                '/groups': {
                    visible: true,
                    displayName: 'Groups',
                    sessionRequired: true,
                    claimsRequired: ['OKTAPI role - group administrator'],
                },
                '/test': {
                    visible: true,
                    displayName: 'Test',
                    sessionRequired: true,
                    claimsRequired: ''
                }
            }
        }
    }
};