/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
* Must use this method for CD (instead of === ) since NaN !== NaN
*/
export declare function isDifferent(a: any, b: any): boolean;
export declare function stringify(value: any): string;
/**
 *  Function that throws a "not implemented" error so it's clear certain
 *  behaviors/methods aren't yet ready.
 *
 * @returns Not implemented error
 */
export declare function notImplemented(): Error;
