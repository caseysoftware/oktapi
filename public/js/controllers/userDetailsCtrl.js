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
    $scope.enrollModalMode = '';
    $scope.userMsg = {
        type: 'none',
        text: 'none'
    };
    $scope.popoverMsg = {
        type: 'none',
        text: 'none'
    }
    $scope.showMFA = false;

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

    // Register SMS factor
    $scope.handleRegisterSMS = function(factor) {
        
        if ($scope.currentUser.profile.mobilePhone) {
            MFAService.enrollSMS($scope.selectedFactor, $scope.currentUser.profile.mobilePhone)
            .then(function(res) {
                if (res.status == 200) {
                    console.log(res);
                    factor.status=res.data.status;
                    Inspector.pushGeneralInspector('register-sms-response', JSON.stringify(res.data, undefined, 2));
                    $scope.popoverMsg = {
                        type: 'info',
                        text: 'Enroll: ' + res
                    }
                } else {
                    console.log('Uncaught exception in handleRegisterSMS: ' + JSON.stringify(res));
                }

            });
        } else {
            $scope.popoverMsg = {
                type: 'alert-warning',
                text: 'Please enter a valid mobile number.'
            }
        }
    }
        
    // Handle MFA factor selector button - either reset factor, or set selected factor for modal form.
    $scope.handleFactorSelect = function(factor) {
        $scope.enrollModalMode = 'reset';
        if (factor.status == 'ACTIVE') {
            MFAService.resetFactor(factor)
                .then(function(res) {
                    if (res.status == 204) {
                        factor.status = "NOT_SETUP";
                        console.log(res);
                        $scope.popoverMsg = {
                            type: 'alert-success',
                            text: 'Hey ' + factor.provider + ' ' + factor.factorType + ' reset.'
                        }
                    } else {
                        console.log('Uncaught exception in handleFactorSelect: ' + JSON.stringify(res));
                    }
                });
        } else {
            $scope.enrollModalMode = 'enroll';
            $scope.selectedFactor = factor;
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

    $scope.clearPopoverMsg = function() {
        $scope.popoverMsg = {
            type: 'none',
            text: 'none'
        };
    }

    $scope.setSelectedFactor = function(factor) {
        $scope.selectedFactor = JSON.stringify(factor, undefined, 2);
    }

    $scope.encodeModalTarget = function(factor, type) {
        var hashed = type + encodeURI(btoa(factor.provider + ' ' + factor.factorType));
        var encoded = hashed.replace(/=/g, "z");
        return encoded;
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