import {materialComponents} from '../components';
import angular from 'angular';

materialComponents.directive('materialTab', [
    '$compile',
    function($compile) {
        return {
            restrict: 'EA',
            controller: 'materialTabController',
            require: ['materialTab', '^materialTabs'],
            scope: {
                label: '@'
            },
            compile: function($element, $attrs) {
                var label = $element.find('material-tab-label');

                if (label.length) {
                    label.remove();
                }
                else if (angular.isDefined($attrs.label)) {
                    label = angular.element('<material-tab-label>').html($attrs.label);
                }
                else {
                    // If nothing is found, use the tab's content as the label
                    label = angular.element('<material-tab-label>').append($element.contents().remove());
                }

                // Everything that's left as a child is the tab's content.
                var content = $element.contents().remove();

                return function($scope, $element, $attrs, ctrls) {
                    var tab = ctrls[0],
                        tabs = ctrls[1],
                        labelClone = label.clone(),
                        contentClone = content.clone();

                    // Clone the label and the content;
                    $element.append(labelClone);
                    $compile(labelClone)($scope.$parent);
                    tab.content = contentClone;

                    tabs.add(tab);

                    if (!angular.isDefined($attrs.ngClick)) {
                        $element.on('click', function () {
                            $scope.$apply(function () {
                                tabs.select(tab);
                            });
                        });
                    }

                    // If this tab is defined using an ng-repeat we need to set up a watcher
                    if (angular.isNumber($scope.$parent.$index)) {
                        $scope.$watch('$parent.$index', function (newIndex) {
                            tabs.move(tab, newIndex);
                        });
                    }

                    $scope.$on('$destroy', function() {
                        tabs.remove(tab);
                    });
                };
            }
        };
    }
]);

materialComponents.controller('materialTabController', [
    '$scope',
    '$element',
    '$animate',
    '$compile',
    function($scope, $element, $animate, $compile) {
        var self = this;

        angular.extend(self, {
            element: $element,
            contentEl: angular.element('<div class="material-tabcontent"></div>'),

            onAdd: function (containerEl) {
                if (self.content.length) {
                    self.contentEl.append(self.content);
                    self.contentScope = $scope.$parent.$new();
                    containerEl.append(self.contentEl);

                    $compile(self.contentEl)(self.contentScope);
                    self.disconnectScope(self.contentScope);
                }
            },

            onRemove: function () {
                $animate.leave(self.contentEl).then(function() {
                    if (self.contentScope) {
                        self.contentScope.$destroy();
                    }
                    self.contentScope = null;
                });
            },

            onSelect: function () {
                self.reconnectScope(self.contentScope);
                $element.addClass('material-tab-active');
                $animate.addClass(self.contentEl, 'material-opened');
            },

            onDeselect: function () {
                self.disconnectScope(self.contentScope);
                $element.removeClass('material-tab-active');
                $animate.removeClass(self.contentEl, 'material-opened');
            },

            // These two methods are copied from angular-material util.js
            // Stop watchers and events from firing on a scope without destroying it,
            // by disconnecting it from its parent and its siblings' linked lists.
            disconnectScope: function (scope) {
                if (!scope) {
                    return;
                }

                // we can't destroy the root scope or a scope that has been already destroyed
                if (scope.$root === scope) {
                    return;
                }
                if (scope.$$destroyed) {
                    return;
                }

                var parent = scope.$parent;
                scope.$$disconnected = true;

                // See Scope.$destroy
                if (parent.$$childHead === scope) {
                    parent.$$childHead = scope.$$nextSibling;
                }
                if (parent.$$childTail === scope) {
                    parent.$$childTail = scope.$$prevSibling;
                }
                if (scope.$$prevSibling) {
                    scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
                }
                if (scope.$$nextSibling) {
                    scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;
                }

                scope.$$nextSibling = scope.$$prevSibling = null;
            },

            reconnectScope: function (scope) {
                if (!scope) {
                    return;
                }

                if (scope.$root === scope) {
                    return;
                }
                if (!scope.$$disconnected) {
                    return;
                }

                var child = scope;
                var parent = child.$parent;

                child.$$disconnected = false;
                child.$$prevSibling = parent.$$childTail;

                if (parent.$$childHead) {
                    parent.$$childTail.$$nextSibling = child;
                    parent.$$childTail = child;
                } else {
                    parent.$$childHead = parent.$$childTail = child;
                }
            }
        });
    }
]);
