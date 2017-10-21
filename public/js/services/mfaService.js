angular.module('mfaService', [])
.service('MFAService', ['$rootScope', '$q', '$http', '$location', 'Inspector',  
    function($rootScope, $q, $http, $location, Inspector) {

    var _token = {};
    var _uid = {};

    // MFA factors that are available for this user
    getAvailableFactors = function() {

        var deferred = $q.defer();
        var availableFactors = {};
        var data = {
            token: _token,
            uid: _uid
        }

        $http.post('/availableFactors', JSON.stringify(data))
            .then(function(res) {
                if (res.status == 200) {
                    availableFactors = res.data;
                    deferred.resolve(res.data);
                } else {
                    console.log('Unknown error getting available factors: ' + res.data);
                    deferred.reject('Unknown error getting available factors: ' + res.data);
                }
            });
            return deferred.promise;
    }

    // MFA factors that this user is enrolled in
    getEnrolledFactors = function() {

        var deferred = $q.defer();
        var enrolledFactors = '';
        var data = {
            token: _token,
            uid: _uid
        }

        $http.post('/enrolledFactors', JSON.stringify(data))
            .then(function(res) {
                if (res.status == 200) {
                    enrolledFactors = res.data; 
                    deferred.resolve(res.data);
                } else {
                    console.log('Unknown error getting enrolled factors: ' + res.data);
                    deferred.reject('Unknown error getting enrolled factors: ' + res.data);
                }
            });
            return deferred.promise;
    }

    // Build the master list of MFA factors, including all available and enrolled for this user
    getFactorList = function(availableFactors, enrolledFactors) {

        var factorList = {};

        for (factor in availableFactors) {
            var newFactor = {};
        
            newFactor = availableFactors[factor];
            newFactor.enrolled = availableFactors[factor].status == 'ACTIVE';

            for (enrolled in enrolledFactors) {
                var curFactor = availableFactors[factor];
                var curEnrolled = enrolledFactors[enrolled]
                if (curFactor.status=='ACTIVE' && curFactor.factorType == curEnrolled.factorType && curFactor.provider == curEnrolled.provider) {
                    newFactor.id = curEnrolled.id;
                    newFactor.profile = curEnrolled.profile;
                    newFactor.links = curEnrolled.links;
                }
            }

            factorList[factor] = newFactor;
        }

        return factorList;
    }

    // resetFactor
    this.resetFactor = function(factor) {
    
        console.log(factor);
        data = {
            token: _token,
            uid: _uid,
            fid: factor.id
        };

        return $http.post('/resetFactor', JSON.stringify(data));
    }

    //enrollFactor
    this.enrollFactor = function(factor) {
        console.log(factor);
    }

    this.getFactorList = function(uid, token) {
        
        var deferred = $q.defer();
        var factorList = {};
        var availableFactors = {};
        var enrolledFactors = {};

        _token = token;
        _uid = uid;

         getAvailableFactors()
            .then(function(res) {
                availableFactors = res;
                getEnrolledFactors()
                    .then(function(res) {
                        enrolledFactors = res;

                        factorList = getFactorList(availableFactors, enrolledFactors)
                        deferred.resolve(factorList);
                    });
            });

        return deferred.promise;
    }

}]);