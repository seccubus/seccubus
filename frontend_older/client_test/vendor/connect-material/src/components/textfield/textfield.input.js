import {materialComponents} from '../components';
import angular from 'angular';

materialComponents.directive('materialInput', [
    '$parse',
    function () {
        return {
            restrict: 'A',
            replace: true,
            require: [
                '^?materialInputGroup', '?ngModel'
            ],
            link: function (scope, element, attr, ctrls) {
                if (!ctrls[0]) {
                    return;
                }
                var inputGroupCtrl = ctrls[0];
                var ngModelCtrl = ctrls[1];

                scope.$watch(scope.isDisabled, function (isDisabled) {
                    element.attr('aria-disabled', !!isDisabled);
                });

                scope.$watch(scope.getTabIndex, function (tabindex) {
                    element.attr('tabindex', tabindex);
                });

                element.attr('type', attr.type || element.parent().attr('type') || 'text');

                // When the input value changes, check if it "has" a value, and
                // set the appropriate class on the input group
                if (ngModelCtrl) {
                    //Add a $formatter so we don't use up the render function
                    ngModelCtrl.$formatters.push(function (value) {
                        inputGroupCtrl.setHasValue(isNotEmpty(value));
                        return value;
                    });
                }

                element
                    .on('input', function () {
                        inputGroupCtrl.setHasValue(isNotEmpty());
                    })
                    .on('focus', function () {
                        // When the input focuses, add the focused class to the group
                        inputGroupCtrl.setFocused(true);
                    })
                    .on('blur', function () {
                        // When the input blurs, remove the focused class from the group
                        inputGroupCtrl.setFocused(false);
                        inputGroupCtrl.setHasValue(isNotEmpty());
                    });

                scope.$on('$destroy', function () {
                    inputGroupCtrl.setFocused(false);
                    inputGroupCtrl.setHasValue(false);
                });

                function isNotEmpty(value) {
                    value = angular.isUndefined(value) ? element.val() : value;
                    return (angular.isDefined(value) && (value !== null) &&
                        (value.toString().trim() !== ''));
                }
            }
        };
    }
]);
