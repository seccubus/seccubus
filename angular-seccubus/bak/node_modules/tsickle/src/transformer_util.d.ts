/// <amd-module name="tsickle/src/transformer_util" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from './typescript';
/**
 * Adjusts the given CustomTransformers with additional transformers
 * to fix bugs in TypeScript.
 */
export declare function createCustomTransformers(given: ts.CustomTransformers): ts.CustomTransformers;
/**
 * Convert comment text ranges before and after a node
 * into ts.SynthesizedComments for the node and prevent the
 * comment text ranges to be emitted, to allow
 * changing these comments.
 *
 * This function takes a visitor to be able to do some
 * state management after the caller is done changing a node.
 */
export declare function visitNodeWithSynthesizedComments<T extends ts.Node>(context: ts.TransformationContext, sourceFile: ts.SourceFile, node: T, visitor: (node: T) => T): T;
/**
 * Creates a non emitted statement that can be used to store synthesized comments.
 */
export declare function createNotEmittedStatement(sourceFile: ts.SourceFile): ts.NotEmittedStatement;
/**
 * This is a version of `ts.visitEachChild` that works that calls our version
 * of `updateSourceFileNode`, so that typescript doesn't lose type information
 * for property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 *
 * @param sf
 * @param statements
 */
export declare function visitEachChild(node: ts.Node, visitor: ts.Visitor, context: ts.TransformationContext): ts.Node;
/**
 * This is a version of `ts.updateSourceFileNode` that works
 * well with property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 * TODO(#634): This has been fixed in TS 2.5. Investigate removal.
 *
 * @param sf
 * @param statements
 */
export declare function updateSourceFileNode(sf: ts.SourceFile, statements: ts.NodeArray<ts.Statement>): ts.SourceFile;
export declare function isTypeNodeKind(kind: ts.SyntaxKind): boolean;
