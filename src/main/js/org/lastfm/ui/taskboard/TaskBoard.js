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
            var tasks, idGenerator;

            idGenerator = 0;
            tasks = {};

            return {
                addTask : function(task, tpl, _ctrl) {
                    var ctrl, $scope, node, wrapper, id;

                    id = ++idGenerator;
                    $scope = $rootScope.$new();
                    
                    $scope.task = task;

                    node = domConstruct.create('div', {
                        'class' : 'lastfm-taskboard-task-panel',
                        innerHTML : tpl
                    }, document.body);

                    node.dataset['ngController'] = _ctrl;

                    $compile(node)($scope);

                    $scope.$on('$destroy', function() {
                        domConstruct.destroy(node); 
                        delete task[id];
                    });

                    tasks[id] = {
                        task : task,
                        node : node,
                        $scope : $scope
                    };

                }
            };
        }]);
    }]);
    return {
        module : module
    };
});
