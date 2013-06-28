//Last fm promo bot

require({
    packages : [
        {
            name : 'org',
            location : '/src/main/js/org'
        }
    ]
}, [
    'org/lastfm/app/Bot',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/query',
    'dojo/domReady!'
], function (LastFmAPI, dom, domAttr, query) {
    var html;

    angular.bootstrap(document, ['org.lastfm.app.Bot']);
});
