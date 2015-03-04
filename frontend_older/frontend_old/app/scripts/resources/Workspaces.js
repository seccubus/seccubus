define([
    './_module'
], function (module) {
    'use strict';
    return module.factory('Workspaces', [
        '$resource',
        'Collection',
        function ($resource, Collection) {
        	return Collection('Workspaces', $resource('/json/getWorkspaces.pl'), 'name');
        }
    ]);
});

