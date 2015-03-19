// All the Angular packages that we use in our app
import angular from 'angular';

import 'angular-ui-router';
import 'angular-aria';
import 'angular-animate';
import 'angular-material';

import 'luxyflux/src/ng-luxyflux';

// Helper methods that configure the App module's ui-router with our app routes
import routes from './routes';

// Application root components
import NavBar from './components/nav-bar/nav-bar';
import NavMenu from './components/nav-menu/nav-menu';
import StatusPage from './components/status-page/status-page';

// Application Flux stores
//import ProviderStore from './stores/provider-store';

// Application Flux ActionCreators
//import AppActions from './actions/app-actions';

// This is the angular module that contains all the defined services
//import resourcesModule from './resources/_module';
//
import Annotations from 'anglue/src/annotations';

class Application {
    static get annotation() {
        return Annotations.getApplication('seccubus', Application);
    }

    static get dependencies() {
        return [
            'ngMaterial'
        ];
    }

    static get routes() {
        return routes;
    }

    static get components() {
        return [
            NavBar,
            NavMenu,
            StatusPage
        ];
    }

    static get stores() {
        return [];
    }

    static get actions() {
        return [];
    }
}

var appModule = Application.annotation.module;

appModule.config(['$mdIconProvider', function($mdIconProvider) {
    $mdIconProvider
        .iconSet('navigation', `icons/navigation-icons.svg`);
}]);

angular.element(document).ready(() => {
    angular.bootstrap(document.body, [
        appModule.name
    ], {
        strictDi: true
    });
});
