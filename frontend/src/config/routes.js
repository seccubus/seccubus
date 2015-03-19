export var srcPath = '/seccubus/v2/src/';
export var componentsPath = srcPath + 'components/';

export default {
    defaultRoute: '/status',

    /**
     * Root Route for the Team App
     */
    'seccubus'           : {
        url        : '',
        templateUrl: srcPath + 'seccubus.html',
        abstract   : true
    },
    'seccubus.statusPage': {
        url        : '/status',
        templateUrl: componentsPath + 'status-page/status-page.html',
        title      : 'Status'
    },
    'seccubus.runsPage'  : {
        url        : '/runs',
        templateUrl: componentsPath + '/runs-page/runs-page.html',
        title      : 'Runs'
    }
    /* MARKER: insert routes here */
};
