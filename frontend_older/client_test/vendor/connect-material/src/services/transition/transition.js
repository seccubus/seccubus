import angular from 'angular';
import {materialServices} from '../services';

materialServices.factory('materialTransitionService', [
    '$animate',
    '$q',
    function($animate, $q) {
        var TransitionService = function(serviceName, config) {
            var transitions = {},
                openTransitionId = null;

            config = angular.extend({
                transitionCls: 'material-opened',
                forceSingle: false
            }, config || {});

            var self = {
                create: function(id, element) {
                    if (!id) {
                        throw 'Trying to get a ' + serviceName + ' without passing an id';
                    }

                    var transition = self.get(id);
                    transition.element = angular.element(element);

                    return transition;
                },

                get: function(id) {
                    if (!id) {
                        throw 'Trying to get a ' + serviceName + ' without passing an id';
                    }

                    var transition = transitions[id];
                    if (!transition) {
                        transition = transitions[id] = {
                            element: null,
                            id: id,
                            opened: false,
                            listeners: {
                                beforeopen: [],
                                open: [],
                                beforeclose: [],
                                close: []
                            },
                            deferred: {
                                open: null,
                                close: null
                            },
                            on: function(eventName, listener) {
                                return self.on(eventName, id, listener);
                            },
                            open: function() {
                                return self.open(id);
                            },
                            close: function() {
                                return self.close(id);
                            }
                        };
                    }

                    return transition;
                },

                remove: function(id) {
                    delete transitions[id];
                },

                open: function(id) {
                    var transition = self.get(id);

                    if (transition.opened && !transition.deferred.open) {
                        return $q.reject('Opening a transition for ' + id + ' while it is already opened');
                    }

                    if (config.forceSingle) {
                        if (openTransitionId && openTransitionId !== id) {
                            self.close(openTransitionId);
                        }
                        openTransitionId = id;
                    }

                    if (!transition.deferred.open) {
                        transition.deferred.open = $q.defer();
                    }

                    if (!transition.opened && transition.element) {
                        self.broadcast('beforeopen', id, transition.element, config.transitionCls);

                        transition.opened = true;

                        $animate.addClass(transition.element, config.transitionCls).then(function() {
                            transition.deferred.open.resolve();
                            transition.deferred.open = null;
                            self.broadcast('open', id, transition.element, config.transitionCls);
                        });
                    }

                    return transition.deferred.open.promise;
                },

                close: function(id) {
                    var transition = self.get(id);

                    if (!transition.opened && !transition.deferred.close) {
                        return $q.reject('Closing a transition for ' + id + ' while it is already closed');
                    }

                    if (config.forceSingle) {
                        if (openTransitionId && openTransitionId === id) {
                            openTransitionId = null;
                        }
                    }

                    if (!transition.deferred.close) {
                        transition.deferred.close = $q.defer();
                    }

                    if (transition.opened && transition.element) {
                        self.broadcast('beforeclose', id, transition.element, config.transitionCls);

                        transition.opened = false;

                        $animate.removeClass(transition.element, config.transitionCls).then(function() {
                            transition.deferred.close.resolve();
                            transition.deferred.close = null;
                            self.broadcast('close', id, transition.element, config.transitionCls);
                        });
                    }

                    return transition.deferred.close.promise;
                },

                on: function(eventName, id, callback) {
                    var transition = self.get(id),
                        listeners = transition && transition.listeners && transition.listeners[eventName];

                    if (listeners) {
                        listeners.push(callback);

                        return function() {
                            listeners.splice(listeners.indexOf(callback), 1);
                        };
                    }
                },

                broadcast: function(eventName, id) {
                    var transition = self.get(id),
                        listeners = transition && transition.listeners && transition.listeners[eventName];

                    if (listeners && listeners.length) {
                        listeners.forEach(function(listener) {
                            listener.apply(self, Array.prototype.slice.call(arguments, 1));
                        });
                    }
                }
            };

            return self;
        };

        var services = {};
        return function(name, config) {
            if (services[name] === undefined) {
                services[name] = new TransitionService(name, config);
            }
            return services[name];
        };
    }
]);
