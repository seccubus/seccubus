import {materialComponents} from '../components';
import angular from 'angular';

import '../../services/config/config';

import '../button/button';
import '../dialog/dialog';

import './pickers.datepicker';

materialComponents.directive('materialDatepickerDialog', [
    '$parse',
    '$compile',
    'materialConfigService',
    'materialDialogService',
    function ($parse, $compile, configs, dialogs) {
        var ID_GENERATOR = 1;

        return {
            restrict: 'EA',
            require: '?^ngModel',
            scope: {
                dialogId: '@'
            },
            template: [
                '<material-dialog dialog-id="{{dialogId}}" dialog-config="_dialogConfig">',
                    '<material-datepicker ng-model="data.date" datepicker-config="_datepickerConfig"></material-datepicker>',
                    '<material-buttonbar>',
                        '<material-button ng-click="cancelDate()">Cancel</material-button>',
                        '<material-button ng-click="commitDate()" class="material-primary">Done</material-button>',
                    '</material-buttonbar>',
                '</material-dialog>'
            ].join(''),

            compile: function ($element, $attrs) {
                if (angular.isUndefined($attrs.dialogId)) {
                    $attrs.dialogId = 'material-datepickerdialog-' + ID_GENERATOR++;
                    $element.attr('dialog-id', $attrs.dialogId);
                }

                return function ($scope, $element, $attrs, ngModelCtrl) {
                    configs.bridgeConfigs($scope, $attrs, 'dialogConfig');
                    configs.bridgeConfigs($scope, $attrs, 'datepickerConfig');

                    $scope.data = {date: new Date()};

                    // Outter change
                    ngModelCtrl.$render = function () {
                        $scope.data.date = angular.isDefined(ngModelCtrl.$modelValue) ? new Date(ngModelCtrl.$modelValue) : new Date();
                    };

                    $scope.cancelDate = function () {
                        ngModelCtrl.$render();
                        dialogs.close($scope.dialogId);
                    };

                    $scope.commitDate = function () {
                        ngModelCtrl.$setViewValue($scope.data.date);
                        ngModelCtrl.$render();
                        dialogs.close($scope.dialogId);
                    };
                };
            }
        };
    }
]);
