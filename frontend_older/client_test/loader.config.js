System.config({
  meta: {
    'vendor/angular/angular': { format: 'global', exports: 'angular' },
    'vendor/angular-touch/angular-touch': { deps: ['angular'] },
    'vendor/angular-animate/angular-animate': { deps: ['angular'] },
    'vendor/angular-messages/angular-messages': { deps: ['angular'] },
    'node_modules/angular-new-router/dist/router.es5': { deps: ['angular'] }
  },
  map: {
    'app': 'app.compiled',
    'material': 'vendor/connect-material/dist/systemjs',
    'text': 'vendor/plugin-text/text',
    'json': 'vendor/plugin-json/json',
    'angular': 'vendor/angular/angular',
    'angular-mock': 'vendor/angular-mocks/angular-mocks',
    'angular-touch': 'vendor/angular-touch/angular-touch',
    'angular-animate': 'vendor/angular-animate/angular-animate',
    'angular-messages': 'vendor/angular-messages/angular-messages',
    'angular-new-router': 'node_modules/angular-new-router/dist/router.es5',
    'rtts-assert': 'vendor/assert/src/assert'
  }
});
