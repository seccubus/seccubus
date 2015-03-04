System.register(["app/annotations/component"], function($__export) {
  "use strict";
  var Component,
      FindingsPage,
      FindingsPageModule;
  return {
    setters: [function(m) {
      Component = m.Component;
    }],
    execute: function() {
      FindingsPage = $__export("FindingsPage", (function() {
        var FindingsPage = function FindingsPage($scope) {
          this.scope = $scope;
        };
        return ($traceurRuntime.createClass)(FindingsPage, {}, {});
      }()));
      Object.defineProperty(FindingsPage, "annotations", {get: function() {
          return [new Component({
            name: 'FindingsPage',
            componentServices: ['$scope']
          })];
        }});
      FindingsPageModule = $__export("FindingsPageModule", Component.getAngularModule(FindingsPage));
    }
  };
});

//# sourceMappingURL=findings-page.js
//# sourceURL=components/findings-page/findings-page.js