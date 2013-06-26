define([
    'dojo/text!./auth_tpl.html'
], function(tpl) {
    var filters, directives, controllers, module, authCtrl;

    filters = angular.module('org.lastfm.ui.auth.filters', []); 
    directives = angular.module('org.lastfm.ui.auth.directives', []); 
    controllers = angular.module('org.lastfm.ui.auth.controllers', []); 

    authCtrl = controllers.controller('org.lastfm.ui.auth.controllers.AuthCtrl', ['$scope', '$lastFMAPI', '$location', '$routeParams', function($scope, $lastFMAPI, $location, $routeParams) {
        $scope.auth = function() {
            $lastFMAPI.auth().then(function(result) {
                $location.path('/');
            });   
        };
    }]);

    module = angular.module('org.lastfm.ui.auth', ['org.lastfm.ui.auth.filters', 'org.lastfm.ui.auth.directives', 'org.lastfm.ui.auth.controllers']);

    return {
        module : module,
        controllers : {
            authCtrl : {
                ctrl : 'org.lastfm.ui.auth.controllers.AuthCtrl',
                tpl : tpl
            }
        }
    };
});
