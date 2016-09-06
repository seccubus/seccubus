System.register(["app/annotations/component"], function($__export) {
  "use strict";
  var Component,
      StatusPage,
      StatusPageModule;
  return {
    setters: [function(m) {
      Component = m.Component;
    }],
    execute: function() {
      StatusPage = $__export("StatusPage", (function() {
        var StatusPage = function StatusPage($scope) {
          this.scope = $scope;
        };
        return ($traceurRuntime.createClass)(StatusPage, {}, {});
      }()));
      Object.defineProperty(StatusPage, "annotations", {get: function() {
          return [new Component({
            name: 'StatusPage',
            componentServices: ['$scope']
          })];
        }});
      StatusPageModule = $__export("StatusPageModule", Component.getAngularModule(StatusPage));
    }
  };
});

//# sourceMappingURL=status-page.js
//# sourceURL=components/status-page/status-page.js