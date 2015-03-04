System.register(["angular-touch", "angular-animate", "angular-new-router", "angular-messages", "material/components/components", "material/services/services", "material/utils/utils"], function($__export) {
  "use strict";
  var AppConfig;
  return {
    setters: [function(m) {}, function(m) {}, function(m) {}, function(m) {}, function(m) {}, function(m) {}, function(m) {}],
    execute: function() {
      AppConfig = $__export("AppConfig", {
        moduleName: 'App',
        moduleDependencies: ['ngTouch', 'ngAnimate', 'ngMessages', 'ngFuturisticRouter', 'material.components', 'material.services', 'material.utils'],
        componentFolderName: 'components',
        appFolderName: 'app',
        debug: true
      });
    }
  };
});

//# sourceMappingURL=app.config.js
//# sourceURL=config/app.config.js