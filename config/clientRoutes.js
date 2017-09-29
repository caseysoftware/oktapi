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
            visible: false,
            displayName: 'Landing',
            sessionRequired: true,
            hideIfSession: false,
            claimsRequired: ''
        },	
        '/apps': {
            visible: true,
            displayName: 'Your Apps',
            sessionRequired: true,
            hideIfSession: false,
            claimsRequired: ['OKTAPI role - portal user']
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
                    claimsRequired: ['OKTAPI role - user administrator (read)'],
                },
                '/userDetails': {
                    visible: false,
                    displayName: 'UserDetails',
                    sessionRequired: true,
                    claimsRequired: ['OKTAPI role - user administrator (read)'],
                },
                '/groups': {
                    visible: true,
                    displayName: 'Groups',
                    sessionRequired: true,
                    claimsRequired: ['OKTAPI role - group administrator'],
                }
            }
        },
        // Below are non-route permissions. We'll use these to check permission for things like the edit form, etc.
        'user-edit-form': {
            visible: false,
            displayName: '',
            sessionRequired: true,
            hideIfSession: false,
            claimsRequired: ['OKTAPI role - user administrator (edit)']
        },	
    }
};