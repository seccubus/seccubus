require.config({
    paths: {
        'angular':              '../bower_components/angular/angular',
        'angular-ui-router':    '../bower_components/angular-ui-router/release/angular-ui-router',
        'angular-animate':      '../bower_components/angular-animate/angular-animate',
        'angular-cookies':      '../bower_components/angular-cookies/angular-cookies',
        'angular-resource':     '../bower_components/angular-resource/angular-resource',
        'angular-route':        '../bower_components/angular-route/angular-route',
        'angular-sanitize':     '../bower_components/angular-sanitize/angular-sanitize',
        'requirejs-domready':   '../bower_components/requirejs-domready/domReady',
        'connect-material':     '../bower_components/connect-material/src',
        'connect-collections':  '../bower_components/connect-collections/src/connect-collections'
    },
    shim   : {
        'angular': {
            exports: 'angular'
        },
        'angular-animate'   : ['angular'],
        'angular-ui-router' : ['angular'],
        'angular-cookies'   : ['angular'],                
        'angular-resource'  : ['angular'],
        'angular-route'     : ['angular'],
        'angular-sanitize'  : ['angular'],
    }
});