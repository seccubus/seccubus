System.register(["app/annotations/component"], function($__export) {
  "use strict";
  var Component,
      ScansPage,
      ScansPageModule;
  return {
    setters: [function(m) {
      Component = m.Component;
    }],
    execute: function() {
      ScansPage = $__export("ScansPage", (function() {
        var ScansPage = function ScansPage($scope) {
          this.scope = $scope;
        };
        return ($traceurRuntime.createClass)(ScansPage, {}, {});
      }()));
      Object.defineProperty(ScansPage, "annotations", {get: function() {
          return [new Component({
            name: 'ScansPage',
            componentServices: ['$scope']
          })];
        }});
      ScansPageModule = $__export("ScansPageModule", Component.getAngularModule(ScansPage));
    }
  };
});

//# sourceMappingURL=scans-page.js
//# sourceURL=components/scans-page/scans-page.js