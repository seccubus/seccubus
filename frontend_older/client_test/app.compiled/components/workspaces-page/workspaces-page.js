System.register(["app/annotations/component"], function($__export) {
  "use strict";
  var Component,
      WorkspacesPage,
      WorkspacesPageModule;
  return {
    setters: [function(m) {
      Component = m.Component;
    }],
    execute: function() {
      WorkspacesPage = $__export("WorkspacesPage", (function() {
        var WorkspacesPage = function WorkspacesPage($scope) {
          this.scope = $scope;
        };
        return ($traceurRuntime.createClass)(WorkspacesPage, {}, {});
      }()));
      Object.defineProperty(WorkspacesPage, "annotations", {get: function() {
          return [new Component({
            name: 'WorkspacesPage',
            componentServices: ['$scope']
          })];
        }});
      WorkspacesPageModule = $__export("WorkspacesPageModule", Component.getAngularModule(WorkspacesPage));
    }
  };
});

//# sourceMappingURL=workspaces-page.js
//# sourceURL=components/workspaces-page/workspaces-page.js