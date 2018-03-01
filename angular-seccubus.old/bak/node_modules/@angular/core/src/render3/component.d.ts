/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di/injector';
import { ComponentRef as viewEngine_ComponentRef } from '../linker/component_factory';
import { ComponentDef, ComponentType } from './definition_interfaces';
import { RElement, RendererFactory3 } from './renderer';
/** Options that control how the component should be bootstrapped. */
export interface CreateComponentOptions {
    /** Which renderer factory to use. */
    rendererFactory?: RendererFactory3;
    /**
     * Host element on which the component will be bootstrapped. If not specified,
     * the component definition's `tag` is used to query the existing DOM for the
     * element to bootstrap.
     */
    host?: RElement | string;
    /** Module injector for the component. If unspecified, the injector will be NULL_INJECTOR. */
    injector?: Injector;
    /**
     * List of features to be applied to the created component. Features are simply
     * functions that decorate a component with a certain behavior.
     *
     * Example: PublicFeature is a function that makes the component public to the DI system.
     */
    features?: (<T>(component: T, componentDef: ComponentDef<T>) => void)[];
}
/**
 * Bootstraps a component, then creates and returns a `ComponentRef` for that component.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export declare function createComponentRef<T>(componentType: ComponentType<T>, opts: CreateComponentOptions): viewEngine_ComponentRef<T>;
export declare const NULL_INJECTOR: Injector;
/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export declare function renderComponent<T>(componentType: ComponentType<T>, opts?: CreateComponentOptions): T;
export declare function detectChanges<T>(component: T): void;
export declare function markDirty<T>(component: T, scheduler?: (fn: () => void) => void): void;
export declare function getHostElement<T>(component: T): RElement;
