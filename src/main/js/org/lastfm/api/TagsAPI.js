define([
 'dojo/_base/declare',
 'dojo/_base/lang',
 'dojo/io-query',
 'dojo/cookie',
 'dojo/request',
 'dojo/Deferred'
], function(declare, lang, ioQuery, cookie, request, MD5, uuid, Deferred) {
    var _host = '/api/';
    var _api_root = '/2.0/';

    return declare('org.lastfm.api.TagsAPI', [], {     
        constructor : function(args) {
            lang.mixin(this, args || {}); 
            if (!this.key) {
                throw 'API key does not found';
            }
        },

        getTopTracks: function(tags, limit, page) {
            limit = limit || 50;
            page = page || 0;

            return request.get(_api_root, {
                handleAs : 'json',
                query : {
                    method : 'tag.getTopTracks',
                    tag : tags,
                    limit : limit,
                    page : page,
                    api_key : this.key,
                    format : 'json'
                }
            }); 
        },

        getTopArtists : function(tags, limit, page) {
            limit = limit || 50;
            page = page || 0;

            return request.get(_api_root, {
                handleAs : 'json',
                query : {
                    method : 'tag.getTopArtists',
                    tag : tags,
                    limit : limit,
                    page : page,
                    api_key : this.key,
                    format : 'json'
                }
            }); 
        }
    });
});
