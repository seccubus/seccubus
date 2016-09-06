System.register(["../components/status-page/status-page", "../components/findings-page/findings-page", "../components/runs-page/runs-page", "../components/scans-page/scans-page", "../components/workspaces-page/workspaces-page"], function($__export) {
  "use strict";
  var StatusPage,
      FindingsPage,
      RunsPage,
      ScansPage,
      WorkspacesPage,
      RoutesConfig,
      defaultUrl;
  return {
    setters: [function(m) {
      StatusPage = m.StatusPage;
    }, function(m) {
      FindingsPage = m.FindingsPage;
    }, function(m) {
      RunsPage = m.RunsPage;
    }, function(m) {
      ScansPage = m.ScansPage;
    }, function(m) {
      WorkspacesPage = m.WorkspacesPage;
    }],
    execute: function() {
      RoutesConfig = $__export("RoutesConfig", [{
        pageName: 'Status',
        path: 'status',
        component: StatusPage
      }, {
        pageName: 'Findings',
        path: 'findings',
        component: FindingsPage
      }, {
        pageName: 'Runs',
        path: 'runs',
        component: RunsPage
      }, {
        pageName: 'Scans',
        path: 'scans',
        component: ScansPage
      }, {
        pageName: 'Workspaces',
        path: 'workspaces',
        component: WorkspacesPage
      }]);
      defaultUrl = $__export("defaultUrl", '/status');
    }
  };
});

//# sourceMappingURL=routes.config.js
//# sourceURL=config/routes.config.js