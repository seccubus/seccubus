export var srcPath = '/seccubus/v2/src/';
export var componentsPath = srcPath + 'components/';

export default {
    defaultRoute: '/status',

    /**
     * Root Route for the Team App
     */
    'seccubus': {
        url: '',
        templateUrl: srcPath + 'seccubus.html',
        abstract: true
    },
    'seccubus.statusPage': {
        url: '/status',
        templateUrl: componentsPath + 'status-page/status-page.html'
    }
    /* MARKER: insert routes here */
};
