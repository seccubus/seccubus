/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './ng_dev_mode';
import { ElementRef } from '../linker/element_ref';
import { TemplateRef } from '../linker/template_ref';
import { ViewContainerRef } from '../linker/view_container_ref';
import { Type } from '../type';
import { ContainerState, CssSelector, LContainer, LElement, LNode, LNodeFlags, LNodeInjector, LProjection, LView, ProjectionState, QueryReadType, ViewState } from './interfaces';
import { NgStaticData } from './l_node_static';
import { ComponentDef, ComponentTemplate, DirectiveDef } from './definition_interfaces';
import { InjectFlags } from './di';
import { QueryList } from './query';
import { RComment, RElement, RText, Renderer3, RendererFactory3 } from './renderer';
export { queryRefresh } from './query';
/**
 * Enum used by the lifecycle (l) instruction to determine which lifecycle hook is requesting
 * processing.
 */
export declare const enum LifecycleHook {
    ON_INIT = 1,
    ON_DESTROY = 2,
    ON_CHANGES = 4,
    AFTER_VIEW_INIT = 8,
    AFTER_VIEW_CHECKED = 16,
}
/**
 * Directive (D) sets a property on all component instances using this constant as a key and the
 * component's host node (LElement) as the value. This is used in methods like detectChanges to
 * facilitate jumping from an instance to the host node.
 */
export declare const NG_HOST_SYMBOL = "__ngHostLNode__";
/**
 * Swap the current state with a new state.
 *
 * For performance reasons we store the state in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the state for later, and when the view is
 * exited the state has to be restored
 *
 * @param newViewState New state to become active
 * @param host Element to which the View is a child of
 * @returns the previous state;
 */
export declare function enterView(newViewState: ViewState, host: LElement | LView | null): ViewState;
/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 */
export declare function leaveView(newViewState: ViewState): void;
export declare function createViewState(viewId: number, renderer: Renderer3, ngStaticData: NgStaticData): ViewState;
/**
 * A common way of creating the LNode to make sure that all of them have same shape to
 * keep the execution code monomorphic and fast.
 */
export declare function createLNode(index: number | null, type: LNodeFlags.Element, native: RElement | RText | null, viewState?: ViewState | null): LElement;
export declare function createLNode(index: null, type: LNodeFlags.View, native: null, viewState: ViewState): LView;
export declare function createLNode(index: number, type: LNodeFlags.Container, native: RComment, containerState: ContainerState): LContainer;
export declare function createLNode(index: number, type: LNodeFlags.Projection, native: null, projectionState: ProjectionState): LProjection;
/**
 *
 * @param host Existing node to render into.
 * @param template Template function with the instructions.
 * @param context to pass into the template.
 */
export declare function renderTemplate<T>(hostNode: RElement, template: ComponentTemplate<T>, context: T, providedRendererFactory: RendererFactory3, host: LElement | null): LElement;
export declare function renderComponentOrTemplate<T>(node: LElement, viewState: ViewState, componentOrContext: T, template?: ComponentTemplate<T>): void;
export declare function getOrCreateNodeInjector(): LNodeInjector;
/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param def The definition of the directive to be made public
 */
export declare function diPublic(def: DirectiveDef<any>): void;
/**
 * Searches for an instance of the given directive type up the injector tree and returns
 * that instance if found.
 *
 * If not found, it will propagate up to the next parent injector until the token
 * is found or the top is reached.
 *
 * Usage example (in factory function):
 *
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = defineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(inject(DirectiveA))
 *   });
 * }
 *
 * @param token The directive type to search for
 * @param flags Injection flags (e.g. CheckParent)
 * @returns The instance found
 */
export declare function inject<T>(token: Type<T>, flags?: InjectFlags): T;
/**
 * Creates an ElementRef and stores it on the injector.
 * Or, if the ElementRef already exists, retrieves the existing ElementRef.
 *
 * @returns The ElementRef instance to use
 */
export declare function injectElementRef(): ElementRef;
/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @returns The TemplateRef instance to use
 */
export declare function injectTemplateRef<T>(): TemplateRef<T>;
/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export declare function injectViewContainerRef(): ViewContainerRef;
/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the data array
 * @param nameOrComponentDef Name of the DOM Node or `ComponentDef`.
 * @param attrs Statically bound set of attributes to be written into the DOM element on creation.
 * @param localName A name under which a given element is exported.
 *
 * Attributes are passed as an array of strings where elements with an even index hold an attribute
 * name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 */
export declare function elementStart(index: number, nameOrComponentDef?: string | ComponentDef<any>, attrs?: string[] | null, localName?: string): RElement;
export declare function createError(text: string, token: any): Error;
/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param elementOrSelector Render element or CSS selector to locate the element.
 */
export declare function locateHostElement(factory: RendererFactory3, elementOrSelector: RElement | string): RElement | null;
/**
 * Creates the host LNode..
 *
 * @param rNode Render host element.
 */
export declare function hostElement(rNode: RElement | null, def: ComponentDef<any>): void;
/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listener The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener.
 */
export declare function listener(eventName: string, listener: EventListener, useCapture?: boolean): void;
/** Mark the end of the element. */
export declare function elementEnd(): void;
/**
 * Update an attribute on an Element. This is used with a `bind` instruction.
 *
 * @param index The index of the element to update in the data array
 * @param attrName Name of attribute. Because it is going to DOM, this is not subject to
 *        renaming as port of minification.
 * @param value Value to write. This value will go through stringification.
 */
export declare function elementAttribute(index: number, attrName: string, value: any): void;
/**
 * Update a property on an Element.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new @Inputs don't have to be re-compiled.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 */
export declare function elementProperty<T>(index: number, propName: string, value: T | NO_CHANGE): void;
/**
 * Add or remove a class in a classList.
 *
 * This instruction is meant to handle the [class.foo]="exp" case
 *
 * @param index The index of the element to update in the data array
 * @param className Name of class to toggle. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value A value indicating if a given class should be added or removed.
 */
export declare function elementClass<T>(index: number, className: string, value: T | NO_CHANGE): void;
/**
 * Update a given style on an Element.
 *
 * @param index Index of the element to change in the data array
 * @param styleName Name of property. Because it is going to DOM this is not subject to
 *        renaming as part of minification.
 * @param value New value to write (null to remove).
 * @param suffix Suffix to add to style's value (optional).
 */
export declare function elementStyle<T>(index: number, styleName: string, value: T | NO_CHANGE, suffix?: string): void;
/**
 * Create static text node
 *
 * @param index Index of the node in the data array.
 * @param value Value to write. This value will be stringified.
 *   If value is not provided than the actual creation of the text node is delayed.
 */
export declare function text(index: number, value?: any): void;
/**
 * Create text node with binding
 * Bindings should be handled externally with the proper bind(1-8) method
 *
 * @param index Index of the node in the data array.
 * @param value Stringified value to write.
 */
export declare function textBinding<T>(index: number, value: T | NO_CHANGE): void;
/**
 * Create or retrieve the directive.
 *
 * NOTE: directives can be created in order other than the index order. They can also
 *       be retrieved before they are created in which case the value will be null.
 *
 * @param index Each directive in a `View` will have a unique index. Directives can
 *        be created or retrieved out of order.
 * @param directive The directive instance.
 * @param directiveDef DirectiveDef object which contains information about the template.
 */
export declare function directive<T>(index: number): T;
export declare function directive<T>(index: number, directive: T, directiveDef: DirectiveDef<T>, localName?: string): T;
/**
 * Accepts a lifecycle hook type and determines when and how the related lifecycle hook
 * callback should run.
 *
 * For the onInit lifecycle hook, it will return whether or not the ngOnInit() function
 * should run. If so, ngOnInit() will be called outside of this function.
 *
 * e.g. l(LifecycleHook.ON_INIT) && ctx.ngOnInit();
 *
 * For the onDestroy lifecycle hook, this instruction also accepts an onDestroy
 * method that should be stored and called internally when the parent view is being
 * cleaned up.
 *
 * e.g.  l(LifecycleHook.ON_DESTROY, ctx, ctx.onDestroy);
 *
 * @param lifecycle
 * @param self
 * @param method
 */
export declare function lifecycle(lifecycle: LifecycleHook.ON_DESTROY, self: any, method: Function): void;
export declare function lifecycle(lifecycle: LifecycleHook.AFTER_VIEW_INIT, self: any, method: Function): void;
export declare function lifecycle(lifecycle: LifecycleHook.AFTER_VIEW_CHECKED, self: any, method: Function): void;
export declare function lifecycle(lifecycle: LifecycleHook): boolean;
/** Iterates over view hook functions and calls them. */
export declare function executeViewHooks(): void;
/**
 * Creates an LContainer.
 *
 * Only `LView`s can go into `LContainer`.
 *
 * @param index The index of the container in the data array
 * @param template Optional inline template
 * @param tagName The name of the container element, if applicable
 * @param attrs The attrs attached to the container, if applicable
 */
export declare function containerStart(index: number, template?: ComponentTemplate<any>, tagName?: string, attrs?: string[], localName?: string): void;
export declare function containerEnd(): void;
/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 */
export declare function containerRefreshStart(index: number): void;
/**
 * Marks the end of the LContainer.
 *
 * Marking the end of ViewContainer is the time when to child Views get inserted or removed.
 */
export declare function containerRefreshEnd(): void;
/**
 * Creates an LView.
 *
 * @param viewBlockId The ID of this view
 * @return Whether or not this view is in creation mode
 */
export declare function viewStart(viewBlockId: number): boolean;
/** Marks the end of the LView. */
export declare function viewEnd(): void;
/**
 * Refreshes the component view.
 *
 * In other words, enters the component's view and processes it to update bindings, queries, etc.
 *
 * @param directiveIndex
 * @param elementIndex
 * @param template
 */
export declare const componentRefresh: <T>(directiveIndex: number, elementIndex: number, template: ComponentTemplate<T>) => void;
/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * @param selectors
 */
export declare function projectionDef(selectors?: CssSelector[]): LNode[][];
/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex
 * @param localIndex - index under which distribution of projected nodes was memorized
 * @param selectorIndex - 0 means <ng-content> without any selector
 */
export declare function projection(nodeIndex: number, localIndex: number, selectorIndex?: number): void;
/**
 * Adds a ViewState or a ContainerState to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param state The ViewState or ContainerState to add to the view tree
 * @returns The state passed in
 */
export declare function addToViewTree<T extends ViewState | ContainerState>(state: T): T;
export interface NO_CHANGE {
    brand: 'NO_CHANGE';
}
/** A special value which designates that a value has not changed. */
export declare const NO_CHANGE: NO_CHANGE;
/**
 * Create interpolation bindings with variable number of arguments.
 *
 * If any of the arguments change, then the interpolation is concatenated
 * and causes an update.
 *
 * @param values an array of values to diff.
 */
export declare function bindV(values: any[]): string | NO_CHANGE;
/**
 * Create a single value binding without interpolation.
 *
 * @param value Value to diff
 */
export declare function bind<T>(value: T | NO_CHANGE): T | NO_CHANGE;
/**
 * Create an interpolation bindings with 1 arguments.
 *
 * @param prefix static value used for concatenation only.
 * @param value value checked for change.
 * @param suffix static value used for concatenation only.
 */
export declare function bind1(prefix: string, value: any, suffix: string): string | NO_CHANGE;
/**
 * Create an interpolation bindings with 2 arguments.
 *
 * @param prefix
 * @param v0 value checked for change
 * @param i0
 * @param v1 value checked for change
 * @param suffix
 */
export declare function bind2(prefix: string, v0: any, i0: string, v1: any, suffix: string): string | NO_CHANGE;
/**
 * Create an interpolation bindings with 3 arguments.
 *
 * @param prefix
 * @param v0
 * @param i0
 * @param v1
 * @param i1
 * @param v2
 * @param suffix
 */
export declare function bind3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string | NO_CHANGE;
/**
 * Create an interpolation binding with 4 arguments.
 *
 * @param prefix
 * @param v0
 * @param i0
 * @param v1
 * @param i1
 * @param v2
 * @param i2
 * @param v3
 * @param suffix
 */
export declare function bind4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): string | NO_CHANGE;
/**
 * Create an interpolation binding with 5 arguments.
 *
 * @param prefix
 * @param v0
 * @param i0
 * @param v1
 * @param i1
 * @param v2
 * @param i2
 * @param v3
 * @param i3
 * @param v4
 * @param suffix
 */
export declare function bind5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): string | NO_CHANGE;
/**
 * Create an interpolation binding with 6 arguments.
 *
 * @param prefix
 * @param v0
 * @param i0
 * @param v1
 * @param i1
 * @param v2
 * @param i2
 * @param v3
 * @param i3
 * @param v4
 * @param i4
 * @param v5
 * @param suffix
 */
export declare function bind6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): string | NO_CHANGE;
/**
 * Create an interpolation binding with 7 arguments.
 *
 * @param prefix
 * @param v0
 * @param i0
 * @param v1
 * @param i1
 * @param v2
 * @param i2
 * @param v3
 * @param i3
 * @param v4
 * @param i4
 * @param v5
 * @param i5
 * @param v6
 * @param suffix
 */
export declare function bind7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string | NO_CHANGE;
/**
 * Create an interpolation binding with 8 arguments.
 *
 * @param prefix
 * @param v0
 * @param i0
 * @param v1
 * @param i1
 * @param v2
 * @param i2
 * @param v3
 * @param i3
 * @param v4
 * @param i4
 * @param v5
 * @param i5
 * @param v6
 * @param i6
 * @param v7
 * @param suffix
 */
export declare function bind8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): string | NO_CHANGE;
export declare function memory<T>(index: number, value?: T): T;
export declare function query<T>(predicate: Type<any> | string[], descend?: boolean, read?: QueryReadType | Type<T>): QueryList<T>;
