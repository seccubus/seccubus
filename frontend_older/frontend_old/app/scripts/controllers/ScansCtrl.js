define([
	'angular',
	'./_module'
], function(ng, module) {
	'use strict';

	/**
	 * @name seccubus.controller:MainCtrl
	 * @description
	 * # MainCtrl
	 * Controller of seccubus
	 */
	module.controller('ScansCtrl', [
		'$scope',
		function($scope, Version, ConfigTests) {
			$scope.page.name = 'Manage Scans';
		}
	]);
});