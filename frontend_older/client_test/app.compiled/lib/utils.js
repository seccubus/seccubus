System.register([], function($__export) {
  "use strict";
  function dashCase(str) {
    return str.replace(/([A-Z])/g, function($1) {
      return '-' + $1.toLowerCase();
    });
  }
  $__export("dashCase", dashCase);
  return {
    setters: [],
    execute: function() {
    }
  };
});

//# sourceMappingURL=utils.js
//# sourceURL=lib/utils.js