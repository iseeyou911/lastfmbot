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
    html = query('html')[0];

    domAttr.set(html, 'ng-app', 'org.lastfm.app.Bot');
    angular.bootstrap(html, ['org.lastfm.app.Bot']);
});
