define([
    'dojo/text!./taskboard_tpl.html'
], function(tpl) {
    var filters, directives, controllers, module;

    filters = angular.module('org.lastfm.ui.taskboard.filters', []); 
    directives = angular.module('org.lastfm.ui.taskboard.directives', []); 
    controllers = angular.module('org.lastfm.ui.taskboard.controllers', []); 

    module = angular.module('org.lastfm.ui.taskboard', ['org.lastfm.ui.taskboard.filters', 'org.lastfm.ui.taskboard.directives', 'org.lastfm.ui.taskboard.controllers']);

    module.config(['$provide', function($provide){
        $provide.service('$taskboard', [function() {
            return {
                addTask : function(task, tpl, ctrl) {
                    
                }
            };
        }]);
    }]);
    return {
        module : module
    };
});
