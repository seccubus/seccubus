import _module from './_module';

_module.factory('WorkspaceResource', [
    '$resource',
    function($resource) {
        var Resource = $resource(
            '/seccubus/dev/seccubus/json/getWorkspaces.pl', {
                id: '@id'
            }, {}, {
                stripTrailingSlashes: true
            }
        );

        Resource.build = function() {
            return new Resource({
                name: null
            });
        };

        return Resource;
    }
]);
