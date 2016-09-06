System.register(["angular", "./components/app/app"], function($__export) {
  "use strict";
  var angular,
      AppModule;
  return {
    setters: [function(m) {
      angular = m.default;
    }, function(m) {
      AppModule = m.AppModule;
    }],
    execute: function() {
      angular.element(document).ready(function() {
        angular.bootstrap(document.querySelector('[data-main-app]'), [AppModule.name]);
      });
    }
  };
});

//# sourceMappingURL=bootstrap.js
//# sourceURL=bootstrap.js