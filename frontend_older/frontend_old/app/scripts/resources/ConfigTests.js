define([
    './_module'
], function (module) {
    'use strict';
    return module.factory('ConfigTests', [
        '$resource',
        'Collection',
        function ($resource, Collection) {
        	return Collection('ConfigTests', $resource('/json/ConfigTest.pl'));
        }
    ]);
});

