import angular from 'angular';
import _module from './_module';

_module.factory('WorkspaceResource', [
  '$resource',
  function($resource) {
    function transformItem(item) {
      item.lastScan = new Date(item.lastScan);
      return item;
    }

    var Resource = $resource(null, {}, {
      query: {
        url: 'json/getWorkspaces.pl',
        isArray: true,
        transformItem: transformItem
      },
      create: {
        url: 'json/createWorkspace.pl',
        method: 'POST',
        transformItem: transformItem
      },
      update: {
        url: 'json/updateWorkspace.pl',
        method: 'POST',
        transformItem: transformItem
      }
    });

    Resource.build = function() {
      return new Resource({
        name: null
      });
    };

    return Resource;
  }
]);
