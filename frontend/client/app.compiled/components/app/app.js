System.register(["app/annotations/component", "app/lib/utils", "app/config/app.config", "app/config/routes.config", "app/components/navbar/navbar"], function($__export) {
  "use strict";
  var Component,
      dashCase,
      AppConfig,
      RoutesConfig,
      defaultUrl,
      NavbarModule,
      componentModuleNames,
      AppComponent,
      AppModule;
  return {
    setters: [function(m) {
      Component = m.Component;
    }, function(m) {
      dashCase = m.dashCase;
    }, function(m) {
      AppConfig = m.AppConfig;
    }, function(m) {
      RoutesConfig = m.RoutesConfig;
      defaultUrl = m.defaultUrl;
    }, function(m) {
      NavbarModule = m.NavbarModule;
    }],
    execute: function() {
      componentModuleNames = [];
      for (var $__1 = RoutesConfig[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__2; !($__2 = $__1.next()).done; ) {
        var route = $__2.value;
        {
          var componentAnnotation = Component.getAnnotation(route.component);
          var componentModule = componentAnnotation.module;
          componentModuleNames.push(componentModule.name);
          route.component = componentAnnotation.componentRouteName;
        }
      }
      if (AppConfig.debug) {
        console.log('Injecting component modules into ' + AppConfig.moduleName + ':', componentModuleNames);
      }
      AppComponent = $__export("AppComponent", (function() {
        var AppComponent = function AppComponent(router, $scope, $location) {
          this.scope = $scope;
          this.location = $location;
          this.router = router;
        };
        return ($traceurRuntime.createClass)(AppComponent, {
          activate: function() {
            if (!this.router.recognizer.recognize(this.location.url())) {
              this.location.replace();
              this.location.url(defaultUrl);
            }
          },
          get router() {
            return this._router;
          },
          set router(router) {
            if (AppConfig.debug) {
              console.log('Loading routes:', JSON.stringify(RoutesConfig));
            }
            router.config(RoutesConfig);
            this.scope.routes = RoutesConfig;
            this._router = router;
          }
        }, {});
      }()));
      Object.defineProperty(AppComponent, "annotations", {get: function() {
          return [new Component({
            moduleName: AppConfig.moduleName,
            moduleDependencies: $traceurRuntime.spread(AppConfig.moduleDependencies, [NavbarModule.name], componentModuleNames),
            componentServices: ['router', '$scope', '$location']
          })];
        }});
      AppModule = $__export("AppModule", Component.getAngularModule(AppComponent));
      AppModule.config(['componentLoaderProvider', function(componentLoaderProvider) {
        componentLoaderProvider.setTemplateMapping(function(name) {
          var dashName = dashCase(name);
          return '/' + AppConfig.appFolderName + '/' + AppConfig.componentFolderName + '/' + dashName + '/' + dashName + '.html';
        });
      }]);
    }
  };
});

//# sourceMappingURL=app.js
//# sourceURL=components/app/app.js