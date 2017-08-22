angular.module('inspectorCtrl', [])
    .controller('InspectorController', ['$scope','$location', 'Inspector', function($scope, $location, Inspector) {

    function refreshInspectors() {
        $scope.tokenInspector = Inspector.getTokenInspector(); 
        $scope.sessionInspector = Inspector.getSessionInspector();
        $scope.generalInspector = Inspector.getGeneralInspector(); 
        $scope.httpInspector = Inspector.getHttpInspector();
    };

    refreshInspectors();

    $scope.$on('refreshInspectors', function(event, args) {
        refreshInspectors();
    })

}]);