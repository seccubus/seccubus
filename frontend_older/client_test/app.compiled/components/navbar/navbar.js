System.register(["app/annotations/component", "app/config/routes.config", "material/components/sidenav/sidenav"], function($__export) {
  "use strict";
  var Component,
      RoutesConfig,
      Navbar,
      NavbarModule;
  return {
    setters: [function(m) {
      Component = m.Component;
    }, function(m) {
      RoutesConfig = m.RoutesConfig;
    }, function(m) {}],
    execute: function() {
      Navbar = $__export("Navbar", (function() {
        var Navbar = function Navbar($location, router) {
          this.routes = RoutesConfig;
          this.router = router;
          this.location = $location;
        };
        return ($traceurRuntime.createClass)(Navbar, {
          get currentUrl() {
            return this.location.url();
          },
          get currentRoute() {
            var routeContext = this.router.parent.recognizer.recognize(this.currentUrl)[0];
            if (routeContext) {
              return this.routes.filter((function(route) {
                return route.component === routeContext.handler.component;
              }))[0];
            }
          }
        }, {});
      }()));
      Object.defineProperty(Navbar, "annotations", {get: function() {
          return [new Component({
            name: 'Navbar',
            componentServices: ['$location', 'router']
          })];
        }});
      NavbarModule = $__export("NavbarModule", Component.getAngularModule(Navbar));
    }
  };
});

//# sourceMappingURL=navbar.js
//# sourceURL=components/navbar/navbar.js