import {materialComponents} from '../components';
import angular from 'angular';

import '../../services/config/config';

import '../button/button';
import '../textfield/textfield';
import '../menu/menu';

import './pickers.datepicker';

materialComponents.directive('materialDatefield', [
    '$parse',
    'dateFilter',
    'materialConfigService',
    'materialMenuService',
    function ($parse, dateFilter, configs, menus) {
        var ID_GENERATOR = 1;

        return {
            restrict: 'E',
            scope : {
                menuId: '@?',
                label : '@?',
                value: '=ngModel'
            },
            require: '?ngModel',
            template: [
                '<material-textfield tabindex="-1" ng-model="dateDisplay" ng-disabled="isDisabled()" label="{{label}}" field-config="_fieldConfig"></material-textfield>',
                '<div class="material-select-carret material-icon icon-navigation-black icon-navigation-black-ic_arrow_drop_down_black_24dp"></div>',
                '<div class="material-datefield-mask" ng-click="openPicker($event)"></div>',
                '<material-menu class="material-datepicker-menu" menu-id="{{menuId}}" menu-config="_menuConfig">',
                    '<material-datepicker ng-model="value" datepicker-config="_datepickerConfig"></material-datepicker>',
                '</material-menu>'
            ].join(''),

            compile: function ($element, $attrs) {
                if (angular.isUndefined($attrs.menuId)) {
                    $attrs.menuId = 'material-datefield-' + ID_GENERATOR++;
                    $element.attr('menu-id', $attrs.menuId);
                }

                return function ($scope, $element, $attrs, ngModelCtrl) {
                    var menu = menus.get($attrs.menuId);

                    configs.applyConfigs($scope, $attrs.datefieldConfig, {
                        displayFormat: 'dd-MM-yyyy'
                    });

                    configs.bridgeConfigs($scope, $attrs, 'fieldConfig');
                    configs.bridgeConfigs($scope, $attrs, 'menuConfig', {
                        appendToBody: true,
                        closeOnMenuClick: false,
                        autoAdjust: false
                    });
                    configs.bridgeConfigs($scope, $attrs, 'datepickerConfig');

                    var disabledParsed = $parse($attrs.ngDisabled);
                    $scope.isDisabled = function () {
                        return disabledParsed($scope.$parent);
                    };

                    $scope.openPicker = function (e) {
                        if (!$scope.isDisabled()) {
                            e.stopPropagation();
                            menu.open();
                        }
                    };

                    if (ngModelCtrl) {
                        //Add a $formatter so we don't use up the render function
                        ngModelCtrl.$formatters.push(function (value) {
                            if (value) {
                                var date = new Date(value),
                                    isValid = !isNaN(date);

                                if (isValid) {
                                    $scope.dateDisplay = dateFilter(date, $scope._displayFormat);
                                } else {
                                    console.error('Datefield directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                                }
                                ngModelCtrl.$setValidity('date', isValid);
                                return date;
                            }

                            return value;
                        });
                    }

                    // This makes sure that we close the picker when you select a date in the day view
                    angular.element($element[0].querySelector('material-menu .material-datepicker-view')).on('click', function (e) {
                        if (angular.element(e.target).hasClass('material-button-day')) {
                            $scope.$apply(function() {
                                menu.close();
                            });
                        }
                    });

                    // Because we appendToBody the menu and set autoAdjust to false we have to set
                    // the top and right of the menu ourselves for pickers
                    menu.on('beforeopen', function () {
                        var containerRect = $element[0].getBoundingClientRect(),
                            innerMenuHeight = menu.element[0].scrollHeight,
                            newTop = Math.max((containerRect.top - (innerMenuHeight / 2)), 10);

                        menu.element.css({
                            top: newTop + 'px',
                            right: (document.documentElement.clientWidth - containerRect.right) + 'px'
                        });
                    });

                    menu.on('close', function () {
                        var style = menu.element[0].style;
                        style.top = null;
                        style.right = null;
                    });
                };
            }
        };
    }
]);
