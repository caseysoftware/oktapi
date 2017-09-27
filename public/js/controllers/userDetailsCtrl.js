angular.module('userDetailsCtrl', [])
.controller('UserDetailsController', ['$rootScope', '$scope','$route', '$location', '$http', 'Inspector', 'OktaAuthService', 'OKTA_CONFIG',
function($rootScope, $scope, $route, $location, $http, Inspector, OktaAuthService, OKTA_CONFIG) {

    var token = $rootScope.oktaAuth.tokenManager.get('access-token');
    var urlParams = $location.search();
    var uid = urlParams.uid;
    var returnLink = '/users';

    $scope.currentUser = {};

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

    // close user details page and return to where we were on users (respecting pagination and selected user)
    $scope.handleClose = function() {
        $location.path(returnLink).search({uid: uid, link: urlParams.link});
    }

    if (!uid) {
        console.log('Error loading user details.');
    } else {
        loadUser();
    }

}]);