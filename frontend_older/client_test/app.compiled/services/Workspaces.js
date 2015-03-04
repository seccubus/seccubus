System.register([], function($__export) {
  "use strict";
  return {
    setters: [],
    execute: function() {
      define(['./_module'], function(module) {
        'use strict';
        return module.factory('Workspaces', ['$resource', 'Collection', function($resource, Collection) {
          return Collection('Workspaces', $resource('/json/getWorkspaces.pl'), 'name');
        }]);
      });
    }
  };
});

//# sourceMappingURL=Workspaces.js
//# sourceURL=services/Workspaces.js