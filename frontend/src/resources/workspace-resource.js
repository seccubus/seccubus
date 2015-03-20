import angular from 'angular';
import _module from './_module';

_module.factory('WorkspaceResource', [
    '$resource',
    function($resource) {
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
                url: '/seccubus/dev/seccubus/json/getWorkspaces.pl',
                isArray: true,
                transformResponse: transformQuery
            },
            create: {
                url: '/seccubus/dev/seccubus/json/createWorkspace.pl',
                method: 'POST',
                transformResponse: transformItem
            },
            update: {
                url: '/seccubus/dev/seccubus/json/updateWorkspace.pl',
                method: 'POST',
                transformResponse: transformItem
            }
        }, {
            stripTrailingSlashes: true
        });

        Resource.build = function() {
            return new Resource({
                name: null
            });
        };

        return Resource;
    }
]);
