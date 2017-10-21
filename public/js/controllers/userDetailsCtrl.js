angular.module('userDetailsCtrl', [])
.controller('UserDetailsController', ['$rootScope', '$scope','$route', '$location', '$http', '$q', 'Inspector', 'OktaAuthService', 'OKTA_CONFIG', 'MFAService',
function($rootScope, $scope, $route, $location, $http, $q, Inspector, OktaAuthService, OKTA_CONFIG, MFAService) {

    var token = $rootScope.oktaAuth.tokenManager.get('access-token');
    var urlParams = $location.search();
    var uid = urlParams.uid;
    var returnLink = '/users';

    $scope.currentUser = {};
    $scope.disabled = false;
    $scope.factorList = {};
    $scope.selectedFactor = {};
    $scope.userMsg = {
        type: 'none',
        text: 'none'
    };

     // Load user
    loadUser = function() {
        var data = { 
            'token': token,
            'uid': uid
        };

        $http.post('/user', JSON.stringify(data))
            .then(function(res) {
                if (res.status == 200) {
                    $scope.currentUser = res.data;
                } else {
                    console.log('Unknown error getting user details: ' + res.data);
                }
            });
    }

    // Handle MFA factor selector (checkbox) click
    $scope.handleFactorSelect = function(factor) {

        if (factor.status == 'ACTIVE') {
            MFAService.resetFactor(factor)
                .then(function(res) {
                    console.log(res);
                });
        } else {
            $scope.selectedFactor = factor;
            /*
            MFAService.enrollFactor(factor)
                .then(function(res) {
                    console.log(res);
                });
            */
        }
    }

    // update the user record based on form input
    $scope.handleUpdate = function() {

        var data = {
            'token': token,
            'user': $scope.currentUser
        }

        $http.post('/updateUser', data)
            .then(function(res) {
                if (res.status == 200) {
                    console.log('/updateUser: Updated the user...add a nice message area to the page now');
                } else {
                    console.log('/updateUser: Uncaught exception trying to update user profile info.')
                }
            });
    }

    // close user details page and return to where we were on users (respecting pagination and selected user)
    $scope.handleClose = function() {
        $location.path(returnLink).search({uid: uid, link: urlParams.link});
    }

    // Check to see if the user has the necessary claims (roles) for this route
    function checkClaims(feature) {
        return $http.post("/checkClaims", { accessToken: token.accessToken, route: feature})
    }

    // check to see if the form should be editable (based on roles (claims))
    checkFormEnabled = function() {
        checkClaims('user-edit-form')
            .then(function(res) {
                $scope.disabled = !res.data.routePermitted;
                document.getElementById("formFieldset").disabled = !res.data.routePermitted;;
            });
    }

    // clear the user message alert
    $scope.clearUserMsg = function() {
        $scope.userMsg = {
            type: 'none',
            text: 'none'
        };
    }

    $scope.setSelectedFactor = function(factor) {
        $scope.selectedFactor = JSON.stringify(factor, undefined, 2);
    }

    // load user details on page load
    if (!uid) {
        console.log('Error loading user details.');
    } else {
        loadUser();
        // get the Factors list
         MFAService.getFactorList(uid, token)
            .then(function(res) {
                $scope.factorList = res;
            });
        checkFormEnabled();
    }

}]);