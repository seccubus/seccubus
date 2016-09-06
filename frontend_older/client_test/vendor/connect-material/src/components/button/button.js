import {materialComponents} from '../components';

materialComponents.directive('materialButton', [
    '$animate',
    function ($animate) {
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
            link: function ($scope, $element) {
                $animate.enabled(false, $element);

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
