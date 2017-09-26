angular.module('usersCtrl', [])
.controller('UsersController', ['$rootScope', '$scope','$route', '$http', 'Inspector', 'OktaAuthService', 'OKTA_CONFIG',
    function($rootScope, $scope, $route, $http, Inspector, OktaAuthService, OKTA_CONFIG) {

    var token = $rootScope.oktaAuth.tokenManager.get('access-token');
    var listSize = OKTA_CONFIG.maxUserListSize;
    var responseLinks = '';

    $scope.userList = {};
    $scope.links = [];
    $scope.initialPage = '?limit=' + listSize;
    $scope.searchString = '';

    function parseHeader(header){
        // Split parts by comma
        var parts = header.split(',');
        var links = {};
        // Parse each part into a named link
        angular.forEach(parts, function (p) {
            var section = p.split(';');
            if (section.length != 2) {
                throw new Error("section could not be split on ';'");
            }
            var url = section[0].replace(/<(.*)>/, '$1').trim();
            var queryString = {};
            url.replace(
                new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                function($0, $1, $2, $3) { queryString[$1] = $3; }
            );
            var page = queryString['page'];
            if( angular.isString(page) ) {
                page = parseInt(page);
            }
            var name = section[1].replace(/rel="(.*)"/, '$1').trim();
            var paginationFragment = url.substring(url.indexOf('?'));
            links[name] = paginationFragment;
        });

        return links;
    }

    // Load users
    loadUsers = function(activePage) {

        var data = { 
            'token': token,
            'activePage': activePage
        };

        $http.post('/users', JSON.stringify(data))
            .then(function(res) {
                if (res.status == 200) {
                    $scope.userList = res.data;
                    responseLinks = res.headers('link');
                    $scope.links = parseHeader(responseLinks);
                    console.log('Links ' + JSON.stringify($scope.links, undefined, 2));
                } else {
                    console.log('Unknown error getting user list: ' + res.data);
                }
            });
    }

    // Search
    $scope.handleSearch = function() {
        console.log('Search string: ' + $scope.searchString);
        loadUsers($scope.initialPage + '&q=' + $scope.searchString);
    }

    // Pagination

    /* TODO - change these to a single handler function */
    // Next
    $scope.handleNext = function() {
        loadUsers($scope.links['next']);
    }

    // Self
    $scope.handleSelf = function() {
        loadUsers($scope.links['self']);
    }

    // Prev
    $scope.handlePrev = function() {
        var nextLink = $scope.links['self'];
        var prevLink = nextLink.replace(RegExp('after', 'g'), 'before');
        console.log('prevLink: ' + prevLink);
        loadUsers(prevLink);
    }

    // load users on page load
    loadUsers($scope.initialPage);

}]);