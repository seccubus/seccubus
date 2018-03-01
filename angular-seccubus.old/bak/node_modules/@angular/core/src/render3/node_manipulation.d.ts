import { LContainer, LElement, LNode, LText, LView, ProjectionState, ViewOrContainerState, ViewState } from './interfaces';
import { RNode } from './renderer';
/**
 * Finds the closest DOM node above a given container in the hierarchy.
 *
 * This is necessary to add or remove elements from the DOM when a view
 * is added or removed from the container. e.g. parent.removeChild(...)
 *
 * @param containerNode The container node whose parent must be found
 * @returns Closest DOM node above the container
 */
export declare function findNativeParent(containerNode: LContainer): RNode | null;
/**
 * Adds or removes all DOM elements associated with a view.
 *
 * Because some root nodes of the view may be containers, we sometimes need
 * to propagate deeply into the nested containers to remove all elements in the
 * views beneath it.
 *
 * @param container The container to which the root view belongs
 * @param rootNode The view from which elements should be added or removed
 * @param insertMode Whether or not elements should be added (if false, removing)
 * @param beforeNode The node before which elements should be added, if insert mode
 */
export declare function addRemoveViewFromContainer(container: LContainer, rootNode: LView, insertMode: true, beforeNode: RNode | null): void;
export declare function addRemoveViewFromContainer(container: LContainer, rootNode: LView, insertMode: false): void;
/**
 * Traverses the tree of component views and containers to remove listeners and
 * call onDestroy callbacks.
 *
 * Notes:
 *  - Because it's used for onDestroy calls, it needs to be bottom-up.
 *  - Must process containers instead of their views to avoid splicing
 *  when views are destroyed and re-added.
 *  - Using a while loop because it's faster than recursion
 *  - Destroy only called on movement to sibling or movement to parent (laterally or up)
 *
 *  @param rootView The view to destroy
 */
export declare function destroyViewTree(rootView: ViewState): void;
/**
 * Inserts a view into a container.
 *
 * This adds the view to the container's array of active views in the correct
 * position. It also adds the view's elements to the DOM if the container isn't a
 * root node of another view (in that case, the view's elements will be added when
 * the container's parent view is added later).
 *
 * @param container The container into which the view should be inserted
 * @param newView The view to insert
 * @param index The index at which to insert the view
 * @returns The inserted view
 */
export declare function insertView(container: LContainer, newView: LView, index: number): LView;
/**
 * Removes a view from a container.
 *
 * This method splices the view from the container's array of active views. It also
 * removes the view's elements from the DOM and conducts cleanup (e.g. removing
 * listeners, calling onDestroys).
 *
 * @param container The container from which to remove a view
 * @param removeIndex The index of the view to remove
 * @returns The removed view
 */
export declare function removeView(container: LContainer, removeIndex: number): LView;
/**
 * Sets a next on the view node, so views in for loops can easily jump from
 * one view to the next to add/remove elements. Also adds the ViewState (view.data)
 * to the view tree for easy traversal when cleaning up the view.
 *
 * @param view The view to set up
 * @param next The view's new next
 */
export declare function setViewNext(view: LView, next: LView | null): void;
/**
 * Determines which ViewOrContainerState to jump to when traversing back up the
 * tree in destroyViewTree.
 *
 * Normally, the view's parent ViewState should be checked, but in the case of
 * embedded views, the container (which is the view node's parent, but not the
 * ViewState's parent) needs to be checked for a possible next property.
 *
 * @param state The ViewOrContainerState for which we need a parent state
 * @param rootView The rootView, so we don't propagate too far up the view tree
 * @returns The correct parent ViewOrContainerState
 */
export declare function getParentState(state: ViewOrContainerState, rootView: ViewState): ViewOrContainerState | null;
/**
 * Appends the provided child element to the provided parent, if appropriate.
 *
 * If the parent is a view, the element will be appended as part of viewEnd(), so
 * the element should not be appended now. Similarly, if the child is a content child
 * of a parent component, the child will be appended to the right position later by
 * the content projection system. Otherwise, append normally.
 *
 * @param parent The parent to which to append the child
 * @param child The child that should be appended
 * @param currentView The current view's ViewState
 * @returns Whether or not the child was appended
 */
export declare function appendChild(parent: LNode, child: RNode | null, currentView: ViewState): boolean;
/**
 * Inserts the provided node before the correct element in the DOM, if appropriate.
 *
 * If the parent is a view, the element will be inserted as part of viewEnd(), so
 * the element should not be inserted now. Similarly, if the child is a content child
 * of a parent component, the child will be inserted to the right position later by
 * the content projection system. Otherwise, insertBefore normally.
 *
 * @param node Node to insert
 * @param currentView The current view's ViewState
 */
export declare function insertChild(node: LNode, currentView: ViewState): void;
/**
 * Appends a projected node to the DOM, or in the case of a projected container,
 * appends the nodes from all of the container's active views to the DOM. Also stores the
 * node in the given projectedNodes array.
 *
 * @param projectedNodes Array to store the projected node
 * @param node The node to process
 * @param currentParent The last parent element to be processed
 * @param currentView The current view's ViewState
 */
export declare function processProjectedNode(projectedNodes: ProjectionState, node: LElement | LText | LContainer, currentParent: LView | LElement, currentView: ViewState): void;
