//Last fm promo bot

require({
    packages : [
        {
            name : 'org',
            location : '/src/main/js/org'
        }
    ]
}, [
    'org/lastfm/LastFmAPI',
    'dojo/dom',
    'dojo/domReady!'
], function (LastFmAPI, dom) {
    var api = new LastFmAPI({
        key : 'bbb3ca8d510d2635236482db15aa4cb9',
        secret : '22315c60539b135ae41689fb51111798'
    });

    var authBtn = dom.byId('authBtn'); 
    authBtn.onclick = function() {
        api.auth();
    };
});
