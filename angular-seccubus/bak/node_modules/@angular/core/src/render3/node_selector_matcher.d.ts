/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './ng_dev_mode';
import { CssSelector, CssSelectorWithNegations, SimpleCssSelector } from './interfaces';
import { LNodeStatic } from './l_node_static';
/**
 * A utility function to match an Ivy node static data against a simple CSS selector
 *
 * @param node static data to match
 * @param selector
 * @returns true if node matches the selector.
 */
export declare function isNodeMatchingSimpleSelector(lNodeStaticData: LNodeStatic, selector: SimpleCssSelector): boolean;
export declare function isNodeMatchingSelectorWithNegations(lNodeStaticData: LNodeStatic, selector: CssSelectorWithNegations): boolean;
export declare function isNodeMatchingSelector(lNodeStaticData: LNodeStatic, selector: CssSelector): boolean;
