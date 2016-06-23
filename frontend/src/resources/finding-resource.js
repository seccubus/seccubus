import angular from 'angular';
import _module from './_module';

_module.factory('FindingResource', [
  '$resource',
  function($resource) {
    function transformItem(item) {
      return item;
    }

    var Resource = $resource(null, {}, {
      query: {
        url: 'json/getFindings.pl',
        method: 'GET',
        isArray: true,
        transformItem: transformItem
      }
    });

    return Resource;
  }
]);
