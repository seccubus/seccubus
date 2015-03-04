import {materialComponents} from '../components';

materialComponents.directive('materialItem', [
    function () {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                icon: '@'
            },
            template: [
                '<div ng-if="icon" class="{{getIconClass()}}"></div>',
                '<div class="material-text" ng-transclude></div>',
            ].join(''),
            link: function ($scope) {
                $scope.getIconClass = function () {
                    var parts = $scope.icon.split(':'),
                        iconCls = 'icon-' + parts[0];

                    iconCls += ' ' + iconCls + '-ic_' + parts[1] + '_24dp';
                    return 'material-icon ' + iconCls;
                };
            }
        };
    }
]);
