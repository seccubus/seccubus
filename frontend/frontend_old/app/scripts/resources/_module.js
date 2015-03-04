define([
	'angular',
	'angular-resource',
	'connect-collections'
], function (ng) {
    'use strict';
    return ng.module('seccubus.resources', ['connect-collections', 'ngResource']);
});