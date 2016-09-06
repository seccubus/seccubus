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
	module.controller('StatusCtrl', [
		'$scope',
		'Version',
		'ConfigTests',
		function($scope, Version, ConfigTests) {
			$scope.page.name = 'Status';

			$scope.versionTest = Version.get();
			$scope.configTests = ConfigTests.query();
		}
	]);
});