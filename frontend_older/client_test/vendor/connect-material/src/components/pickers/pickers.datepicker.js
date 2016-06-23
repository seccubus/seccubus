import {materialComponents} from '../components';
import angular from 'angular';

import '../../services/config/config';

import '../button/button';

materialComponents.constant('datepickerConfig', {
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
});

materialComponents.controller('DatepickerCtrl', [
    '$scope',
    '$attrs',
    '$parse',
    'dateFilter',
    'materialConfigService',
    'datepickerConfig',
    function ($scope, $attrs, $parse, dateFilter, configs, defaultDatepickerConfig) {
        var self = this,
            ngModelCtrl = {$setViewValue: angular.noop, $render: angular.noop};

        configs.applyConfigs($scope, $attrs.datepickerConfig, defaultDatepickerConfig);

        $scope.activeDate = this.activeDate = new Date();
        $scope.datepickerMode = $scope.datepickerMode || 'day';

        $scope.$watch('_minDate', function (value) {
            self.minDate = null;

            if (angular.isDate(value)) {
                self.minDate = value;
            } else if (angular.isString(value) || angular.isNumber(value)) {
                if (value === 'now') {
                    self.minDate = new Date();
                } else {
                    self.minDate = new Date(value.toString());
                }
            }

            self.refreshView();
        });

        $scope.$watch('_maxDate', function (value) {
            self.maxDate = null;

            if (angular.isDate(value)) {
                self.maxDate = value;
            } else if (angular.isString(value) || angular.isNumber(value)) {
                if (value === 'now') {
                    self.maxDate = new Date();
                } else {
                    self.maxDate = new Date(value.toString());
                }
            }

            self.refreshView();
        });

        $scope.$watch('_startingDay', function (value) {
            self.startingDay = value;
            self.refreshView();
        });

        $scope.$watch('_yearRange', function (value) {
            self.yearRange = value;
            self.refreshView();
        });

        $scope.isActive = function (dateObject) {
            if (self.compare(dateObject.date, self.activeDate) === 0) {
                return true;
            }
            return false;
        };

        this.init = function (ngModelCtrl_) {
            ngModelCtrl = ngModelCtrl_;
            ngModelCtrl.$render = function () {
                self.render();
            };
        };

        this.render = function () {
            if (ngModelCtrl.$modelValue) {
                var date = new Date(ngModelCtrl.$modelValue),
                    isValid = !isNaN(date);

                if (isValid) {
                    $scope.activeDate = this.activeDate = date;
                } else {
                    console.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                }
                ngModelCtrl.$setValidity('date', isValid);
            }
            this.refreshView();
        };

        this.refreshView = function () {
            if (this._refreshView) {
                this._refreshView();
            }
        };

        this.createDateObject = function (date, format) {
            var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
            return {
                date: date,
                label: dateFilter(date, format),
                selected: model && this.compare(date, model) === 0,
                disabled: this.isDisabled(date),
                current: this.compare(date, new Date()) === 0
            };
        };

        this.isDisabled = function (date) {
            return (
                (self.minDate && this.compare(date, self.minDate) < 0) ||
                (self.maxDate && this.compare(date, self.maxDate) > 0)
            );
        };

        // Split array into smaller arrays
        this.split = function (arr, size) {
            var arrays = [];
            while (arr.length > 0) {
                arrays.push(arr.splice(0, size));
            }
            return arrays;
        };

        $scope.select = function (date) {
            var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
            dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            ngModelCtrl.$setViewValue(dt);
            ngModelCtrl.$render();
        };

        this.getDaysInMonth = function (year, month) {
            return new Date(year, month+1, 1, 0, 0, -1).getDate();
        };

        $scope.selectMonth = function (newDate) {
            var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0),
                daysInNewMonth = self.getDaysInMonth(dt.getYear(), newDate.getMonth());

            if (daysInNewMonth < dt.getDate()) {
                dt.setDate(daysInNewMonth);
            }
            dt.setMonth(newDate.getMonth());

            $scope.select(dt);
            $scope.datepickerMode = 'day';
        };

        $scope.selectYear = function (newDate) {
            var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0),
                daysInNewMonth = self.getDaysInMonth(newDate.getFullYear(), dt.getMonth());

            if (daysInNewMonth < dt.getDate()) {
                dt.setDate(daysInNewMonth);
            }
            dt.setFullYear(newDate.getFullYear());

            $scope.select(dt);
            $scope.datepickerMode = 'month';
        };

        $scope.setMode = function (mode) {
            $scope.datepickerMode = mode;
        };
    }
]);

materialComponents.directive('materialDatepicker', [
    function () {
        return {
            restrict: 'EA',
            require: ['materialDatepicker', '?^ngModel'],
            controller: 'DatepickerCtrl',
            scope: {},
            template: [
                '<div class="material-datepicker-date">',
                    '<h4>{{activeDate|date:\'EEEE\'}}</h4>',
                    '<h2 ng-class="{\'view-active\':datepickerMode==\'month\'}" ng-click="setMode(\'month\')">{{activeDate|date:\'MMM\'}}</h2>',
                    '<h1 ng-class="{\'view-active\':datepickerMode==\'day\'}" ng-click="setMode(\'day\')">{{activeDate|date:\'d\'}}</h1>',
                    '<h3 ng-class="{\'view-active\':datepickerMode==\'year\'}" ng-click="setMode(\'year\')">{{activeDate|date:\'yyyy\'}}</h3>',
                '</div>',
                '<div ng-switch="datepickerMode" class="material-datepicker-view view-{{datepickerMode}}">',
                    '<material-daypicker ng-switch-when="day"></material-daypicker>',
                    '<material-monthpicker ng-switch-when="month"></material-monthpicker>',
                    '<material-yearpicker ng-switch-when="year"></material-yearpicker>',
                '</div>',
            ].join(''),

            link : function ($scope, $element, $attrs, ctrls) {
                var datePickerCtrl = ctrls[0],
                    ngModelCtrl = ctrls[1];

                if (ngModelCtrl) {
                    datePickerCtrl.init(ngModelCtrl);
                } else {
                    console.warn('You should set a ng-model on your DatePicker');
                }
            }
        };
    }
]);

materialComponents.directive('materialDaypicker', [
    'dateFilter',
    function (dateFilter) {
        return {
            restrict: 'EA',
            replace: true,
            require: '^materialDatepicker',
            template: [
                '<table class="material-datepicker-dayview">',
                    '<tr>',
                        '<th ng-repeat="label in labels track by $index">{{label}}</th>',
                    '</tr>',
                    '<tr ng-repeat="row in rows track by $index">',
                        '<td ng-repeat="dt in row track by dt.date">',
                            '<div ng-if="!dt.secondary" class="material-button material-button-day" ',
                                'ng-class="{\'date-active\': isActive(dt), \'date-current\': dt.current}" ',
                                'ng-click="select(dt.date)" ',
                                'ng-disabled="dt.disabled">',
                                    '<div class="material-text">{{dt.label}}</div>',
                            '</div>',
                        '</td>',
                    '</tr>',
                '</table>'
            ].join(''),
            link: function ($scope, $element, $attrs, ctrl) {
                function getDates(startDate, n) {
                    var dates = new Array(n),
                        current = new Date(startDate),
                        i = 0;

                    current.setHours(12); // Prevent repeated dates because of timezone bug
                    while (i < n) {
                        dates[i++] = new Date(current);
                        current.setDate(current.getDate() + 1);
                    }
                    return dates;
                }

                ctrl._refreshView = function () {
                    var year = ctrl.activeDate.getFullYear(),
                        month = ctrl.activeDate.getMonth(),
                        firstDayOfMonth = new Date(year, month, 1),
                        difference = ctrl.startingDay - firstDayOfMonth.getDay(),
                        numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
                        firstDate = new Date(firstDayOfMonth);

                    if (numDisplayedFromPreviousMonth > 0) {
                        firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                    }

                    // 42 is the number of days on a six-month calendar
                    var days = getDates(firstDate, 42);
                    for (var i = 0; i < 42; i++) {
                        days[i] = angular.extend(ctrl.createDateObject(days[i], 'd'), {
                            secondary: days[i].getMonth() !== month
                        });
                    }

                    $scope.labels = new Array(7);
                    for (var j = 0; j < 7; j++) {
                        $scope.labels[j] = dateFilter(days[j].date, 'EEE')[0];
                    }

                    $scope.rows = ctrl.split(days, 7);
                };

                ctrl.compare = function (date1, date2) {
                    return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
                };

                ctrl.refreshView();
            }
        };
    }
]);

materialComponents.directive('materialMonthpicker', [
    'dateFilter',
    function () {
        return {
            restrict: 'EA',
            replace: true,
            require: '^materialDatepicker',
            template: [
                '<ul class="material-datepicker-monthview">',
                    '<li ng-repeat="dt in rows track by dt.date">',
                        '<div class="material-button" ',
                            'ng-class="{\'date-active\': isActive(dt), \'date-current\': dt.current}" ',
                            'ng-click="selectMonth(dt.date)" ',
                            'ng-disabled="dt.disabled">',
                                '<div class="material-text">{{dt.label}}</div>',
                        '</div>',
                    '</li>',
                '</ul>'
            ].join(''),

            link: function ($scope, $element, $attrs, ctrl) {
                ctrl._refreshView = function () {
                    var months = new Array(12),
                        year = ctrl.activeDate.getFullYear();

                    for (var i = 0; i < 12; i++) {
                        months[i] = ctrl.createDateObject(new Date(year, i, 1), 'MMMM');
                    }

                    $scope.rows = months;
                };

                ctrl.compare = function (date1, date2) {
                    return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
                };

                ctrl.refreshView();
            }
        };
    }
]);

materialComponents.directive('materialYearpicker', [
    'dateFilter',
    function () {
        return {
            restrict: 'EA',
            replace: true,
            require: '^materialDatepicker',
            template: [
                '<ul class="material-datepicker-yearview">',
                    '<li ng-repeat="dt in rows | orderBy:\'date\':true track by dt.date">',
                        '<div class="material-button" ',
                            'ng-class="{\'date-active\': isActive(dt), \'date-current\': dt.current}" ',
                            'ng-click="selectYear(dt.date)" ',
                            'ng-disabled="dt.disabled">',
                                '<div class="material-text">{{dt.label}}</div>',
                        '</div>',
                    '</li>',
                '</ul>'
            ].join(''),

            link: function ($scope, $element, $attrs, ctrl) {
                ctrl._refreshView = function () {
                    var minYear = ctrl.minDate && ctrl.minDate.getFullYear() || (new Date()).getFullYear(),
                        maxYear = ctrl.maxDate && ctrl.maxDate.getFullYear() || (minYear + ctrl.yearRange),
                        range = maxYear - minYear + 1,
                        years = new Array(range);

                    for (var i = 0; i < range; i++) {
                        years[i] = ctrl.createDateObject(new Date(minYear + i, 0, 1), 'yyyy');
                    }

                    $scope.rows = years;
                };

                ctrl.compare = function (date1, date2) {
                    return date1.getFullYear() - date2.getFullYear();
                };

                ctrl.refreshView();
            }
        };
    }
]);
