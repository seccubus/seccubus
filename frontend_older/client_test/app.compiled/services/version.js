System.register([], function($__export) {
  "use strict";
  return {
    setters: [],
    execute: function() {
      define(['./_module'], function(module) {
        'use strict';
        return module.factory('Version', ['$resource', function($resource) {
          return $resource('/json/UpToDate.pl', null, {get: {
              responseType: 'json',
              transformResponse: function(response) {
                return response[0];
              }
            }});
        }]);
      });
    }
  };
});

//# sourceMappingURL=version.js
//# sourceURL=services/version.js