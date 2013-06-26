define([
 'dojo/_base/declare',
 'dojo/_base/lang',
 'dojo/io-query',
 'dojo/cookie',
 'dojo/request',
 'dojox/encoding/digests/MD5'
], function(declare, lang, ioQuery, cookie, request, MD5) {
    var _host = '/api/';
    var _api_root = '/2.0/';

    return {
        _appendServiceSignature : function(params, secret) {
            var list, keyValueString;
            list = [];
            params = params || {};

            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    list.push(key); 
                }
            }
            
            keyValueString = list.sort().map(function(key) {
                var value;
                value = params[key];
                if (lang.isArray(value)) {
                    return value.map(function(_val) {
                        return _val;
                    }).join('');
                } 
                return key + value;   
            }).join('');

            params.api_sig = MD5(keyValueString + secret, 1 );

            return params;
        }
    };
});
