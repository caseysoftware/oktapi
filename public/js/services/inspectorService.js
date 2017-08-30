angular.module('inspectorService', [])
    // simple factory to set and retrieve inspectorMessage to display in inspector modal window
    .factory('Inspector', function () {
        
    var tokenInspector = {};
    var sessionInspector = {};
    var generalInspector = {};
    var httpInspector = {};

    return {
        pushTokenInspector: function(key, value) {
            tokenInspector[key] = value;
        },
        pushSessionInspector: function(key, value) {
            sessionInspector[key] = value;
        },
        pushGeneralInspector: function(key, value) {
            generalInspector[key] = value;
        },
        pushHttpInspector: function(key, value) {
            httpInspector[key] = value;
        },
        getTokenInspector: function() {
            return tokenInspector;
        },
        getTokenInspectorKeys: function() {
            var obj = tokenInspector;
            return Object.keys(obj);
        },
        getSessionInspector: function() {
            return sessionInspector;
        },
        getGeneralInspector: function() {
            return generalInspector;
        },
        getHttpInspector: function() {
            return httpInspector;
        },
        clearTokenInpector: function() {
            tokenInspector = {};
        },
        clearGeneralInspector: function() {
            generalInspector = {};
        },            
        clearHttpInspector: function() {
            httpInspector = {};
        },
        initInspectors: function() {
            tokenInspector = {};
            sessionInspector = {};
            generalInspector = {};
            httpInspector = {};
        }
    };
});