import angular from 'angular';
import _module from './_module';

_module.factory('ScanResource', [
    '$resource',
    function(resource) {
      function transformQuery(data) {
          data = angular.isString(data) ? JSON.parse(data) : data;
          for (let i = 0, ln = data.length; i < ln; i++) {
              data[i] = transformItem(data[i]);
          }
          return data;
      }

      function transformItem(data) {
          data = angular.isString(data) ? JSON.parse(data) : data;
          data.lastScan = new Date(data.lastScan);
          return data;
      }

      var Resource = $resource(null, {}, {
          query: {
              url: '/seccubus/dev/seccubus/json/getScans.pl',
              method: 'POST',
              params: {
                workspaceId: '@workspaceId'
              },
              isArray: true,
              transformResponse: transformQuery
          },
          create: {
              url: '/seccubus/dev/seccubus/json/createScan.pl',
              method: 'POST',
              transformResponse: transformItem
          }
      }, {
          stripTrailingSlashes: true
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
