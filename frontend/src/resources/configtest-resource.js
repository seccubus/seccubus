import _module from './_module';

_module.factory('ConfigTestResource', [
    '$resource',
    function(resource) {
        return resource(
            '/seccubus/dev/seccubus/json/ConfigTest.pl'
        );
    }
]);
