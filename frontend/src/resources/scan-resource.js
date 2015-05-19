import angular from 'angular';
import _module from './_module';

_module.factory('ScanResource', [
  '$resource',
  function($resource) {
    function transformItem(item) {
      item.lastScan = item.lastScan ? new Date(item.lastScan) : null;
      return item;
    }

    var Resource = $resource(null, {}, {
      query: {
        url: '/seccubus/dev/seccubus/json/getScans.pl',
        method: 'GET',
        isArray: true,
        transformItem: transformItem
      },
      create: {
        url: '/seccubus/dev/seccubus/json/createScan.pl',
        method: 'POST',
        transformItem: transformItem
      }
    });

    Resource.build = function(data) {
      return new Resource(Object.assign({
        name: null,
        targets: null,
        password: null,
        scanner: null,
        parameters: null,
        otherScanner: null,
        workspaceId: null
      }, data));
    };

    return Resource;
  }
]);
