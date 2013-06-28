define([
    'org/lastfm/api/LastFmAPI',
    'org/lastfm/ui/auth/Auth',
    'org/lastfm/ui/library/Library',
    'org/lastfm/ui/taskboard/TaskBoard',
    'dojo/aspect'
], function(LastFmAPI, Auth, Library, TaskBoard, aspect) {
    var module, api;

    api = new LastFmAPI({
        key : 'bbb3ca8d510d2635236482db15aa4cb9',
        secret : '22315c60539b135ae41689fb51111798'
    });

    module = angular.module('org.lastfm.app.Bot', ['org.lastfm.ui.auth', 'org.lastfm.ui.library', 'org.lastfm.ui.taskboard']);
    
    module.config([
        '$provide', 
        '$compileProvider', 
        '$filterProvider', 
        '$routeProvider', 
        function($provide, $compileProvider, $filterProvider, $routeProvider) {

            $provide.service('$lastFMAPI', function() {
                return api;
            });

            $routeProvider.when('/auth', {
                template : Auth.controllers.authCtrl.tpl,
                controller : Auth.controllers.authCtrl.ctrl,
                redirectTo : function() {
                    return api.isAuthed() ? '/' : '/auth';      
                }
            });

            $routeProvider.when('/tracks', {
                template :  Library.controllers.libraryCtrl.tplTracks,
                controller : Library.controllers.libraryCtrl.ctrl,
                redirectTo : function() {
                    return api.isAuthed() ? '/tracks' : '/auth';      
                }
            });

            $routeProvider.when('/artists', {
                template :  Library.controllers.libraryCtrl.tplArtists,
                controller : Library.controllers.libraryCtrl.ctrl,
                redirectTo : function() {
                    return api.isAuthed() ? '/artists' : '/auth';      
                }
            });
            $routeProvider.when('/', {
                template : '<div>HELLO</div>',
                redirectTo : function() {
                    return api.isAuthed() ? '/' : '/auth';      
                }
            });
        }
    ]);
});
