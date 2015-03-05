export var srcPath = '/seccubus/v2/src/';
export var componentsPath = srcPath + 'components/';

export default {
    defaultRoute: '/status',

    /**
     * Root Route for the Team App
     */
    'seccubus': {
        url: '',
        templateUrl: srcPath + 'app.html',
        abstract: true
    },

    /**
     * Providers routes
     */
    'seccubus.status': {
        url: '/status',
        title: 'Status',
        templateUrl: componentsPath + 'status-page/status-page.html'
    }
};
