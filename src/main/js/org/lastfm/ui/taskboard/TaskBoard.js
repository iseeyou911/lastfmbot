define([
    'dojo/text!./taskboard_tpl.html',
    'dojo/dom-construct',
    'dojo/dom-attr'
], function(tpl, domConstruct, domAttr) {
    var filters, directives, controllers, module;

    filters = angular.module('org.lastfm.ui.taskboard.filters', []); 
    directives = angular.module('org.lastfm.ui.taskboard.directives', []); 
    controllers = angular.module('org.lastfm.ui.taskboard.controllers', []); 

    module = angular.module('org.lastfm.ui.taskboard', ['org.lastfm.ui.taskboard.filters', 'org.lastfm.ui.taskboard.directives', 'org.lastfm.ui.taskboard.controllers']);

    module.config(['$provide', function($provide){
        $provide.service('$taskboard', ['$rootScope', '$controller', '$compile', function($rootScope, $controller, $compile) {
            var tasks;
            tasks = [];

            return {
                addTask : function(task, tpl, _ctrl) {
                    var ctrl, $scope, node, wrapper;

                    $scope = $rootScope.$new();
                    
                    $scope.task = task;

                    node = domConstruct.create('div', {
                        'class' : 'lastfm-taskboard-task-panel'
                    }, document.body);

                    domConstruct.create('div', {
                        innerHTML : '{{task.header}}',
                        'class' : 'lastfm-taskboard-task-panel-header'
                    }, node);


                    wrapper = domConstruct.create('div', {
                        innerHTML : tpl
                    }, node);

                    node.dataset['ngController'] = _ctrl;

                    $compile(node)($scope);

                    tasks.push((function(obj){return obj})({
                        wrapper : wrapper,
                        task : task,
                        node : node,
                        $scope : $scope
                    }));
                }
            };
        }]);
    }]);
    return {
        module : module
    };
});
