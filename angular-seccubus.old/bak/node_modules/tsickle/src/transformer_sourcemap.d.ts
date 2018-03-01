/// <amd-module name="tsickle/src/transformer_sourcemap" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SourceMapper } from './source_map_utils';
import * as ts from './typescript';
/**
 * Creates a TypeScript transformer based on a source->text transformation.
 *
 * TypeScript transformers operate on AST nodes. Newly created nodes must be marked as replacing an
 * older AST node. This shim allows running a transformation step that's based on emitting new text
 * as a node based transformer. It achieves that by running the transformation, collecting a source
 * mapping in the process, and then afterwards parsing the source text into a new AST and marking
 * the new nodes as representations of the old nodes based on their source map positions.
 *
 * The process marks all nodes as synthesized except for a handful of special cases (identifiers
 * etc).
 */
export declare function createTransformerFromSourceMap(sourceBasedTransformer: (sourceFile: ts.SourceFile, sourceMapper: SourceMapper) => string): ts.TransformerFactory<ts.SourceFile>;
