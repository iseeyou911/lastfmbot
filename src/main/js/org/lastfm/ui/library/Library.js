define([
    'dojo/text!./library_artists_tpl.html',
    'dojo/text!./library_tracks_tpl.html',
    'dojo/_base/lang',
    'dojo/promise/all',
    'dojo/Deferred'
], function(tplArtists, tplTracks, lang, all, Deferred) {
    var filters, directives, controllers, module, libraryCtrl;

    filters = angular.module('org.lastfm.ui.library.filters', []); 
    directives = angular.module('org.lastfm.ui.library.directives', []); 
    controllers = angular.module('org.lastfm.ui.library.controllers', []); 

    libraryCtrl = controllers.controller('org.lastfm.ui.library.controllers.libraryCtrl', ['$scope', '$lastFMAPI', '$location', function($scope, $lastFMAPI, $location) {
        $scope.searchBtnDisabled = false;
        $scope.addArtistsBtnDisabled = false;
        $scope.addTracksBtnDisabled = false;
        $scope.search = {};

        $scope.searchArtistsByTags = function() {
            $scope.searchBtnDisabled = true;
            $scope.search.results = [];
            
            $lastFMAPI.tag.getTopArtists($scope.search.tags.split(/[,;]\s*/)).then(function(result) {
                var artists;
                artists = [];
                result = result.topartists;

                (lang.isArray(result) ? result : [result]).forEach(function(resultSet) {
                    (lang.isArray(resultSet.artist) ? resultSet.artist : [resultSet.artist]).forEach(function(artist) {
                        artists.push(lang.mixin(artist, {tags : resultSet['@attr'], checked : true}));
                    });   
                });
                $scope.search.results = artists;
                $scope.searchBtnDisabled = false;
                $scope.$apply();
            });

            return false;
        };

        $scope.searchTracksByTags = function() {
            $scope.searchBtnDisabled = true;
            $scope.search.results = [];
            
            $lastFMAPI.tag.getTopTracks($scope.search.tags.split(/[,;]\s*/)).then(function(result) {
                var tracks;
                tracks = [];
                result = result.toptracks;

                (lang.isArray(result) ? result : [result]).forEach(function(resultSet) {
                    (lang.isArray(resultSet.track) ? resultSet.track : [resultSet.track]).forEach(function(track) {
                        tracks.push(lang.mixin(track, {tags : resultSet['@attr'], checked : true}));
                    });   
                });
                $scope.search.results = tracks;
                $scope.searchBtnDisabled = false;
                $scope.$apply();
            });
            return false;
        };

        $scope.selectAll = function() {
            $scope.search.results.forEach(function(artist) {
                artist.checked = true; 
            });  
        };

        $scope.deselectAll = function() {
            $scope.search.results.forEach(function(artist) {
                artist.checked = false; 
            });  
        };

        $scope.addTracks = function() {
            var tracks, batchSize, packages, i, k, j, processPack, dfd;

            batchSize = 5;
            $scope.addtracksBtnDisabled = true;
            
            tracks = $scope.search.results.filter(function(track) {
                return track.checked;
            }).map(function(track) {
                return {track : track.name, artist : track.artist.name};
            });

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
                packages[k].push([tracks[i].artist, tracks[i].track, $lastFMAPI.session.key]);
                j++;
                i++;
            }

            processPack = function(pack, delay) {
                var dfd = new Deferred();

                setTimeout(function() {
                    dfd.resolve();
                }, delay);

                return dfd.then(function() {
                    return all(pack.map(function(track) {
                        return $lastFMAPI.library.addTrack.apply($lastFMAPI.library, track).then(function() {
                            console.log(track);   
                        });
                    }));
                });
            };

            all(packages.map(function(pack, i) {
                return processPack(pack, i * 5000);
            }));
            
            return false;
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
