import {materialComponents} from '../components';

import '../../services/config/config';
import '../../utils/constant/constant';

materialComponents.directive('materialProgressCircular', [
    'materialConfigService',
    'materialConstants',
    function (configs, constants) {
        var fillRotations = new Array(101);
        var fixRotations = new Array(101);

        for (var i = 0; i < 101; i++) {
            var percent = i / 100;
            var rotation = Math.floor(percent * 180);

            fillRotations[i] = 'rotate(' + rotation.toString() + 'deg)';
            fixRotations[i] = 'rotate(' + (rotation * 2).toString() + 'deg)';
        }

        return {
            restrict: 'E',
            template: [
                '<div class="material-progress-wrapper">',
                    '<div class="material-progress-inner">',
                        '<div class="material-progress-gap"></div>',
                        '<div class="material-progress-left">',
                            '<div class="material-progress-half-circle"></div>',
                        '</div>',
                        '<div class="material-progress-right">',
                            '<div class="material-progress-half-circle"></div>',
                        '</div>',
                    '</div>',
                '</div>'
            ].join(''),
            compile: function ($element, $attrs) {
                $element.attr('aria-valuemin', 0);
                $element.attr('aria-valuemax', 100);
                $element.attr('role', 'progressbar');

                return function ($scope, $element, $attrs) {
                    var circle = $element[0],
                        fill = circle.querySelectorAll('.material-fill, .material-mask.material-full'),
                        fix = circle.querySelectorAll('.material-fill.material-fix'),
                        i, clamped, fillRotation, fixRotation;

                    var diameter = $attrs.materialDiameter || 48;
                    var scale = diameter / 48;

                    circle.style[constants.CSS.TRANSFORM] = 'scale(' + scale.toString() + ')';

                    $attrs.$observe('value', function(value) {
                        clamped = clamp(value);
                        fillRotation = fillRotations[clamped];
                        fixRotation = fixRotations[clamped];

                        $element.attr('aria-valuenow', clamped);

                        for (i = 0; i < fill.length; i++) {
                            fill[i].style[constants.CSS.TRANSFORM] = fillRotation;
                        }

                        for (i = 0; i < fix.length; i++) {
                            fix[i].style[constants.CSS.TRANSFORM] = fixRotation;
                        }
                    });

                    function clamp(value) {
                        if (value > 100) {
                            return 100;
                        }

                        if (value < 0) {
                            return 0;
                        }

                        return Math.ceil(value || 0);
                    }
                };
            }
        };
    }
]);
