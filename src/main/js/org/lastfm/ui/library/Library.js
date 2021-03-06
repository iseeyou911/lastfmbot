define([
    'dojo/text!./library_artists_tpl.html',
    'dojo/text!./library_tracks_tpl.html',
    'dojo/text!./library_task_tracks_tpl.html',
    'dojo/_base/lang',
    'dojo/promise/all',
    'dojo/Deferred'
], function(tplArtists, tplTracks, tplTaskTracks, lang, all, Deferred) {
    var filters, directives, controllers, module, libraryCtrl, limit;

    filters = angular.module('org.lastfm.ui.library.filters', []); 
    directives = angular.module('org.lastfm.ui.library.directives', []); 
    controllers = angular.module('org.lastfm.ui.library.controllers', []); 
    limit = 100;

    
    controllers.controller(
        'org.lastfm.ui.library.controllers.addingTrackTaskCtrl', 
        ['$q', '$timeout', '$scope', '$lastFMAPI', 
            function($q, $timeout, $scope, $lastFMAPI) {
            var tracks, batchSize, packages, i, k, j, processPack, dfd;
            batchSize = 5;
            tracks = $scope.task.tracks;

            i = 0;
            k = 0;
            j = 0;
            packages = [[]];
            while (i < tracks.length) {
                if (j === 5) {
                    j = 0;
                    packages.push([]);
                    k++;
                } 
                packages[k].push([tracks[i].artist.name, tracks[i].name, $lastFMAPI.session.key, tracks[i]]);
                j++;
                i++;
            }

            processPack = function(pack, delay) {
                var dfd = new Deferred(), timeoutHandler;

                timeoutHandler = $timeout(function() {
                    dfd.resolve();
                }, delay);

                dfd.then(null, function() {
                    $timeout.cancel(timeoutHandler);
                });

                pack.forEach(function(track) {
                    track[3].status = 'starting';
                });

                $scope.$apply();
                return dfd.then(function() {
                    return all(pack.map(function(track) {
                        var addTrackPromise;
                        track[3].status = 'process';
                        
                        if (track[3].favorite) {
                            addTrackPromise = $lastFMAPI.track.love.apply($lastFMAPI.track, track);
                        } else {

                            addTrackPromise = $lastFMAPI.library.addTrack.apply($lastFMAPI.library, track);
                        }
                        addTrackPromise.then(function() {
                            track[3].status = 'added';
                            $scope.task.completed++;
                            $scope.$apply();
                        });

                        return addTrackPromise;
                    })).then(function() {
                        var _dfd = new Deferred();

                        $timeout(function() {
                            pack.forEach(function(item) {
                                item[3].hide = true;
                            });
                            _dfd.resolve();
                        }, 400);

                        return _dfd;
                    });
                });
            };

            var process = new Deferred(), promise = process.promise;

            packages.forEach(function(pack, i){
                promise = promise.then(function() {
                    return processPack(pack, 3000 * (i && 1));   
                });
            });                
            
            promise.then(function() {
                $scope.task.tracks = [];
                $scope.$apply();
                $scope.$parent.$destroy();
            });
            process.resolve();
            return false;
        }
    ]);

    libraryCtrl = controllers.controller('org.lastfm.ui.library.controllers.libraryCtrl', ['$q', '$timeout', '$scope', '$lastFMAPI', '$location', '$taskboard', function($q, $timeout, $scope, $lastFMAPI, $location, $taskboard) {

        $scope.reset = function () {
            $scope.searchBtnDisabled = false;
            $scope.addArtistsBtnDisabled = false;
            $scope.addTracksBtnDisabled = false;
            $scope.search = {};
            $scope.search.limit = limit;
            $scope.search.page = 0;
            $scope.tags = '';
        }

        $scope.searchArtistsByTags = function(append) {
            $scope.searchBtnDisabled = true;
            if (!append) {
                $scope.search.results = [];
            }
            $scope.search.page = append ? $scope.search.page + 1: 0;
            

            self._searchDfd && !self._searchDfd.isFulfilled() && self.cancel();
            self._searchDfd = $lastFMAPI.tag.getTopArtists($scope.search.tags.split(/[,;]\s*/), limit, $scope.search.page).then(function(result) {

                $scope.$apply(function(){
                    var artists, checked;
                     
                    if (result.error) {
                        $scope.searchBtnDisabled = false;
                        $scope.search.error = result.error.message;
                        $scope.$apply();
                        return;
                    }
                    artists = [];
                    result = result.topartists;

                    checked = !$scope.search.results.some(function(item){
                        return !item.checked;
                    });

                    (lang.isArray(result) ? result : [result]).forEach(function(resultSet) {
                        (lang.isArray(resultSet.artist) ? resultSet.artist : [resultSet.artist]).forEach(function(artist) {
                            artists.push(lang.mixin(artist, {tags : resultSet['@attr'], checked : checked}));
                        });   
                    });

                    $scope.search.results = append ? $scope.search.results.concat(artists) : artists;
                    $scope.searchBtnDisabled = false;
                });
            }, function(){
                $scope.$apply(function() {
                    $scope.searchBtnDisabled = false;
                });
            });

            return false;
        };

        $scope.searchTracksByTags = function(append) {
            $scope.searchBtnDisabled = true;
            if (!append) {
                $scope.search.results = [];
            }
            $scope.search.page = append ? $scope.search.page + 1: 0;
            
            self._searchDfd && !self._searchDfd.isFulfilled() && self.cancel();

            self._searchDfd = $lastFMAPI.tag.getTopTracks($scope.search.tags.split(/[,;]\s*/), limit, $scope.search.page).then(function(result) {

                $scope.$apply(function(){
                    var tracks, checked;
                    if (result.error) {
                        $scope.searchBtnDisabled = false;
                        $scope.search.error = result.error.message;
                        return;
                    }
                    tracks = [];
                    result = result.toptracks;
                    
                    checked = !$scope.search.results.some(function(item){
                        return !item.checked;
                    });

                    (lang.isArray(result) ? result : [result]).forEach(function(resultSet) {
                        (lang.isArray(resultSet.track) ? resultSet.track : [resultSet.track]).forEach(function(track) {
                            tracks.push(lang.mixin(track, {tags : resultSet['@attr'], checked : checked}));
                        });   
                    });

                    $scope.search.results = append ? $scope.search.results.concat(tracks) : tracks;
                    $scope.searchBtnDisabled = false;
                });
            }, function(){
                $scope.$apply(function() {
                    $scope.searchBtnDisabled = false;
                });
            });
            return false;
        };

        $scope.select = function(item) {
            item.checked = !item.checked;
        };
        $scope.selectAll = function() {
            $scope.search.results.forEach(function(artist) {
                artist.checked = true; 
            });  
        };

        $scope.deselectAll = function() {
            $scope.search.results.forEach(function(item) {
                item.checked = false; 
                item.favorite = false; 
            });  
        };

        $scope.addTracks = function() {
            var tracks;

            tracks = $scope.search.results.filter(function(track) {
                track.hide = !track.checked;
                if (!track.hide) {
                    track.status = 'waiting';
                }
                return track.checked;
            });
            $taskboard.addTask({
                completed : 0,
                count : tracks.length,
                tracks : tracks,
                header : 'Добавление треков'
                }, tplTaskTracks, 'org.lastfm.ui.library.controllers.addingTrackTaskCtrl');
            $scope.reset();
        };

        $scope.addArtists = function() {
            var artists;

            $scope.addArtistsBtnDisabled = true;
            
            artists = $scope.search.results.filter(function(artist) {
                return artist.checked;
            }).map(function(artist) {
                return artist.name;
            });

            $lastFMAPI.library.addArtist(artists, $lastFMAPI.session.key).then(function(result) {
                $scope.search.results = [];
                $scope.search.tags = ''; 
                $scope.addArtistsBtnDisabled = false;
                $scope.$apply();
            });
            return false;
        };

        $scope.reset();
    }]);

    module = angular.module('org.lastfm.ui.library', ['org.lastfm.ui.library.filters', 'org.lastfm.ui.library.directives', 'org.lastfm.ui.library.controllers']);

    return {
        module : module,
        controllers : {
            libraryCtrl : {
                ctrl : 'org.lastfm.ui.library.controllers.libraryCtrl',
                tplTracks : tplTracks,
                tplArtists : tplArtists
            }
        }
    };
});
