export var srcPath = '/seccubus/v2/src/';
export var componentsPath = srcPath + 'components/';

export default {
    defaultRoute: '/~/status',

    /**
     * Root Route for the Team App
     */
    'seccubus': {
        url: '/:workspace_id',
        params: {
            workspace_id: {
                value: '~'
            }
        },
        templateUrl: `${srcPath}seccubus.html`
    },
    'seccubus.statusPage': {
        url: '/status',
        templateUrl: `${componentsPath}/status-page/status-page.html`
    },
    'seccubus.runsPage': {
        url: '/runs',
        templateUrl: `${componentsPath}/runs-page/runs-page.html`
    },
    'seccubus.findingsPage': {
        url: '/findings',
        templateUrl: `${componentsPath}/findings-page/findings-page.html`
    },
    'seccubus.workspacesPage': {
        url: '/workspaces',
        templateUrl: `${componentsPath}/workspaces-page/workspaces-page.html`
    },
    'seccubus.workspacesPage.create': {
        url: '/create',
        views: {
            'drawer@seccubus': {
                templateUrl: `${componentsPath}/workspaces-page/workspace-create/workspace-create.html`
            }
        }
    }
    /* MARKER: insert routes here */
};
