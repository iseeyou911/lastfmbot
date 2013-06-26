define([
 'dojo/_base/declare',
 'dojo/_base/lang',
 'dojo/io-query',
 'dojo/cookie',
 'dojo/request',
 'dojox/encoding/digests/MD5',
 'dojox/uuid/generateRandomUuid',
 'org/lastfm/api/TagsAPI',
 'org/lastfm/api/LibraryAPI',
 'org/lastfm/api/APITools',
 'dojo/Deferred'
], function(declare, lang, ioQuery, cookie, request, MD5, uuid, TagsAPI, LibraryAPI, APITools, Deferred) {
    var _host = '/api/';
    var _api_root = '/2.0/';

    return declare('org.lastfm.api.LastFmAPI', [], {     
        constructor : function(args) {
            lang.mixin(this, args || {}); 

            this.tag = new TagsAPI({
                key : this.key,
                secret : this.secret
            });
            this.library = new LibraryAPI({
                key : this.key,
                secret : this.secret
            });
            this.session = JSON.parse(cookie('session')); 
        },
        //Authentification with api key
        auth : function(key) {
            var authDfd, requestId, self;

            self = this;
            
            //remove old promise for auth
            this.authDfd && !this.authDfd.fired && this.authDfd.cancel();
            authDfd = this.authDfd = new Deferred();
            
            if (this.session) {
                this.authDfd.resolve();
            } else {
                //Remove old promise for token
                clearTimeout(this._checkCookieTimeout);
                this.tokenDfd && !this.tokenDfd.fired && this.tokenDfd.cancel();
                this.tokenDfd = new Deferred();

                //After getting token we need to get session
                this.tokenDfd.then(function(token) {
                    self.token = token;
                    return self.getSession();   
                }, function(e) {
                    authDfd.reject(e);
                }).then(function(result) {
                    if (result.session) {
                        self.session = result.session;
                        cookie('session', JSON.stringify(self.session), {
                            'path' : '/',
                            expires : new Date(+(new Date()) + 2592000000)
                        });
                        self.authDfd.resolve(self.session);
                    } else {
                        self.authDfd.reject(result);
                    }
                });

                //Config token hadler;
                this._checkerCounter = 100;
                requestId = uuid();
                this.requestToken(requestId);
                this._checkCookieTimeout = setTimeout(this._checkForToken.bind(this, requestId, this.tokenDfd), 500);
            }

            return authDfd;
        },

        isAuthed : function() {
            return !!this.session;
        },

        _checkForToken : function(requestId, dfd) {
            var response;
            response = cookie(requestId);

            if (!response && this._checkerCounter > 0) {
                this._checkerCounter--;
                this._checkCookieTimeout = setTimeout(this._checkForToken.bind(this, requestId, dfd), 200);
            } else if (response) {
                debugger;
                try {
                    response = JSON.parse(response);
                    if (response.status === 'OK') {
                        dfd.resolve(response.response);
                    } else {
                        dfd.reject(e);
                    }
                } catch (e) {
                    dfd.reject(e);
                }
            } else {
                dfd.cancel();
            }
        }, 

        requestToken : function(requestId) {

            window.open(this._getPath('auth') + '?' + ioQuery.objectToQuery({
                api_key : this.key,
                cb : 'http://lastfmbot/tokenhandler.html?requestId=' + requestId
            }));
        },

        getSession : function(token, key) {
            return request.get(_api_root, {
                handleAs : 'json',
                query : lang.mixin(APITools._appendServiceSignature({
                    method : 'auth.getSession',
                    token : token || this.token,
                    api_key : key || this.key
                }, this.secret), {format : 'json'})
            }); 
        },
        _getPath : function(method) {
            method = (Array.isArray(method) ? method : [method]).join('/') + '/';     

            return _host + method;
        }
    });
});
