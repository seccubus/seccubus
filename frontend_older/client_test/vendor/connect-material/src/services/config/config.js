import angular from 'angular';
import {materialServices} from '../services';

materialServices.factory('materialConfigService', function () {
    return {
        applyConfigs: function ($scope, config, defaults) {
            if (angular.isDefined(config)) {
                $scope.$parent.$watch(config, function (value) {
                    value = angular.extend(angular.copy(defaults), angular.isObject(value) ? value : {});

                    Object.keys(value).forEach(function (key) {
                        $scope['_' + key] = value[key];
                    });
                }, true);
            } else if (angular.isDefined(defaults) && angular.isObject(defaults)) {
                Object.keys(defaults).forEach(function (key) {
                    $scope['_' + key] = defaults[key];
                });
            }
        },

        bridgeConfigs: function ($scope, $attrs, configName, defaults) {
            defaults = angular.isObject(defaults) ? angular.copy(defaults) : {};

            if (angular.isDefined($attrs[configName])) {
                $scope.$parent.$watch($attrs[configName], function (value) {
                    $scope['_' + configName] = angular.extend(defaults, angular.copy(value));
                }, true);
            } else {
                $scope['_' + configName] = defaults;
            }
        }
    };
});
