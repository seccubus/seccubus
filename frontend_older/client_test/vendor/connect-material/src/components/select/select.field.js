import {materialComponents} from '../components';
import angular from 'angular';

import '../../services/config/config';
import '../../services/menu/menu';
import '../textfield/textfield';

import {defaultSelectConfig} from './select.menu';

var ID_GENERATOR = 1;

materialComponents.directive('materialSelectfield', [
    'materialConfigService',
    'materialMenuService',
    function (configs, menus) {
        return {
            restrict: 'EA',
            scope : {
                selectId: '@?',
                fieldLabel : '@?label',
                value: '=ngModel',
                options: '=options'
            },
            require: '?ngModel',
            template: [
                '<material-textfield ng-model="label" label="{{fieldLabel}}" field-config="_fieldConfig"></material-textfield>',
                '<div class="material-select-carret material-icon icon-navigation-black icon-navigation-black-ic_arrow_drop_down_black_24dp"></div>',
                '<material-select ng-click="openSelect($event)" select-id="{{selectId}}" menu-config="_menuConfig" select-config="_selectConfig" ng-model="value" options="options"></material-select>'
            ].join(''),

            compile: function ($element, $attrs) {
                if (angular.isUndefined($attrs.selectId)) {
                    $attrs.selectId = 'material-selectfield-' + ID_GENERATOR++;
                    $element.attr('select-id', $attrs.selectId);
                }

                if (angular.isUndefined($attrs.options)) {
                    console.warn('You defined a selectfield without binding options to it');
                    $attrs.options = [];
                }

                return function ($scope, $element, $attrs, ngModelCtrl) {
                    configs.applyConfigs($scope, $attrs.selectConfig, defaultSelectConfig);

                    configs.bridgeConfigs($scope, $attrs, 'menuConfig', {
                        appendToBody: true
                    });

                    configs.bridgeConfigs($scope, $attrs, 'fieldConfig');
                    configs.bridgeConfigs($scope, $attrs, 'selectConfig');

                    $scope.$watch('options', function() {
                        renderValue($scope.value);
                    }, true);

                    function renderValue(value) {
                        if (angular.isDefined(value) && $scope.options && $scope.options.length) {
                            var result = $scope.options.filter(function (option) {
                                if ((angular.isObject(option) && option[$scope._valueField] === value) || option === value) {
                                    return true;
                                }
                            })[0] || null;
                            $scope.label = angular.isObject(result) && result[$scope._labelField] || result;
                        }
                        else {
                            $scope.label = null;
                        }

                        return value;
                    }

                    if (ngModelCtrl) {
                        //Add a $formatter so we don't use up the render function
                        ngModelCtrl.$formatters.push(renderValue);
                    }

                    $scope.openSelect = function (e) {
                        e.stopPropagation();
                        menus.open($scope.selectId);
                    };
                };
            }
        };
    }
]);
