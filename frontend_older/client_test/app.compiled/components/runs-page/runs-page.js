System.register(["app/annotations/component"], function($__export) {
  "use strict";
  var Component,
      RunsPage,
      RunsPageModule;
  return {
    setters: [function(m) {
      Component = m.Component;
    }],
    execute: function() {
      RunsPage = $__export("RunsPage", (function() {
        var RunsPage = function RunsPage($scope) {
          this.scope = $scope;
        };
        return ($traceurRuntime.createClass)(RunsPage, {}, {});
      }()));
      Object.defineProperty(RunsPage, "annotations", {get: function() {
          return [new Component({
            name: 'RunsPage',
            componentServices: ['$scope']
          })];
        }});
      RunsPageModule = $__export("RunsPageModule", Component.getAngularModule(RunsPage));
    }
  };
});

//# sourceMappingURL=runs-page.js
//# sourceURL=components/runs-page/runs-page.js