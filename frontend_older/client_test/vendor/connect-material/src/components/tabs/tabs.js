import {materialComponents} from '../components';
import angular from 'angular';

import './tabs.tab';

materialComponents.directive('materialTabs', [
    function () {
    	return {
    		restrict: 'EA',
    		require: 'materialTabs',
    		controller: 'materialTabsController',
    		transclude: true,
    		scope: {
    			selectedIndex: '=?materialSelected'
    		},
    		template: [
    			'<div class="material-tabs-bar"></div>',
    			'<div class="material-tabs-content"></div>'
    		].join(''),
    		link: function ($scope, $element, $attrs, tabs, $transclude) {
        		$transclude($scope.$parent, function(clone) {
        			angular.element($element[0].querySelector('.material-tabs-bar')).append(clone);
        		});

        		$scope.$watch('selectedIndex', function(newIndex, oldIndex) {
        			tabs.deselect(tabs.getTabAt(oldIndex));

        			var newTab = tabs.getTabAt(newIndex);
        			if (newTab) {
        				tabs.select(newTab);
        			}
        		});
        	}
    	};
    }
]);

materialComponents.controller('materialTabsController', [
	'$scope',
	'$element',
	function($scope, $element) {
		var self = this,
			tabs = [];

		angular.extend(self, {
			element: $element,
			contentEl: angular.element($element[0].querySelector('.material-tabs-content')),

			getTabAt: function(index) {
				return angular.isNumber(index) && index >= 0 ? tabs[index] : null;
			},

			getSelected: function() {
				return self.getTabAt($scope.selectedIndex);
			},

			indexOf: function(tab) {
				return tabs.indexOf(tab);
			},

			add: function(tab, index) {
				var selectedIndex = $scope.selectedIndex;

				index = angular.isNumber(index) ? index : tabs.length;
				tabs.splice(index, 0, tab);

				// Give the tabs ctrl the chance to act upon its own addition to the tabs container
				tab.onAdd(self.contentEl);

				if (selectedIndex === -1 || !angular.isNumber(selectedIndex) || selectedIndex === index) {
					self.select(tab);
				}
			},

			remove: function(tab) {
				var index = tabs.indexOf(tab);

				if (index !== -1) {
					if (self.getSelected() === tab) {
						if (tabs.length > 1) {
							self.select(self.getPrevious() || self.getNext());
						}
						else {
							self.deselect(tab);
						}
					}
					tabs.splice(index, 1);
					tab.onRemove();
				}
			},

			move: function(tab, newIndex) {
				var isSelected = self.getSelected() === tab,
					oldIndex = self.indexOf(tab);

				if (oldIndex > -1) {
					tabs.splice(oldIndex, 1);
					tabs.splice(newIndex, 0, tab);

					if (isSelected) {
						self.select(tab);
					}
				}
			},

			select: function(tab) {
				if (!tab || tab.isSelected || tabs.indexOf(tab) === -1) {
					return;
				}

				self.deselect(self.getSelected());

				$scope.selectedIndex = self.indexOf(tab);
				tab.isSelected = true;
				tab.onSelect();
			},

			deselect: function(tab) {
				if (!tab || !tab.isSelected || tabs.indexOf(tab) === -1) {
					return;
				}

				$scope.selectedIndex = -1;
				tab.isSelected = false;
				tab.onDeselect();
			},

			getPrevious: function(tab) {
				var index = self.indexOf(tab);
				return index >= 1 && tabs[index - 1] || null;
			},

			getNext: function(tab) {
				var index = self.indexOf(tab);
				return index < (tabs.length - 1) && tabs[index + 1] || null;
			}
		});

		$scope.$on('$destroy', function() {
			self.deselect(self.getSelected());
			tabs.forEach(function(tab) {
				self.remove(tab, true);
			});
		});
	}
]);
