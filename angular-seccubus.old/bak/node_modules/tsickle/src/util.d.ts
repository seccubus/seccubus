/// <amd-module name="tsickle/src/util" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
/**
 * Constructs a new ts.CompilerHost that overlays sources in substituteSource
 * over another ts.CompilerHost.
 *
 * @param substituteSource A map of source file name -> overlay source text.
 */
export declare function createSourceReplacingCompilerHost(substituteSource: Map<string, string>, delegate: ts.CompilerHost): ts.CompilerHost;
/**
 * Returns the input string with line endings normalized to '\n'.
 */
export declare function normalizeLineEndings(input: string): string;
/** @return true if node has the specified modifier flag set. */
export declare function hasModifierFlag(node: ts.Node, flag: ts.ModifierFlags): boolean;
export declare function isDtsFileName(fileName: string): boolean;
