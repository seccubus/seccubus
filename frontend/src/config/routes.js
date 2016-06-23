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
    url: '/runs/:scan_id',
    params: {
      scan_id: {
        value: '~'
      }
    },
    templateUrl: `${componentsPath}/runs-page/runs-page.html`
  },

  'seccubus.findingsPage': {
    url: '/findings/:scan_id',
    params: {
      scan_id: {
        value: '~'
      }
    },
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
  },

  'seccubus.scansPage': {
    url: '/scans',
    templateUrl: componentsPath + '/scans-page/scans-page.html'
  },
  'seccubus.scansPage.create': {
    url: '/create',
    views: {
      'drawer@seccubus': {
        templateUrl: `${componentsPath}/scans-page/scan-create/scan-create.html`
      }
    }
  },
  'seccubus.scansPage.edit': {
    url: '/edit/:scan_id',
    views: {
      'drawer@seccubus': {
        templateUrl: `${componentsPath}/scans-page/scan-edit/scan-edit.html`
      }
    }
  }
  /* MARKER: insert routes here */
};
