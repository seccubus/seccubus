import angular from 'angular';
import _module from './_module';

_module.factory('RunResource', [
  '$resource',
  function($resource) {
    function transformItem(item) {
      item.time = item.time ? new Date(item.time) : null;
      return item;
    }

    var Resource = $resource(null, {}, {
      query: {
        url: 'json/getRuns.pl',
        method: 'GET',
        isArray: true,
        transformItem: transformItem
      }
    });

    return Resource;
  }
]);
