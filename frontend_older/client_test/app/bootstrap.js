import angular from 'angular';
import {AppModule} from './components/app/app';

angular.element(document).ready(function() {
    angular.bootstrap(document.querySelector('[data-main-app]'), [
        AppModule.name
    ]);
});
