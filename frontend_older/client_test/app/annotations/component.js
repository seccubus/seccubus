import angular from 'angular';
import {AppConfig} from '../config/app.config';

export class Component {
    constructor ({
        name,
        moduleName,
        moduleDependencies,
        componentServices,
        extendAnnotation
    }) {
        if (!name && !moduleName && AppConfig.debug) {
            throw new Error('Every annotation needs to have either a name or a moduleName');
        }

        this._name               = name;
        this._moduleName         = moduleName;

        this._componentServices  = componentServices;
        this._moduleDependencies = moduleDependencies;

        this.extendAnnotation    = extendAnnotation;
    }

    get name () {
        return this._name || this._moduleName || '';
    }

    get moduleName () {
        return this._moduleName || AppConfig.moduleName + '.' + this.name;
    }

    get controllerName () {
        return this.name + 'Controller';
    }

    get componentRouteName () {
        return this.name[0].toLowerCase() + this.name.slice(1);
    }

    get moduleDependencies () {
        return (this._moduleDependencies || AppConfig.moduleDependencies).filter(unique);
    }

    get componentServices () {
        return (this._componentServices || []).filter(unique);
    }

    get module () {
        if (!this._module) {
            if (this.cls) {
                if (AppConfig.debug) {
                    console.log(
                        'Registering module ' + this.moduleName +
                        ' and adding controller ' + this.controllerName +
                        ' to it with the following componentServices: ', this.componentServices,
                        ' and the following module dependencies: ', this.moduleDependencies
                    );
                }

                this._module = angular.module(this.moduleName, this.moduleDependencies)
                    .controller(this.controllerName, [...this.componentServices, this.cls]);
            }
            else if (AppConfig.debug) {
                throw new Error(
                    'Trying to create an angular module for ' + this.moduleName + ' thas has ' +
                    'not had it`s annotation registered with Component.register(cls)'
                );
            }
        }
        return this._module;
    }

    extendAnnotationOfClass (cls) {
        var parentCls = Object.getPrototypeOf(cls);
        var superAnnotation = parentCls.componentAnnotation;

        if (superAnnotation instanceof Component) {
            if (!Array.isArray(this._moduleDependencies)) {
                this._moduleDependencies = superAnnotation._moduleDependencies;
            }
            else if (Array.isArray(superAnnotation._moduleDependencies)) {
                this._moduleDependencies = this._moduleDependencies.concat(superAnnotation._moduleDependencies);
            }

            if (!Array.isArray(this._componentServices)) {
                this._componentServices = superAnnotation._componentServices;
            }
            else if (Array.isArray(superAnnotation._componentServices)) {
                this._componentServices = this._componentServices.concat(superAnnotation._componentServices);
            }
        }
        else if (AppConfig.debug) {
            console.warn(
                `Trying to extendAnnotationFromClass for ${this.name} while the parent class`,
                `has no componentAnnotation registered...`
            );
        }
    }

    static getAnnotation (cls) {
        if (cls.hasOwnProperty('componentAnnotation')) {
            return cls.componentAnnotation;
        }

        var annotations = cls.annotations;
        var componentAnnotation = Array.isArray(annotations) && annotations.filter((annotation) => {
            return annotation instanceof Component;
        }).pop();

        if (componentAnnotation) {
            if (componentAnnotation.extendAnnotation) {
                componentAnnotation.extendAnnotationOfClass(cls);
            }

            componentAnnotation.cls = cls;
            cls.componentAnnotation = componentAnnotation;

            return componentAnnotation;
        }
    }

    static getAngularModule (cls) {
        var annotation = Component.getAnnotation(cls);
        if (annotation) {
            return annotation.module;
        }
    }
}

function unique(value, index, self) {
    return self.indexOf(value) === index;
}
