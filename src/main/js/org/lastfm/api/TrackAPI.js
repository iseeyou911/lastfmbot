define([
       'dojo/_base/declare',
       'dojo/_base/lang',
       'dojo/io-query',
       'dojo/cookie',
       'dojo/request',
       'org/lastfm/api/APITools',
       'dojo/Deferred'
], function(declare, lang, ioQuery, cookie, request, APITools, Deferred) {
    var _host = '/api/';
    var _api_root = '/2.0/';

    return declare('org.lastfm.api.TrackAPI', [], {     
        constructor : function(args) {
            lang.mixin(this, args || {}); 
            if (!this.key) {
                throw 'API key does not found';
            }
        },

        love: function(artist, track, sessionKey) {

            sessionKey = sessionKey || this.sessionKey;
            if (!artist || !track || !sessionKey) {
                throw 'All params are required (artist, track, sessionKey)';
            }

            return request.post(_api_root, {
                handleAs : 'json',
                data : lang.mixin(APITools._appendServiceSignature({
                    method : 'track.love',
                    api_key : this.key,
                    artist : artist,
                    track : track,
                    sk : sessionKey
                }, this.secret), { format : 'json'})
            }); 
        }

    });
});
