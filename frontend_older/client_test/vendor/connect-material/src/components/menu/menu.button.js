import {materialComponents} from '../components';
import angular from 'angular';

import '../../services/config/config';
import '../../services/menu/menu';

import '../button/button';

materialComponents.directive('materialMenuButton', [
    'materialConfigService',
    'materialMenuService',
    function (configs, menus) {
        var ID_GENERATOR = 1;

        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                menuId: '@',
                icon: '@',
                label: '@'
            },
            template: [
                '<material-button ng-click="openMenu($event)" icon="{{icon}}">{{label}}</material-button>',
                '<material-menu menu-id="{{menuId}}" menu-config="_menuConfig" ng-transclude></material-menu>'
            ].join(''),

            compile: function ($element, $attrs) {
                if (angular.isUndefined($attrs.menuId)) {
                    $attrs.menuId = 'material-menubutton-' + ID_GENERATOR++;
                }

                return function ($scope, $element, $attrs) {
                    configs.bridgeConfigs($scope, $attrs, 'menuConfig');

                    $scope.openMenu = function (e) {
                        e.stopPropagation();
                        menus.open($scope.menuId);
                    };
                };
            }
        };
    }
]);
