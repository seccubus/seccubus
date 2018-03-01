/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/transformer_sourcemap", ["require", "exports", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
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
    function createTransformerFromSourceMap(sourceBasedTransformer) {
        return function (context) { return function (sourceFile) {
            var sourceMapper = new NodeSourceMapper();
            var transformedSourceText = sourceBasedTransformer(sourceFile, sourceMapper);
            var newFile = ts.createSourceFile(sourceFile.fileName, transformedSourceText, ts.ScriptTarget.Latest, true);
            var mappedFile = visitNode(newFile);
            return transformer_util_1.updateSourceFileNode(sourceFile, mappedFile.statements);
            function visitNode(node) {
                return transformer_util_1.visitNodeWithSynthesizedComments(context, newFile, node, visitNodeImpl);
            }
            function visitNodeImpl(node) {
                if (node.flags & ts.NodeFlags.Synthesized) {
                    return node;
                }
                var originalNode = sourceMapper.getOriginalNode(node);
                // Use the originalNode for:
                // - literals: as e.g. typescript does not support synthetic regex literals
                // - identifiers: as they don't have children and behave well
                //    regarding comment synthesization
                // - types: as they are not emited anyways
                //          and it leads to errors with `extends` cases.
                // - imports/exports: as TypeScript will only attempt to elide type only
                //                    imports if the new node is identical to the original node.
                if (originalNode) {
                    if (isLiteralKind(node.kind) || node.kind === ts.SyntaxKind.Identifier ||
                        transformer_util_1.isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature) {
                        return originalNode;
                    }
                    if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                        node.kind === ts.SyntaxKind.ImportEqualsDeclaration ||
                        node.kind === ts.SyntaxKind.ExportAssignment) {
                        return originalNode;
                    }
                    if (ts.isExportDeclaration(node)) {
                        // Return the original nodes for export declarations, unless they were expanded from an
                        // export * to specific exported symbols.
                        var originalExport = originalNode;
                        if (!node.moduleSpecifier) {
                            // export {a, b, c};
                            return originalNode;
                        }
                        if (!!originalExport.exportClause === !!node.exportClause) {
                            // This already was exported with symbols (export {...}) or was not expanded.
                            return originalNode;
                        }
                        // Rewrote export * -> export {...}, the export declaration must be emitted in the updated
                        // form.
                    }
                }
                node = ts.visitEachChild(node, visitNode, context);
                node.flags |= ts.NodeFlags.Synthesized;
                node.parent = undefined;
                ts.setTextRange(node, originalNode ? originalNode : { pos: -1, end: -1 });
                ts.setOriginalNode(node, originalNode);
                // Loop over all nested ts.NodeArrays /
                // ts.Nodes that were not visited and set their
                // text range to -1 to not emit their whitespace.
                // Sadly, TypeScript does not have an API for this...
                // tslint:disable-next-line:no-any To read all properties
                var nodeAny = node;
                // tslint:disable-next-line:no-any To read all properties
                var originalNodeAny = originalNode;
                for (var prop in nodeAny) {
                    if (nodeAny.hasOwnProperty(prop)) {
                        // tslint:disable-next-line:no-any
                        var value = nodeAny[prop];
                        if (isNodeArray(value)) {
                            // reset the pos/end of all NodeArrays so that we don't emit comments
                            // from them.
                            ts.setTextRange(value, { pos: -1, end: -1 });
                        }
                        else if (isToken(value) && !(value.flags & ts.NodeFlags.Synthesized) &&
                            value.getSourceFile() !== sourceFile) {
                            // Use the original TextRange for all non visited tokens (e.g. the
                            // `BinaryExpression.operatorToken`) to preserve the formatting
                            var textRange = originalNode ? originalNodeAny[prop] : { pos: -1, end: -1 };
                            ts.setTextRange(value, textRange);
                        }
                    }
                }
                return node;
            }
        }; };
    }
    exports.createTransformerFromSourceMap = createTransformerFromSourceMap;
    /**
     * Implementation of the `SourceMapper` that stores and retrieves mappings
     * to original nodes.
     */
    var NodeSourceMapper = /** @class */ (function () {
        function NodeSourceMapper() {
            this.originalNodeByGeneratedRange = new Map();
            this.genStartPositions = new Map();
            /** Conceptual offset for all nodes in this mapping. */
            this.offset = 0;
        }
        NodeSourceMapper.prototype.addFullNodeRange = function (node, genStartPos) {
            var _this = this;
            this.originalNodeByGeneratedRange.set(this.nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())), node);
            node.forEachChild(function (child) { return _this.addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())); });
        };
        NodeSourceMapper.prototype.shiftByOffset = function (offset) {
            this.offset += offset;
        };
        NodeSourceMapper.prototype.addMapping = function (originalNode, original, generated, length) {
            var _this = this;
            var originalStartPos = original.position;
            var genStartPos = generated.position;
            if (originalStartPos >= originalNode.getFullStart() &&
                originalStartPos <= originalNode.getStart()) {
                // always use the node.getStart() for the index,
                // as comments and whitespaces might differ between the original and transformed code.
                var diffToStart = originalNode.getStart() - originalStartPos;
                originalStartPos += diffToStart;
                genStartPos += diffToStart;
                length -= diffToStart;
                this.genStartPositions.set(originalNode, genStartPos);
            }
            if (originalStartPos + length === originalNode.getEnd()) {
                this.originalNodeByGeneratedRange.set(this.nodeCacheKey(originalNode.kind, this.genStartPositions.get(originalNode), genStartPos + length), originalNode);
            }
            originalNode.forEachChild(function (child) {
                if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
                    _this.addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
                }
            });
        };
        /** For the newly parsed `node`, find what node corresponded to it in the original source text. */
        NodeSourceMapper.prototype.getOriginalNode = function (node) {
            // Apply the offset: if there is an offset > 0, all nodes are conceptually shifted by so many
            // characters from the start of the file.
            var start = node.getStart() - this.offset;
            if (start < 0) {
                // Special case: the source file conceptually spans all of the file, including any added
                // prefix added that causes offset to be set.
                if (node.kind !== ts.SyntaxKind.SourceFile) {
                    // Nodes within [0, offset] of the new file (start < 0) is the additional prefix that has no
                    // corresponding nodes in the original source, so return undefined.
                    return undefined;
                }
                start = 0;
            }
            var end = node.getEnd() - this.offset;
            var key = this.nodeCacheKey(node.kind, start, end);
            return this.originalNodeByGeneratedRange.get(key);
        };
        NodeSourceMapper.prototype.nodeCacheKey = function (kind, start, end) {
            return kind + "#" + start + "#" + end;
        };
        return NodeSourceMapper;
    }());
    // tslint:disable-next-line:no-any
    function isNodeArray(value) {
        var anyValue = value;
        return Array.isArray(value) && anyValue.pos !== undefined && anyValue.end !== undefined;
    }
    // tslint:disable-next-line:no-any
    function isToken(value) {
        return value != null && typeof value === 'object' && value.kind >= ts.SyntaxKind.FirstToken &&
            value.kind <= ts.SyntaxKind.LastToken;
    }
    // Copied from TypeScript
    function isLiteralKind(kind) {
        return ts.SyntaxKind.FirstLiteralToken <= kind && kind <= ts.SyntaxKind.LastLiteralToken;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXJfc291cmNlbWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RyYW5zZm9ybWVyX3NvdXJjZW1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILGlFQUEwRztJQUMxRywyQ0FBbUM7SUFFbkM7Ozs7Ozs7Ozs7O09BV0c7SUFDSCx3Q0FDSSxzQkFDVTtRQUNaLE1BQU0sQ0FBQyxVQUFDLE9BQU8sSUFBSyxPQUFBLFVBQUMsVUFBVTtZQUM3QixJQUFNLFlBQVksR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDNUMsSUFBTSxxQkFBcUIsR0FBRyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDL0UsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUMvQixVQUFVLENBQUMsUUFBUSxFQUFFLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlFLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsdUNBQW9CLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUvRCxtQkFBc0MsSUFBTztnQkFDM0MsTUFBTSxDQUFDLG1EQUFnQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBTSxDQUFDO1lBQ3RGLENBQUM7WUFFRCx1QkFBdUIsSUFBYTtnQkFDbEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFDRCxJQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxD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LENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO0lBQzNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U291cmNlTWFwcGVyLCBTb3VyY2VQb3NpdGlvbn0gZnJvbSAnLi9zb3VyY2VfbWFwX3V0aWxzJztcbmltcG9ydCB7aXNUeXBlTm9kZUtpbmQsIHVwZGF0ZVNvdXJjZUZpbGVOb2RlLCB2aXNpdE5vZGVXaXRoU3ludGhlc2l6ZWRDb21tZW50c30gZnJvbSAnLi90cmFuc2Zvcm1lcl91dGlsJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIFR5cGVTY3JpcHQgdHJhbnNmb3JtZXIgYmFzZWQgb24gYSBzb3VyY2UtPnRleHQgdHJhbnNmb3JtYXRpb24uXG4gKlxuICogVHlwZVNjcmlwdCB0cmFuc2Zvcm1lcnMgb3BlcmF0ZSBvbiBBU1Qgbm9kZXMuIE5ld2x5IGNyZWF0ZWQgbm9kZXMgbXVzdCBiZSBtYXJrZWQgYXMgcmVwbGFjaW5nIGFuXG4gKiBvbGRlciBBU1Qgbm9kZS4gVGhpcyBzaGltIGFsbG93cyBydW5uaW5nIGEgdHJhbnNmb3JtYXRpb24gc3RlcCB0aGF0J3MgYmFzZWQgb24gZW1pdHRpbmcgbmV3IHRleHRcbiAqIGFzIGEgbm9kZSBiYXNlZCB0cmFuc2Zvcm1lci4gSXQgYWNoaWV2ZXMgdGhhdCBieSBydW5uaW5nIHRoZSB0cmFuc2Zvcm1hdGlvbiwgY29sbGVjdGluZyBhIHNvdXJjZVxuICogbWFwcGluZyBpbiB0aGUgcHJvY2VzcywgYW5kIHRoZW4gYWZ0ZXJ3YXJkcyBwYXJzaW5nIHRoZSBzb3VyY2UgdGV4dCBpbnRvIGEgbmV3IEFTVCBhbmQgbWFya2luZ1xuICogdGhlIG5ldyBub2RlcyBhcyByZXByZXNlbnRhdGlvbnMgb2YgdGhlIG9sZCBub2RlcyBiYXNlZCBvbiB0aGVpciBzb3VyY2UgbWFwIHBvc2l0aW9ucy5cbiAqXG4gKiBUaGUgcHJvY2VzcyBtYXJrcyBhbGwgbm9kZXMgYXMgc3ludGhlc2l6ZWQgZXhjZXB0IGZvciBhIGhhbmRmdWwgb2Ygc3BlY2lhbCBjYXNlcyAoaWRlbnRpZmllcnNcbiAqIGV0YykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFuc2Zvcm1lckZyb21Tb3VyY2VNYXAoXG4gICAgc291cmNlQmFzZWRUcmFuc2Zvcm1lcjogKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHNvdXJjZU1hcHBlcjogU291cmNlTWFwcGVyKSA9PlxuICAgICAgICBzdHJpbmcpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQpID0+IChzb3VyY2VGaWxlKSA9PiB7XG4gICAgY29uc3Qgc291cmNlTWFwcGVyID0gbmV3IE5vZGVTb3VyY2VNYXBwZXIoKTtcbiAgICBjb25zdCB0cmFuc2Zvcm1lZFNvdXJjZVRleHQgPSBzb3VyY2VCYXNlZFRyYW5zZm9ybWVyKHNvdXJjZUZpbGUsIHNvdXJjZU1hcHBlcik7XG4gICAgY29uc3QgbmV3RmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIHNvdXJjZUZpbGUuZmlsZU5hbWUsIHRyYW5zZm9ybWVkU291cmNlVGV4dCwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSk7XG4gICAgY29uc3QgbWFwcGVkRmlsZSA9IHZpc2l0Tm9kZShuZXdGaWxlKTtcbiAgICByZXR1cm4gdXBkYXRlU291cmNlRmlsZU5vZGUoc291cmNlRmlsZSwgbWFwcGVkRmlsZS5zdGF0ZW1lbnRzKTtcblxuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZTxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCk6IFQge1xuICAgICAgcmV0dXJuIHZpc2l0Tm9kZVdpdGhTeW50aGVzaXplZENvbW1lbnRzKGNvbnRleHQsIG5ld0ZpbGUsIG5vZGUsIHZpc2l0Tm9kZUltcGwpIGFzIFQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXROb2RlSW1wbChub2RlOiB0cy5Ob2RlKSB7XG4gICAgICBpZiAobm9kZS5mbGFncyAmIHRzLk5vZGVGbGFncy5TeW50aGVzaXplZCkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9yaWdpbmFsTm9kZSA9IHNvdXJjZU1hcHBlci5nZXRPcmlnaW5hbE5vZGUobm9kZSk7XG5cbiAgICAgIC8vIFVzZSB0aGUgb3JpZ2luYWxOb2RlIGZvcjpcbiAgICAgIC8vIC0gbGl0ZXJhbHM6IGFzIGUuZy4gdHlwZXNjcmlwdCBkb2VzIG5vdCBzdXBwb3J0IHN5bnRoZXRpYyByZWdleCBsaXRlcmFsc1xuICAgICAgLy8gLSBpZGVudGlmaWVyczogYXMgdGhleSBkb24ndCBoYXZlIGNoaWxkcmVuIGFuZCBiZWhhdmUgd2VsbFxuICAgICAgLy8gICAgcmVnYXJkaW5nIGNvbW1lbnQgc3ludGhlc2l6YXRpb25cbiAgICAgIC8vIC0gdHlwZXM6IGFzIHRoZXkgYXJlIG5vdCBlbWl0ZWQgYW55d2F5c1xuICAgICAgLy8gICAgICAgICAgYW5kIGl0IGxlYWRzIHRvIGVycm9ycyB3aXRoIGBleHRlbmRzYCBjYXNlcy5cbiAgICAgIC8vIC0gaW1wb3J0cy9leHBvcnRzOiBhcyBUeXBlU2NyaXB0IHdpbGwgb25seSBhdHRlbXB0IHRvIGVsaWRlIHR5cGUgb25seVxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGltcG9ydHMgaWYgdGhlIG5ldyBub2RlIGlzIGlkZW50aWNhbCB0byB0aGUgb3JpZ2luYWwgbm9kZS5cbiAgICAgIGlmIChvcmlnaW5hbE5vZGUpIHtcbiAgICAgICAgaWYgKGlzTGl0ZXJhbEtpbmQobm9kZS5raW5kKSB8fCBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllciB8fFxuICAgICAgICAgICAgaXNUeXBlTm9kZUtpbmQobm9kZS5raW5kKSB8fCBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW5kZXhTaWduYXR1cmUpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxOb2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW1wb3J0RGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnRFcXVhbHNEZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydEFzc2lnbm1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxOb2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cy5pc0V4cG9ydERlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICAgICAgLy8gUmV0dXJuIHRoZSBvcmlnaW5hbCBub2RlcyBmb3IgZXhwb3J0IGRlY2xhcmF0aW9ucywgdW5sZXNzIHRoZXkgd2VyZSBleHBhbmRlZCBmcm9tIGFuXG4gICAgICAgICAgLy8gZXhwb3J0ICogdG8gc3BlY2lmaWMgZXhwb3J0ZWQgc3ltYm9scy5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbEV4cG9ydCA9IG9yaWdpbmFsTm9kZSBhcyB0cy5FeHBvcnREZWNsYXJhdGlvbjtcbiAgICAgICAgICBpZiAoIW5vZGUubW9kdWxlU3BlY2lmaWVyKSB7XG4gICAgICAgICAgICAvLyBleHBvcnQge2EsIGIsIGN9O1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTm9kZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhb3JpZ2luYWxFeHBvcnQuZXhwb3J0Q2xhdXNlID09PSAhIW5vZGUuZXhwb3J0Q2xhdXNlKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGFscmVhZHkgd2FzIGV4cG9ydGVkIHdpdGggc3ltYm9scyAoZXhwb3J0IHsuLi59KSBvciB3YXMgbm90IGV4cGFuZGVkLlxuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTm9kZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmV3cm90ZSBleHBvcnQgKiAtPiBleHBvcnQgey4uLn0sIHRoZSBleHBvcnQgZGVjbGFyYXRpb24gbXVzdCBiZSBlbWl0dGVkIGluIHRoZSB1cGRhdGVkXG4gICAgICAgICAgLy8gZm9ybS5cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZSA9IHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0Tm9kZSwgY29udGV4dCk7XG5cbiAgICAgIG5vZGUuZmxhZ3MgfD0gdHMuTm9kZUZsYWdzLlN5bnRoZXNpemVkO1xuICAgICAgbm9kZS5wYXJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0cy5zZXRUZXh0UmFuZ2Uobm9kZSwgb3JpZ2luYWxOb2RlID8gb3JpZ2luYWxOb2RlIDoge3BvczogLTEsIGVuZDogLTF9KTtcbiAgICAgIHRzLnNldE9yaWdpbmFsTm9kZShub2RlLCBvcmlnaW5hbE5vZGUpO1xuXG4gICAgICAvLyBMb29wIG92ZXIgYWxsIG5lc3RlZCB0cy5Ob2RlQXJyYXlzIC9cbiAgICAgIC8vIHRzLk5vZGVzIHRoYXQgd2VyZSBub3QgdmlzaXRlZCBhbmQgc2V0IHRoZWlyXG4gICAgICAvLyB0ZXh0IHJhbmdlIHRvIC0xIHRvIG5vdCBlbWl0IHRoZWlyIHdoaXRlc3BhY2UuXG4gICAgICAvLyBTYWRseSwgVHlwZVNjcmlwdCBkb2VzIG5vdCBoYXZlIGFuIEFQSSBmb3IgdGhpcy4uLlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueSBUbyByZWFkIGFsbCBwcm9wZXJ0aWVzXG4gICAgICBjb25zdCBub2RlQW55ID0gbm9kZSBhcyB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnkgVG8gcmVhZCBhbGwgcHJvcGVydGllc1xuICAgICAgY29uc3Qgb3JpZ2luYWxOb2RlQW55ID0gb3JpZ2luYWxOb2RlIGFzIHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIG5vZGVBbnkpIHtcbiAgICAgICAgaWYgKG5vZGVBbnkuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBub2RlQW55W3Byb3BdO1xuICAgICAgICAgIGlmIChpc05vZGVBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIHJlc2V0IHRoZSBwb3MvZW5kIG9mIGFsbCBOb2RlQXJyYXlzIHNvIHRoYXQgd2UgZG9uJ3QgZW1pdCBjb21tZW50c1xuICAgICAgICAgICAgLy8gZnJvbSB0aGVtLlxuICAgICAgICAgICAgdHMuc2V0VGV4dFJhbmdlKHZhbHVlLCB7cG9zOiAtMSwgZW5kOiAtMX0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgIGlzVG9rZW4odmFsdWUpICYmICEodmFsdWUuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQpICYmXG4gICAgICAgICAgICAgIHZhbHVlLmdldFNvdXJjZUZpbGUoKSAhPT0gc291cmNlRmlsZSkge1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBvcmlnaW5hbCBUZXh0UmFuZ2UgZm9yIGFsbCBub24gdmlzaXRlZCB0b2tlbnMgKGUuZy4gdGhlXG4gICAgICAgICAgICAvLyBgQmluYXJ5RXhwcmVzc2lvbi5vcGVyYXRvclRva2VuYCkgdG8gcHJlc2VydmUgdGhlIGZvcm1hdHRpbmdcbiAgICAgICAgICAgIGNvbnN0IHRleHRSYW5nZSA9IG9yaWdpbmFsTm9kZSA/IG9yaWdpbmFsTm9kZUFueVtwcm9wXSA6IHtwb3M6IC0xLCBlbmQ6IC0xfTtcbiAgICAgICAgICAgIHRzLnNldFRleHRSYW5nZSh2YWx1ZSwgdGV4dFJhbmdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBgU291cmNlTWFwcGVyYCB0aGF0IHN0b3JlcyBhbmQgcmV0cmlldmVzIG1hcHBpbmdzXG4gKiB0byBvcmlnaW5hbCBub2Rlcy5cbiAqL1xuY2xhc3MgTm9kZVNvdXJjZU1hcHBlciBpbXBsZW1lbnRzIFNvdXJjZU1hcHBlciB7XG4gIHByaXZhdGUgb3JpZ2luYWxOb2RlQnlHZW5lcmF0ZWRSYW5nZSA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Ob2RlPigpO1xuICBwcml2YXRlIGdlblN0YXJ0UG9zaXRpb25zID0gbmV3IE1hcDx0cy5Ob2RlLCBudW1iZXI+KCk7XG4gIC8qKiBDb25jZXB0dWFsIG9mZnNldCBmb3IgYWxsIG5vZGVzIGluIHRoaXMgbWFwcGluZy4gKi9cbiAgcHJpdmF0ZSBvZmZzZXQgPSAwO1xuXG4gIHByaXZhdGUgYWRkRnVsbE5vZGVSYW5nZShub2RlOiB0cy5Ob2RlLCBnZW5TdGFydFBvczogbnVtYmVyKSB7XG4gICAgdGhpcy5vcmlnaW5hbE5vZGVCeUdlbmVyYXRlZFJhbmdlLnNldChcbiAgICAgICAgdGhpcy5ub2RlQ2FjaGVLZXkobm9kZS5raW5kLCBnZW5TdGFydFBvcywgZ2VuU3RhcnRQb3MgKyAobm9kZS5nZXRFbmQoKSAtIG5vZGUuZ2V0U3RhcnQoKSkpLFxuICAgICAgICBub2RlKTtcbiAgICBub2RlLmZvckVhY2hDaGlsZChcbiAgICAgICAgY2hpbGQgPT4gdGhpcy5hZGRGdWxsTm9kZVJhbmdlKGNoaWxkLCBnZW5TdGFydFBvcyArIChjaGlsZC5nZXRTdGFydCgpIC0gbm9kZS5nZXRTdGFydCgpKSkpO1xuICB9XG5cbiAgc2hpZnRCeU9mZnNldChvZmZzZXQ6IG51bWJlcikge1xuICAgIHRoaXMub2Zmc2V0ICs9IG9mZnNldDtcbiAgfVxuXG4gIGFkZE1hcHBpbmcoXG4gICAgICBvcmlnaW5hbE5vZGU6IHRzLk5vZGUsIG9yaWdpbmFsOiBTb3VyY2VQb3NpdGlvbiwgZ2VuZXJhdGVkOiBTb3VyY2VQb3NpdGlvbiwgbGVuZ3RoOiBudW1iZXIpIHtcbiAgICBsZXQgb3JpZ2luYWxTdGFydFBvcyA9IG9yaWdpbmFsLnBvc2l0aW9uO1xuICAgIGxldCBnZW5TdGFydFBvcyA9IGdlbmVyYXRlZC5wb3NpdGlvbjtcbiAgICBpZiAob3JpZ2luYWxTdGFydFBvcyA+PSBvcmlnaW5hbE5vZGUuZ2V0RnVsbFN0YXJ0KCkgJiZcbiAgICAgICAgb3JpZ2luYWxTdGFydFBvcyA8PSBvcmlnaW5hbE5vZGUuZ2V0U3RhcnQoKSkge1xuICAgICAgLy8gYWx3YXlzIHVzZSB0aGUgbm9kZS5nZXRTdGFydCgpIGZvciB0aGUgaW5kZXgsXG4gICAgICAvLyBhcyBjb21tZW50cyBhbmQgd2hpdGVzcGFjZXMgbWlnaHQgZGlmZmVyIGJldHdlZW4gdGhlIG9yaWdpbmFsIGFuZCB0cmFuc2Zvcm1lZCBjb2RlLlxuICAgICAgY29uc3QgZGlmZlRvU3RhcnQgPSBvcmlnaW5hbE5vZGUuZ2V0U3RhcnQoKSAtIG9yaWdpbmFsU3RhcnRQb3M7XG4gICAgICBvcmlnaW5hbFN0YXJ0UG9zICs9IGRpZmZUb1N0YXJ0O1xuICAgICAgZ2VuU3RhcnRQb3MgKz0gZGlmZlRvU3RhcnQ7XG4gICAgICBsZW5ndGggLT0gZGlmZlRvU3RhcnQ7XG4gICAgICB0aGlzLmdlblN0YXJ0UG9zaXRpb25zLnNldChvcmlnaW5hbE5vZGUsIGdlblN0YXJ0UG9zKTtcbiAgICB9XG4gICAgaWYgKG9yaWdpbmFsU3RhcnRQb3MgKyBsZW5ndGggPT09IG9yaWdpbmFsTm9kZS5nZXRFbmQoKSkge1xuICAgICAgdGhpcy5vcmlnaW5hbE5vZGVCeUdlbmVyYXRlZFJhbmdlLnNldChcbiAgICAgICAgICB0aGlzLm5vZGVDYWNoZUtleShcbiAgICAgICAgICAgICAgb3JpZ2luYWxOb2RlLmtpbmQsIHRoaXMuZ2VuU3RhcnRQb3NpdGlvbnMuZ2V0KG9yaWdpbmFsTm9kZSkhLCBnZW5TdGFydFBvcyArIGxlbmd0aCksXG4gICAgICAgICAgb3JpZ2luYWxOb2RlKTtcbiAgICB9XG4gICAgb3JpZ2luYWxOb2RlLmZvckVhY2hDaGlsZCgoY2hpbGQpID0+IHtcbiAgICAgIGlmIChjaGlsZC5nZXRTdGFydCgpID49IG9yaWdpbmFsU3RhcnRQb3MgJiYgY2hpbGQuZ2V0RW5kKCkgPD0gb3JpZ2luYWxTdGFydFBvcyArIGxlbmd0aCkge1xuICAgICAgICB0aGlzLmFkZEZ1bGxOb2RlUmFuZ2UoY2hpbGQsIGdlblN0YXJ0UG9zICsgKGNoaWxkLmdldFN0YXJ0KCkgLSBvcmlnaW5hbFN0YXJ0UG9zKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogRm9yIHRoZSBuZXdseSBwYXJzZWQgYG5vZGVgLCBmaW5kIHdoYXQgbm9kZSBjb3JyZXNwb25kZWQgdG8gaXQgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSB0ZXh0LiAqL1xuICBnZXRPcmlnaW5hbE5vZGUobm9kZTogdHMuTm9kZSk6IHRzLk5vZGV8dW5kZWZpbmVkIHtcbiAgICAvLyBBcHBseSB0aGUgb2Zmc2V0OiBpZiB0aGVyZSBpcyBhbiBvZmZzZXQgPiAwLCBhbGwgbm9kZXMgYXJlIGNvbmNlcHR1YWxseSBzaGlmdGVkIGJ5IHNvIG1hbnlcbiAgICAvLyBjaGFyYWN0ZXJzIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBmaWxlLlxuICAgIGxldCBzdGFydCA9IG5vZGUuZ2V0U3RhcnQoKSAtIHRoaXMub2Zmc2V0O1xuICAgIGlmIChzdGFydCA8IDApIHtcbiAgICAgIC8vIFNwZWNpYWwgY2FzZTogdGhlIHNvdXJjZSBmaWxlIGNvbmNlcHR1YWxseSBzcGFucyBhbGwgb2YgdGhlIGZpbGUsIGluY2x1ZGluZyBhbnkgYWRkZWRcbiAgICAgIC8vIHByZWZpeCBhZGRlZCB0aGF0IGNhdXNlcyBvZmZzZXQgdG8gYmUgc2V0LlxuICAgICAgaWYgKG5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5Tb3VyY2VGaWxlKSB7XG4gICAgICAgIC8vIE5vZGVzIHdpdGhpbiBbMCwgb2Zmc2V0XSBvZiB0aGUgbmV3IGZpbGUgKHN0YXJ0IDwgMCkgaXMgdGhlIGFkZGl0aW9uYWwgcHJlZml4IHRoYXQgaGFzIG5vXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgbm9kZXMgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSwgc28gcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgY29uc3QgZW5kID0gbm9kZS5nZXRFbmQoKSAtIHRoaXMub2Zmc2V0O1xuICAgIGNvbnN0IGtleSA9IHRoaXMubm9kZUNhY2hlS2V5KG5vZGUua2luZCwgc3RhcnQsIGVuZCk7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luYWxOb2RlQnlHZW5lcmF0ZWRSYW5nZS5nZXQoa2V5KTtcbiAgfVxuXG4gIHByaXZhdGUgbm9kZUNhY2hlS2V5KGtpbmQ6IHRzLlN5bnRheEtpbmQsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7a2luZH0jJHtzdGFydH0jJHtlbmR9YDtcbiAgfVxufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG5mdW5jdGlvbiBpc05vZGVBcnJheSh2YWx1ZTogYW55KTogdmFsdWUgaXMgdHMuTm9kZUFycmF5PGFueT4ge1xuICBjb25zdCBhbnlWYWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgYW55VmFsdWUucG9zICE9PSB1bmRlZmluZWQgJiYgYW55VmFsdWUuZW5kICE9PSB1bmRlZmluZWQ7XG59XG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbmZ1bmN0aW9uIGlzVG9rZW4odmFsdWU6IGFueSk6IHZhbHVlIGlzIHRzLlRva2VuPGFueT4ge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmtpbmQgPj0gdHMuU3ludGF4S2luZC5GaXJzdFRva2VuICYmXG4gICAgICB2YWx1ZS5raW5kIDw9IHRzLlN5bnRheEtpbmQuTGFzdFRva2VuO1xufVxuXG4vLyBDb3BpZWQgZnJvbSBUeXBlU2NyaXB0XG5mdW5jdGlvbiBpc0xpdGVyYWxLaW5kKGtpbmQ6IHRzLlN5bnRheEtpbmQpIHtcbiAgcmV0dXJuIHRzLlN5bnRheEtpbmQuRmlyc3RMaXRlcmFsVG9rZW4gPD0ga2luZCAmJiBraW5kIDw9IHRzLlN5bnRheEtpbmQuTGFzdExpdGVyYWxUb2tlbjtcbn1cbiJdfQ==