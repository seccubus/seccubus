/**
 * The app.config is responsible for loading all dependencies in our app.
 */
import 'angular-touch';
import 'angular-animate';
import 'angular-new-router';
import 'angular-messages';

import 'material/components/components';
import 'material/services/services';
import 'material/utils/utils';

export var AppConfig = {
    /**
     * The name of the angular module everything will be
     * namespaces in. E.g 'MyApp' will create components
     * inside of 'MyApp.ComponentName' angular module
     * @type {String}
     */
    moduleName: 'App',

    /**
     * Here we define all the modules that need to be injected
     * into our main application module
     * @type {Array}
     */
    moduleDependencies: [
        'ngTouch',
        'ngAnimate',
        'ngMessages',
        'ngFuturisticRouter',
        'material.components',
        'material.services',
        'material.utils'
    ],

    /**
     * The name of the folder that all your components live in.
     * Defaults to 'components'.
     * @type {String}
     */
    componentFolderName: 'components',

    /**
     * The name of the folder that your apps source code resides in
     * Defaults to 'app'.
     * @type {String}
     */
    appFolderName: 'app',

    /**
     * This enables certain debug information like which
     * modules and routes are loaded.
     * @type {Boolean}
     */
    debug: true
};
