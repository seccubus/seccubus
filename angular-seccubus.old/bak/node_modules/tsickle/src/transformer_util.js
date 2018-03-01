/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/transformer_util", ["require", "exports", "tsickle/src/typescript", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("tsickle/src/typescript");
    var util_1 = require("tsickle/src/util");
    /**
     * Adjusts the given CustomTransformers with additional transformers
     * to fix bugs in TypeScript.
     */
    function createCustomTransformers(given) {
        var before = given.before || [];
        before.unshift(addFileContexts);
        before.push(prepareNodesBeforeTypeScriptTransform);
        var after = given.after || [];
        after.unshift(emitMissingSyntheticCommentsAfterTypescriptTransform);
        return { before: before, after: after };
    }
    exports.createCustomTransformers = createCustomTransformers;
    /**
     * Transform that adds the FileContext to the TransformationContext.
     */
    function addFileContexts(context) {
        return function (sourceFile) {
            context.fileContext = new FileContext(sourceFile);
            return sourceFile;
        };
    }
    function assertFileContext(context, sourceFile) {
        if (!context.fileContext) {
            throw new Error("Illegal State: FileContext not initialized. " +
                "Did you forget to add the \"firstTransform\" as first transformer? " +
                ("File: " + sourceFile.fileName));
        }
        if (context.fileContext.file.fileName !== sourceFile.fileName) {
            throw new Error("Illegal State: File of the FileContext does not match. File: " + sourceFile.fileName);
        }
        return context.fileContext;
    }
    /**
     * A context that stores information per file to e.g. allow communication
     * between transformers.
     * There is one ts.TransformationContext per emit,
     * but files are handled sequentially by all transformers. Thefore we can
     * store file related information on a property on the ts.TransformationContext,
     * given that we reset it in the first transformer.
     */
    var FileContext = /** @class */ (function () {
        function FileContext(file) {
            this.file = file;
            /**
             * Stores the parent node for all processed nodes.
             * This is needed for nodes from the parse tree that are used
             * in a synthetic node as must not modify these, even though they
             * have a new parent now.
             */
            this.syntheticNodeParents = new Map();
            this.importOrReexportDeclarations = [];
            this.lastCommentEnd = -1;
        }
        return FileContext;
    }());
    /**
     * Transform that needs to be executed right before TypeScript's transform.
     *
     * This prepares the node tree to workaround some bugs in the TypeScript emitter.
     */
    function prepareNodesBeforeTypeScriptTransform(context) {
        return function (sourceFile) {
            var fileCtx = assertFileContext(context, sourceFile);
            var nodePath = [];
            visitNode(sourceFile);
            return sourceFile;
            function visitNode(node) {
                var startNode = node;
                var parent = nodePath[nodePath.length - 1];
                if (node.flags & ts.NodeFlags.Synthesized) {
                    // Set `parent` for synthetic nodes as well,
                    // as otherwise the TS emit will crash for decorators.
                    // Note: don't update the `parent` of original nodes, as:
                    // 1) we don't want to change them at all
                    // 2) TS emit becomes errorneous in some cases if we add a synthetic parent.
                    // see https://github.com/Microsoft/TypeScript/issues/17384
                    node.parent = parent;
                }
                fileCtx.syntheticNodeParents.set(node, parent);
                var originalNode = ts.getOriginalNode(node);
                // Needed so that e.g. `module { ... }` prints the variable statement
                // before the closure.
                // See https://github.com/Microsoft/TypeScript/issues/17596
                // tslint:disable-next-line:no-any as `symbol` is @internal in typescript.
                node.symbol = originalNode.symbol;
                if (originalNode && node.kind === ts.SyntaxKind.ExportDeclaration) {
                    var originalEd = originalNode;
                    var ed = node;
                    if (!!originalEd.exportClause !== !!ed.exportClause) {
                        // Tsickle changes `export * ...` into named exports.
                        // In this case, don't set the original node for the ExportDeclaration
                        // as otherwise TypeScript does not emit the exports.
                        // See https://github.com/Microsoft/TypeScript/issues/17597
                        ts.setOriginalNode(node, undefined);
                    }
                }
                if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                    node.kind === ts.SyntaxKind.ExportDeclaration) {
                    var ied = node;
                    if (ied.moduleSpecifier) {
                        fileCtx.importOrReexportDeclarations.push(ied);
                    }
                }
                // recurse
                nodePath.push(node);
                node.forEachChild(visitNode);
                nodePath.pop();
            }
        };
    }
    /**
     * Transform that needs to be executed after TypeScript's transform.
     *
     * This fixes places where the TypeScript transformer does not
     * emit synthetic comments.
     *
     * See https://github.com/Microsoft/TypeScript/issues/17594
     */
    function emitMissingSyntheticCommentsAfterTypescriptTransform(context) {
        return function (sourceFile) {
            var fileContext = assertFileContext(context, sourceFile);
            var nodePath = [];
            visitNode(sourceFile);
            context.fileContext = undefined;
            return sourceFile;
            function visitNode(node) {
                if (node.kind === ts.SyntaxKind.Identifier) {
                    var parent1 = fileContext.syntheticNodeParents.get(node);
                    var parent2 = parent1 && fileContext.syntheticNodeParents.get(parent1);
                    var parent3 = parent2 && fileContext.syntheticNodeParents.get(parent2);
                    if (parent1 && parent1.kind === ts.SyntaxKind.PropertyDeclaration) {
                        // TypeScript ignores synthetic comments on (static) property declarations
                        // with initializers.
                        // find the parent ExpressionStatement like MyClass.foo = ...
                        var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                        if (expressionStmt) {
                            ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent1) || []);
                        }
                    }
                    else if (parent3 && parent3.kind === ts.SyntaxKind.VariableStatement &&
                        util_1.hasModifierFlag(parent3, ts.ModifierFlags.Export)) {
                        // TypeScript ignores synthetic comments on exported variables.
                        // find the parent ExpressionStatement like exports.foo = ...
                        var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                        if (expressionStmt) {
                            ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent3) || []);
                        }
                    }
                }
                // TypeScript ignores synthetic comments on reexport / import statements.
                var moduleName = extractModuleNameFromRequireVariableStatement(node);
                if (moduleName && fileContext.importOrReexportDeclarations) {
                    // Locate the original import/export declaration via the
                    // text range.
                    var importOrReexportDeclaration = fileContext.importOrReexportDeclarations.find(function (ied) { return ied.pos === node.pos; });
                    if (importOrReexportDeclaration) {
                        ts.setSyntheticLeadingComments(node, ts.getSyntheticLeadingComments(importOrReexportDeclaration) || []);
                    }
                    // Need to clear the textRange for ImportDeclaration / ExportDeclaration as
                    // otherwise TypeScript would emit the original comments even if we set the
                    // ts.EmitFlag.NoComments. (see also resetNodeTextRangeToPreventDuplicateComments below)
                    ts.setSourceMapRange(node, { pos: node.pos, end: node.end });
                    ts.setTextRange(node, { pos: -1, end: -1 });
                }
                nodePath.push(node);
                node.forEachChild(visitNode);
                nodePath.pop();
            }
        };
    }
    function extractModuleNameFromRequireVariableStatement(node) {
        if (node.kind !== ts.SyntaxKind.VariableStatement) {
            return null;
        }
        var varStmt = node;
        var decls = varStmt.declarationList.declarations;
        var init;
        if (decls.length !== 1 || !(init = decls[0].initializer) ||
            init.kind !== ts.SyntaxKind.CallExpression) {
            return null;
        }
        var callExpr = init;
        if (callExpr.expression.kind !== ts.SyntaxKind.Identifier ||
            callExpr.expression.text !== 'require' ||
            callExpr.arguments.length !== 1) {
            return null;
        }
        var moduleExpr = callExpr.arguments[0];
        if (moduleExpr.kind !== ts.SyntaxKind.StringLiteral) {
            return null;
        }
        return moduleExpr.text;
    }
    function lastNodeWith(nodes, predicate) {
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = nodes[i];
            if (predicate(node)) {
                return node;
            }
        }
        return null;
    }
    /**
     * Convert comment text ranges before and after a node
     * into ts.SynthesizedComments for the node and prevent the
     * comment text ranges to be emitted, to allow
     * changing these comments.
     *
     * This function takes a visitor to be able to do some
     * state management after the caller is done changing a node.
     */
    function visitNodeWithSynthesizedComments(context, sourceFile, node, visitor) {
        if (node.flags & ts.NodeFlags.Synthesized) {
            return visitor(node);
        }
        if (node.kind === ts.SyntaxKind.Block) {
            var block_1 = node;
            node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, block_1.statements, function (node, stmts) { return visitor(ts.updateBlock(block_1, stmts)); });
        }
        else if (node.kind === ts.SyntaxKind.SourceFile) {
            node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, sourceFile.statements, function (node, stmts) { return visitor(updateSourceFileNode(sourceFile, stmts)); });
        }
        else {
            var fileContext = assertFileContext(context, sourceFile);
            var leadingLastCommentEnd = synthesizeLeadingComments(sourceFile, node, fileContext.lastCommentEnd);
            var trailingLastCommentEnd = synthesizeTrailingComments(sourceFile, node);
            if (leadingLastCommentEnd !== -1) {
                fileContext.lastCommentEnd = leadingLastCommentEnd;
            }
            node = visitor(node);
            if (trailingLastCommentEnd !== -1) {
                fileContext.lastCommentEnd = trailingLastCommentEnd;
            }
        }
        return resetNodeTextRangeToPreventDuplicateComments(node);
    }
    exports.visitNodeWithSynthesizedComments = visitNodeWithSynthesizedComments;
    /**
     * Reset the text range for some special nodes as otherwise TypeScript
     * would always emit the original comments for them.
     * See https://github.com/Microsoft/TypeScript/issues/17594
     *
     * @param node
     */
    function resetNodeTextRangeToPreventDuplicateComments(node) {
        ts.setEmitFlags(node, (ts.getEmitFlags(node) || 0) | ts.EmitFlags.NoComments);
        // See also addSyntheticCommentsAfterTsTransformer.
        // Note: Don't reset the textRange for ts.ExportDeclaration / ts.ImportDeclaration
        // until after the TypeScript transformer as we need the source location
        // to map the generated `require` calls back to the original
        // ts.ExportDeclaration / ts.ImportDeclaration nodes.
        var allowTextRange = node.kind !== ts.SyntaxKind.ClassDeclaration &&
            node.kind !== ts.SyntaxKind.VariableDeclaration &&
            !(node.kind === ts.SyntaxKind.VariableStatement &&
                util_1.hasModifierFlag(node, ts.ModifierFlags.Export));
        if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
            allowTextRange = false;
            var pd = node;
            node = ts.updateProperty(pd, pd.decorators, pd.modifiers, resetTextRange(pd.name), pd.questionToken, pd.type, pd.initializer);
        }
        if (!allowTextRange) {
            node = resetTextRange(node);
        }
        return node;
        function resetTextRange(node) {
            if (!(node.flags & ts.NodeFlags.Synthesized)) {
                // need to clone as we don't want to modify source nodes,
                // as the parsed SourceFiles could be cached!
                node = ts.getMutableClone(node);
            }
            var textRange = { pos: node.pos, end: node.end };
            ts.setSourceMapRange(node, textRange);
            ts.setTextRange(node, { pos: -1, end: -1 });
            return node;
        }
    }
    /**
     * Reads in the leading comment text ranges of the given node,
     * converts them into `ts.SyntheticComment`s and stores them on the node.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     *
     * @param lastCommentEnd The end of the last comment
     * @return The end of the last found comment, -1 if no comment was found.
     */
    function synthesizeLeadingComments(sourceFile, node, lastCommentEnd) {
        var parent = node.parent;
        var sharesStartWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
            parent.kind !== ts.SyntaxKind.SourceFile && parent.getFullStart() === node.getFullStart();
        if (sharesStartWithParent || lastCommentEnd >= node.getStart()) {
            return -1;
        }
        var adjustedNodeFullStart = Math.max(lastCommentEnd, node.getFullStart());
        var leadingComments = getAllLeadingCommentRanges(sourceFile, adjustedNodeFullStart, node.getStart());
        if (leadingComments && leadingComments.length) {
            ts.setSyntheticLeadingComments(node, synthesizeCommentRanges(sourceFile, leadingComments));
            return node.getStart();
        }
        return -1;
    }
    /**
     * Reads in the trailing comment text ranges of the given node,
     * converts them into `ts.SyntheticComment`s and stores them on the node.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     *
     * @return The end of the last found comment, -1 if no comment was found.
     */
    function synthesizeTrailingComments(sourceFile, node) {
        var parent = node.parent;
        var sharesEndWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
            parent.kind !== ts.SyntaxKind.SourceFile && parent.getEnd() === node.getEnd();
        if (sharesEndWithParent) {
            return -1;
        }
        var trailingComments = ts.getTrailingCommentRanges(sourceFile.text, node.getEnd());
        if (trailingComments && trailingComments.length) {
            ts.setSyntheticTrailingComments(node, synthesizeCommentRanges(sourceFile, trailingComments));
            return trailingComments[trailingComments.length - 1].end;
        }
        return -1;
    }
    function arrayOf(value) {
        return value ? [value] : [];
    }
    /**
     * Convert leading/trailing detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into
     * `ts.NonEmittedStatement`s with `ts.SynthesizedComment`s and
     * prepends / appends them to the given statement array.
     * This is needed to allow changing these comments.
     *
     * This function takes a visitor to be able to do some
     * state management after the caller is done changing a node.
     */
    function visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, statements, visitor) {
        var leading = synthesizeDetachedLeadingComments(sourceFile, node, statements);
        var trailing = synthesizeDetachedTrailingComments(sourceFile, node, statements);
        if (leading.commentStmt || trailing.commentStmt) {
            var newStatements = __spread(arrayOf(leading.commentStmt), statements, arrayOf(trailing.commentStmt));
            statements = ts.setTextRange(ts.createNodeArray(newStatements), { pos: -1, end: -1 });
            /**
             * The visitor creates a new node with the new statements. However, doing so
             * reveals a TypeScript bug.
             * To reproduce comment out the line below and compile:
             *
             * // ......
             *
             * abstract class A {
             * }
             * abstract class B extends A {
             *   // ......
             * }
             *
             * Note that newlines are significant. This would result in the following:
             * runtime error "TypeError: Cannot read property 'members' of undefined".
             *
             * The line below is a workaround that ensures that updateSourceFileNode and
             * updateBlock never create new Nodes.
             * TODO(#634): file a bug with TS team.
             */
            node.statements = statements;
            var fileContext = assertFileContext(context, sourceFile);
            if (leading.lastCommentEnd !== -1) {
                fileContext.lastCommentEnd = leading.lastCommentEnd;
            }
            node = visitor(node, statements);
            if (trailing.lastCommentEnd !== -1) {
                fileContext.lastCommentEnd = trailing.lastCommentEnd;
            }
            return node;
        }
        return visitor(node, statements);
    }
    /**
     * Convert leading detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into a
     * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
     *
     * A Detached leading comment is the first comment in a SourceFile / Block
     * that is separated with a newline from the first statement.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     */
    function synthesizeDetachedLeadingComments(sourceFile, node, statements) {
        var triviaEnd = statements.end;
        if (statements.length) {
            triviaEnd = statements[0].getStart();
        }
        var detachedComments = getDetachedLeadingCommentRanges(sourceFile, statements.pos, triviaEnd);
        if (!detachedComments.length) {
            return { commentStmt: null, lastCommentEnd: -1 };
        }
        var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
        var commentStmt = createNotEmittedStatement(sourceFile);
        ts.setSyntheticTrailingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
        return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
    }
    /**
     * Convert trailing detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into a
     * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
     *
     * A Detached trailing comment are all comments after the first newline
     * the follows the last statement in a SourceFile / Block.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     */
    function synthesizeDetachedTrailingComments(sourceFile, node, statements) {
        var trailingCommentStart = statements.end;
        if (statements.length) {
            var lastStmt = statements[statements.length - 1];
            var lastStmtTrailingComments = ts.getTrailingCommentRanges(sourceFile.text, lastStmt.end);
            if (lastStmtTrailingComments && lastStmtTrailingComments.length) {
                trailingCommentStart = lastStmtTrailingComments[lastStmtTrailingComments.length - 1].end;
            }
        }
        var detachedComments = getAllLeadingCommentRanges(sourceFile, trailingCommentStart, node.end);
        if (!detachedComments || !detachedComments.length) {
            return { commentStmt: null, lastCommentEnd: -1 };
        }
        var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
        var commentStmt = createNotEmittedStatement(sourceFile);
        ts.setSyntheticLeadingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
        return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
    }
    /**
     * Calculates the the detached leading comment ranges in an area of a SourceFile.
     * @param sourceFile The source file
     * @param start Where to start scanning
     * @param end Where to end scanning
     */
    // Note: This code is based on compiler/comments.ts in TypeScript
    function getDetachedLeadingCommentRanges(sourceFile, start, end) {
        var leadingComments = getAllLeadingCommentRanges(sourceFile, start, end);
        if (!leadingComments || !leadingComments.length) {
            return [];
        }
        var detachedComments = [];
        var lastComment = undefined;
        try {
            for (var leadingComments_1 = __values(leadingComments), leadingComments_1_1 = leadingComments_1.next(); !leadingComments_1_1.done; leadingComments_1_1 = leadingComments_1.next()) {
                var comment = leadingComments_1_1.value;
                if (lastComment) {
                    var lastCommentLine = getLineOfPos(sourceFile, lastComment.end);
                    var commentLine = getLineOfPos(sourceFile, comment.pos);
                    if (commentLine >= lastCommentLine + 2) {
                        // There was a blank line between the last comment and this comment.  This
                        // comment is not part of the copyright comments.  Return what we have so
                        // far.
                        break;
                    }
                }
                detachedComments.push(comment);
                lastComment = comment;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (leadingComments_1_1 && !leadingComments_1_1.done && (_a = leadingComments_1.return)) _a.call(leadingComments_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (detachedComments.length) {
            // All comments look like they could have been part of the copyright header.  Make
            // sure there is at least one blank line between it and the node.  If not, it's not
            // a copyright header.
            var lastCommentLine = getLineOfPos(sourceFile, detachedComments[detachedComments.length - 1].end);
            var nodeLine = getLineOfPos(sourceFile, end);
            if (nodeLine >= lastCommentLine + 2) {
                // Valid detachedComments
                return detachedComments;
            }
        }
        return [];
        var e_1, _a;
    }
    function getLineOfPos(sourceFile, pos) {
        return ts.getLineAndCharacterOfPosition(sourceFile, pos).line;
    }
    /**
     * Converts `ts.CommentRange`s into `ts.SynthesizedComment`s
     * @param sourceFile
     * @param parsedComments
     */
    function synthesizeCommentRanges(sourceFile, parsedComments) {
        var synthesizedComments = [];
        parsedComments.forEach(function (_a, commentIdx) {
            var kind = _a.kind, pos = _a.pos, end = _a.end, hasTrailingNewLine = _a.hasTrailingNewLine;
            var commentText = sourceFile.text.substring(pos, end).trim();
            if (kind === ts.SyntaxKind.MultiLineCommentTrivia) {
                commentText = commentText.replace(/(^\/\*)|(\*\/$)/g, '');
            }
            else if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
                if (commentText.startsWith('///')) {
                    // tripple-slash comments are typescript specific, ignore them in the output.
                    return;
                }
                commentText = commentText.replace(/(^\/\/)/g, '');
            }
            synthesizedComments.push({ kind: kind, text: commentText, hasTrailingNewLine: hasTrailingNewLine, pos: -1, end: -1 });
        });
        return synthesizedComments;
    }
    /**
     * Creates a non emitted statement that can be used to store synthesized comments.
     */
    function createNotEmittedStatement(sourceFile) {
        var stmt = ts.createNotEmittedStatement(sourceFile);
        ts.setOriginalNode(stmt, undefined);
        ts.setTextRange(stmt, { pos: 0, end: 0 });
        ts.setEmitFlags(stmt, ts.EmitFlags.CustomPrologue);
        return stmt;
    }
    exports.createNotEmittedStatement = createNotEmittedStatement;
    /**
     * Returns the leading comment ranges in the source file that start at the given position.
     * This is the same as `ts.getLeadingCommentRanges`, except that it does not skip
     * comments before the first newline in the range.
     *
     * @param sourceFile
     * @param start Where to start scanning
     * @param end Where to end scanning
     */
    function getAllLeadingCommentRanges(sourceFile, start, end) {
        // exeute ts.getLeadingCommentRanges with pos = 0 so that it does not skip
        // comments until the first newline.
        var commentRanges = ts.getLeadingCommentRanges(sourceFile.text.substring(start, end), 0) || [];
        return commentRanges.map(function (cr) { return ({
            hasTrailingNewLine: cr.hasTrailingNewLine,
            kind: cr.kind,
            pos: cr.pos + start,
            end: cr.end + start
        }); });
    }
    /**
     * This is a version of `ts.visitEachChild` that works that calls our version
     * of `updateSourceFileNode`, so that typescript doesn't lose type information
     * for property decorators.
     * See https://github.com/Microsoft/TypeScript/issues/17384
     *
     * @param sf
     * @param statements
     */
    function visitEachChild(node, visitor, context) {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            var sf = node;
            return updateSourceFileNode(sf, ts.visitLexicalEnvironment(sf.statements, visitor, context));
        }
        return ts.visitEachChild(node, visitor, context);
    }
    exports.visitEachChild = visitEachChild;
    /**
     * This is a version of `ts.updateSourceFileNode` that works
     * well with property decorators.
     * See https://github.com/Microsoft/TypeScript/issues/17384
     * TODO(#634): This has been fixed in TS 2.5. Investigate removal.
     *
     * @param sf
     * @param statements
     */
    function updateSourceFileNode(sf, statements) {
        if (statements === sf.statements) {
            return sf;
        }
        // Note: Need to clone the original file (and not use `ts.updateSourceFileNode`)
        // as otherwise TS fails when resolving types for decorators.
        sf = ts.getMutableClone(sf);
        sf.statements = statements;
        return sf;
    }
    exports.updateSourceFileNode = updateSourceFileNode;
    // Copied from TypeScript
    function isTypeNodeKind(kind) {
        return (kind >= ts.SyntaxKind.FirstTypeNode && kind <= ts.SyntaxKind.LastTypeNode) ||
            kind === ts.SyntaxKind.AnyKeyword || kind === ts.SyntaxKind.NumberKeyword ||
            kind === ts.SyntaxKind.ObjectKeyword || kind === ts.SyntaxKind.BooleanKeyword ||
            kind === ts.SyntaxKind.StringKeyword || kind === ts.SyntaxKind.SymbolKeyword ||
            kind === ts.SyntaxKind.ThisKeyword || kind === ts.SyntaxKind.VoidKeyword ||
            kind === ts.SyntaxKind.UndefinedKeyword || kind === ts.SyntaxKind.NullKeyword ||
            kind === ts.SyntaxKind.NeverKeyword || kind === ts.SyntaxKind.ExpressionWithTypeArguments;
    }
    exports.isTypeNodeKind = isTypeNodeKind;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXJfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cmFuc2Zvcm1lcl91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsMkNBQW1DO0lBQ25DLHlDQUF1QztJQUV2Qzs7O09BR0c7SUFDSCxrQ0FBeUMsS0FBNEI7UUFDbkUsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbkQsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDaEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxFQUFDLE1BQU0sUUFBQSxFQUFFLEtBQUssT0FBQSxFQUFDLENBQUM7SUFDekIsQ0FBQztJQVBELDREQU9DO0lBRUQ7O09BRUc7SUFDSCx5QkFBeUIsT0FBaUM7UUFDeEQsTUFBTSxDQUFDLFVBQUMsVUFBeUI7WUFDOUIsT0FBaUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0UsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsMkJBQTJCLE9BQThCLEVBQUUsVUFBeUI7UUFDbEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLElBQUksS0FBSyxDQUNYLDhDQUE4QztnQkFDOUMscUVBQW1FO2lCQUNuRSxXQUFTLFVBQVUsQ0FBQyxRQUFVLENBQUEsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7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Z2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtoYXNNb2RpZmllckZsYWd9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogQWRqdXN0cyB0aGUgZ2l2ZW4gQ3VzdG9tVHJhbnNmb3JtZXJzIHdpdGggYWRkaXRpb25hbCB0cmFuc2Zvcm1lcnNcbiAqIHRvIGZpeCBidWdzIGluIFR5cGVTY3JpcHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21UcmFuc2Zvcm1lcnMoZ2l2ZW46IHRzLkN1c3RvbVRyYW5zZm9ybWVycyk6IHRzLkN1c3RvbVRyYW5zZm9ybWVycyB7XG4gIGNvbnN0IGJlZm9yZSA9IGdpdmVuLmJlZm9yZSB8fCBbXTtcbiAgYmVmb3JlLnVuc2hpZnQoYWRkRmlsZUNvbnRleHRzKTtcbiAgYmVmb3JlLnB1c2gocHJlcGFyZU5vZGVzQmVmb3JlVHlwZVNjcmlwdFRyYW5zZm9ybSk7XG4gIGNvbnN0IGFmdGVyID0gZ2l2ZW4uYWZ0ZXIgfHwgW107XG4gIGFmdGVyLnVuc2hpZnQoZW1pdE1pc3NpbmdTeW50aGV0aWNDb21tZW50c0FmdGVyVHlwZXNjcmlwdFRyYW5zZm9ybSk7XG4gIHJldHVybiB7YmVmb3JlLCBhZnRlcn07XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoYXQgYWRkcyB0aGUgRmlsZUNvbnRleHQgdG8gdGhlIFRyYW5zZm9ybWF0aW9uQ29udGV4dC5cbiAqL1xuZnVuY3Rpb24gYWRkRmlsZUNvbnRleHRzKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkge1xuICByZXR1cm4gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICAoY29udGV4dCBhcyBUcmFuc2Zvcm1hdGlvbkNvbnRleHQpLmZpbGVDb250ZXh0ID0gbmV3IEZpbGVDb250ZXh0KHNvdXJjZUZpbGUpO1xuICAgIHJldHVybiBzb3VyY2VGaWxlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhc3NlcnRGaWxlQ29udGV4dChjb250ZXh0OiBUcmFuc2Zvcm1hdGlvbkNvbnRleHQsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBGaWxlQ29udGV4dCB7XG4gIGlmICghY29udGV4dC5maWxlQ29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYElsbGVnYWwgU3RhdGU6IEZpbGVDb250ZXh0IG5vdCBpbml0aWFsaXplZC4gYCArXG4gICAgICAgIGBEaWQgeW91IGZvcmdldCB0byBhZGQgdGhlIFwiZmlyc3RUcmFuc2Zvcm1cIiBhcyBmaXJzdCB0cmFuc2Zvcm1lcj8gYCArXG4gICAgICAgIGBGaWxlOiAke3NvdXJjZUZpbGUuZmlsZU5hbWV9YCk7XG4gIH1cbiAgaWYgKGNvbnRleHQuZmlsZUNvbnRleHQuZmlsZS5maWxlTmFtZSAhPT0gc291cmNlRmlsZS5maWxlTmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYElsbGVnYWwgU3RhdGU6IEZpbGUgb2YgdGhlIEZpbGVDb250ZXh0IGRvZXMgbm90IG1hdGNoLiBGaWxlOiAke3NvdXJjZUZpbGUuZmlsZU5hbWV9YCk7XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQuZmlsZUNvbnRleHQ7XG59XG5cbi8qKlxuICogQW4gZXh0ZW5kZWQgdmVyc2lvbiBvZiB0aGUgVHJhbnNmb3JtYXRpb25Db250ZXh0IHRoYXQgc3RvcmVzIHRoZSBGaWxlQ29udGV4dCBhcyB3ZWxsLlxuICovXG5pbnRlcmZhY2UgVHJhbnNmb3JtYXRpb25Db250ZXh0IGV4dGVuZHMgdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0IHtcbiAgZmlsZUNvbnRleHQ/OiBGaWxlQ29udGV4dDtcbn1cblxuLyoqXG4gKiBBIGNvbnRleHQgdGhhdCBzdG9yZXMgaW5mb3JtYXRpb24gcGVyIGZpbGUgdG8gZS5nLiBhbGxvdyBjb21tdW5pY2F0aW9uXG4gKiBiZXR3ZWVuIHRyYW5zZm9ybWVycy5cbiAqIFRoZXJlIGlzIG9uZSB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQgcGVyIGVtaXQsXG4gKiBidXQgZmlsZXMgYXJlIGhhbmRsZWQgc2VxdWVudGlhbGx5IGJ5IGFsbCB0cmFuc2Zvcm1lcnMuIFRoZWZvcmUgd2UgY2FuXG4gKiBzdG9yZSBmaWxlIHJlbGF0ZWQgaW5mb3JtYXRpb24gb24gYSBwcm9wZXJ0eSBvbiB0aGUgdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0LFxuICogZ2l2ZW4gdGhhdCB3ZSByZXNldCBpdCBpbiB0aGUgZmlyc3QgdHJhbnNmb3JtZXIuXG4gKi9cbmNsYXNzIEZpbGVDb250ZXh0IHtcbiAgLyoqXG4gICAqIFN0b3JlcyB0aGUgcGFyZW50IG5vZGUgZm9yIGFsbCBwcm9jZXNzZWQgbm9kZXMuXG4gICAqIFRoaXMgaXMgbmVlZGVkIGZvciBub2RlcyBmcm9tIHRoZSBwYXJzZSB0cmVlIHRoYXQgYXJlIHVzZWRcbiAgICogaW4gYSBzeW50aGV0aWMgbm9kZSBhcyBtdXN0IG5vdCBtb2RpZnkgdGhlc2UsIGV2ZW4gdGhvdWdoIHRoZXlcbiAgICogaGF2ZSBhIG5ldyBwYXJlbnQgbm93LlxuICAgKi9cbiAgc3ludGhldGljTm9kZVBhcmVudHMgPSBuZXcgTWFwPHRzLk5vZGUsIHRzLk5vZGV8dW5kZWZpbmVkPigpO1xuICBpbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb25zOiBBcnJheTx0cy5FeHBvcnREZWNsYXJhdGlvbnx0cy5JbXBvcnREZWNsYXJhdGlvbj4gPSBbXTtcbiAgbGFzdENvbW1lbnRFbmQgPSAtMTtcbiAgY29uc3RydWN0b3IocHVibGljIGZpbGU6IHRzLlNvdXJjZUZpbGUpIHt9XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoYXQgbmVlZHMgdG8gYmUgZXhlY3V0ZWQgcmlnaHQgYmVmb3JlIFR5cGVTY3JpcHQncyB0cmFuc2Zvcm0uXG4gKlxuICogVGhpcyBwcmVwYXJlcyB0aGUgbm9kZSB0cmVlIHRvIHdvcmthcm91bmQgc29tZSBidWdzIGluIHRoZSBUeXBlU2NyaXB0IGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVOb2Rlc0JlZm9yZVR5cGVTY3JpcHRUcmFuc2Zvcm0oY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSB7XG4gIHJldHVybiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGNvbnN0IGZpbGVDdHggPSBhc3NlcnRGaWxlQ29udGV4dChjb250ZXh0LCBzb3VyY2VGaWxlKTtcblxuICAgIGNvbnN0IG5vZGVQYXRoOiB0cy5Ob2RlW10gPSBbXTtcbiAgICB2aXNpdE5vZGUoc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIHNvdXJjZUZpbGU7XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSkge1xuICAgICAgY29uc3Qgc3RhcnROb2RlID0gbm9kZTtcbiAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGVQYXRoW25vZGVQYXRoLmxlbmd0aCAtIDFdO1xuXG4gICAgICBpZiAobm9kZS5mbGFncyAmIHRzLk5vZGVGbGFncy5TeW50aGVzaXplZCkge1xuICAgICAgICAvLyBTZXQgYHBhcmVudGAgZm9yIHN5bnRoZXRpYyBub2RlcyBhcyB3ZWxsLFxuICAgICAgICAvLyBhcyBvdGhlcndpc2UgdGhlIFRTIGVtaXQgd2lsbCBjcmFzaCBmb3IgZGVjb3JhdG9ycy5cbiAgICAgICAgLy8gTm90ZTogZG9uJ3QgdXBkYXRlIHRoZSBgcGFyZW50YCBvZiBvcmlnaW5hbCBub2RlcywgYXM6XG4gICAgICAgIC8vIDEpIHdlIGRvbid0IHdhbnQgdG8gY2hhbmdlIHRoZW0gYXQgYWxsXG4gICAgICAgIC8vIDIpIFRTIGVtaXQgYmVjb21lcyBlcnJvcm5lb3VzIGluIHNvbWUgY2FzZXMgaWYgd2UgYWRkIGEgc3ludGhldGljIHBhcmVudC5cbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTczODRcbiAgICAgICAgbm9kZS5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICB9XG4gICAgICBmaWxlQ3R4LnN5bnRoZXRpY05vZGVQYXJlbnRzLnNldChub2RlLCBwYXJlbnQpO1xuXG4gICAgICBjb25zdCBvcmlnaW5hbE5vZGUgPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSk7XG4gICAgICAvLyBOZWVkZWQgc28gdGhhdCBlLmcuIGBtb2R1bGUgeyAuLi4gfWAgcHJpbnRzIHRoZSB2YXJpYWJsZSBzdGF0ZW1lbnRcbiAgICAgIC8vIGJlZm9yZSB0aGUgY2xvc3VyZS5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTk2XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55IGFzIGBzeW1ib2xgIGlzIEBpbnRlcm5hbCBpbiB0eXBlc2NyaXB0LlxuICAgICAgKG5vZGUgYXMgYW55KS5zeW1ib2wgPSAob3JpZ2luYWxOb2RlIGFzIGFueSkuc3ltYm9sO1xuXG4gICAgICBpZiAob3JpZ2luYWxOb2RlICYmIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHBvcnREZWNsYXJhdGlvbikge1xuICAgICAgICBjb25zdCBvcmlnaW5hbEVkID0gb3JpZ2luYWxOb2RlIGFzIHRzLkV4cG9ydERlY2xhcmF0aW9uO1xuICAgICAgICBjb25zdCBlZCA9IG5vZGUgYXMgdHMuRXhwb3J0RGVjbGFyYXRpb247XG4gICAgICAgIGlmICghIW9yaWdpbmFsRWQuZXhwb3J0Q2xhdXNlICE9PSAhIWVkLmV4cG9ydENsYXVzZSkge1xuICAgICAgICAgIC8vIFRzaWNrbGUgY2hhbmdlcyBgZXhwb3J0ICogLi4uYCBpbnRvIG5hbWVkIGV4cG9ydHMuXG4gICAgICAgICAgLy8gSW4gdGhpcyBjYXNlLCBkb24ndCBzZXQgdGhlIG9yaWdpbmFsIG5vZGUgZm9yIHRoZSBFeHBvcnREZWNsYXJhdGlvblxuICAgICAgICAgIC8vIGFzIG90aGVyd2lzZSBUeXBlU2NyaXB0IGRvZXMgbm90IGVtaXQgdGhlIGV4cG9ydHMuXG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTc1OTdcbiAgICAgICAgICB0cy5zZXRPcmlnaW5hbE5vZGUobm9kZSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydERlY2xhcmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGllZCA9IG5vZGUgYXMgdHMuSW1wb3J0RGVjbGFyYXRpb24gfCB0cy5FeHBvcnREZWNsYXJhdGlvbjtcbiAgICAgICAgaWYgKGllZC5tb2R1bGVTcGVjaWZpZXIpIHtcbiAgICAgICAgICBmaWxlQ3R4LmltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbnMucHVzaChpZWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHJlY3Vyc2VcbiAgICAgIG5vZGVQYXRoLnB1c2gobm9kZSk7XG4gICAgICBub2RlLmZvckVhY2hDaGlsZCh2aXNpdE5vZGUpO1xuICAgICAgbm9kZVBhdGgucG9wKCk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGF0IG5lZWRzIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIFR5cGVTY3JpcHQncyB0cmFuc2Zvcm0uXG4gKlxuICogVGhpcyBmaXhlcyBwbGFjZXMgd2hlcmUgdGhlIFR5cGVTY3JpcHQgdHJhbnNmb3JtZXIgZG9lcyBub3RcbiAqIGVtaXQgc3ludGhldGljIGNvbW1lbnRzLlxuICpcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTk0XG4gKi9cbmZ1bmN0aW9uIGVtaXRNaXNzaW5nU3ludGhldGljQ29tbWVudHNBZnRlclR5cGVzY3JpcHRUcmFuc2Zvcm0oY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSB7XG4gIHJldHVybiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGNvbnN0IGZpbGVDb250ZXh0ID0gYXNzZXJ0RmlsZUNvbnRleHQoY29udGV4dCwgc291cmNlRmlsZSk7XG4gICAgY29uc3Qgbm9kZVBhdGg6IHRzLk5vZGVbXSA9IFtdO1xuICAgIHZpc2l0Tm9kZShzb3VyY2VGaWxlKTtcbiAgICAoY29udGV4dCBhcyBUcmFuc2Zvcm1hdGlvbkNvbnRleHQpLmZpbGVDb250ZXh0ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzb3VyY2VGaWxlO1xuXG4gICAgZnVuY3Rpb24gdmlzaXROb2RlKG5vZGU6IHRzLk5vZGUpIHtcbiAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICBjb25zdCBwYXJlbnQxID0gZmlsZUNvbnRleHQuc3ludGhldGljTm9kZVBhcmVudHMuZ2V0KG5vZGUpO1xuICAgICAgICBjb25zdCBwYXJlbnQyID0gcGFyZW50MSAmJiBmaWxlQ29udGV4dC5zeW50aGV0aWNOb2RlUGFyZW50cy5nZXQocGFyZW50MSk7XG4gICAgICAgIGNvbnN0IHBhcmVudDMgPSBwYXJlbnQyICYmIGZpbGVDb250ZXh0LnN5bnRoZXRpY05vZGVQYXJlbnRzLmdldChwYXJlbnQyKTtcblxuICAgICAgICBpZiAocGFyZW50MSAmJiBwYXJlbnQxLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbikge1xuICAgICAgICAgIC8vIFR5cGVTY3JpcHQgaWdub3JlcyBzeW50aGV0aWMgY29tbWVudHMgb24gKHN0YXRpYykgcHJvcGVydHkgZGVjbGFyYXRpb25zXG4gICAgICAgICAgLy8gd2l0aCBpbml0aWFsaXplcnMuXG4gICAgICAgICAgLy8gZmluZCB0aGUgcGFyZW50IEV4cHJlc3Npb25TdGF0ZW1lbnQgbGlrZSBNeUNsYXNzLmZvbyA9IC4uLlxuICAgICAgICAgIGNvbnN0IGV4cHJlc3Npb25TdG10ID1cbiAgICAgICAgICAgICAgbGFzdE5vZGVXaXRoKG5vZGVQYXRoLCAobm9kZSkgPT4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpO1xuICAgICAgICAgIGlmIChleHByZXNzaW9uU3RtdCkge1xuICAgICAgICAgICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKFxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb25TdG10LCB0cy5nZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMocGFyZW50MSkgfHwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHBhcmVudDMgJiYgcGFyZW50My5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50ICYmXG4gICAgICAgICAgICBoYXNNb2RpZmllckZsYWcocGFyZW50MywgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpKSB7XG4gICAgICAgICAgLy8gVHlwZVNjcmlwdCBpZ25vcmVzIHN5bnRoZXRpYyBjb21tZW50cyBvbiBleHBvcnRlZCB2YXJpYWJsZXMuXG4gICAgICAgICAgLy8gZmluZCB0aGUgcGFyZW50IEV4cHJlc3Npb25TdGF0ZW1lbnQgbGlrZSBleHBvcnRzLmZvbyA9IC4uLlxuICAgICAgICAgIGNvbnN0IGV4cHJlc3Npb25TdG10ID1cbiAgICAgICAgICAgICAgbGFzdE5vZGVXaXRoKG5vZGVQYXRoLCAobm9kZSkgPT4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpO1xuICAgICAgICAgIGlmIChleHByZXNzaW9uU3RtdCkge1xuICAgICAgICAgICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKFxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb25TdG10LCB0cy5nZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMocGFyZW50MykgfHwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gVHlwZVNjcmlwdCBpZ25vcmVzIHN5bnRoZXRpYyBjb21tZW50cyBvbiByZWV4cG9ydCAvIGltcG9ydCBzdGF0ZW1lbnRzLlxuICAgICAgY29uc3QgbW9kdWxlTmFtZSA9IGV4dHJhY3RNb2R1bGVOYW1lRnJvbVJlcXVpcmVWYXJpYWJsZVN0YXRlbWVudChub2RlKTtcbiAgICAgIGlmIChtb2R1bGVOYW1lICYmIGZpbGVDb250ZXh0LmltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbnMpIHtcbiAgICAgICAgLy8gTG9jYXRlIHRoZSBvcmlnaW5hbCBpbXBvcnQvZXhwb3J0IGRlY2xhcmF0aW9uIHZpYSB0aGVcbiAgICAgICAgLy8gdGV4dCByYW5nZS5cbiAgICAgICAgY29uc3QgaW1wb3J0T3JSZWV4cG9ydERlY2xhcmF0aW9uID1cbiAgICAgICAgICAgIGZpbGVDb250ZXh0LmltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbnMuZmluZChpZWQgPT4gaWVkLnBvcyA9PT0gbm9kZS5wb3MpO1xuICAgICAgICBpZiAoaW1wb3J0T3JSZWV4cG9ydERlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKFxuICAgICAgICAgICAgICBub2RlLCB0cy5nZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoaW1wb3J0T3JSZWV4cG9ydERlY2xhcmF0aW9uKSB8fCBbXSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTmVlZCB0byBjbGVhciB0aGUgdGV4dFJhbmdlIGZvciBJbXBvcnREZWNsYXJhdGlvbiAvIEV4cG9ydERlY2xhcmF0aW9uIGFzXG4gICAgICAgIC8vIG90aGVyd2lzZSBUeXBlU2NyaXB0IHdvdWxkIGVtaXQgdGhlIG9yaWdpbmFsIGNvbW1lbnRzIGV2ZW4gaWYgd2Ugc2V0IHRoZVxuICAgICAgICAvLyB0cy5FbWl0RmxhZy5Ob0NvbW1lbnRzLiAoc2VlIGFsc28gcmVzZXROb2RlVGV4dFJhbmdlVG9QcmV2ZW50RHVwbGljYXRlQ29tbWVudHMgYmVsb3cpXG4gICAgICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKG5vZGUsIHtwb3M6IG5vZGUucG9zLCBlbmQ6IG5vZGUuZW5kfSk7XG4gICAgICAgIHRzLnNldFRleHRSYW5nZShub2RlLCB7cG9zOiAtMSwgZW5kOiAtMX0pO1xuICAgICAgfVxuICAgICAgbm9kZVBhdGgucHVzaChub2RlKTtcbiAgICAgIG5vZGUuZm9yRWFjaENoaWxkKHZpc2l0Tm9kZSk7XG4gICAgICBub2RlUGF0aC5wb3AoKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RNb2R1bGVOYW1lRnJvbVJlcXVpcmVWYXJpYWJsZVN0YXRlbWVudChub2RlOiB0cy5Ob2RlKTogc3RyaW5nfG51bGwge1xuICBpZiAobm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgdmFyU3RtdCA9IG5vZGUgYXMgdHMuVmFyaWFibGVTdGF0ZW1lbnQ7XG4gIGNvbnN0IGRlY2xzID0gdmFyU3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zO1xuICBsZXQgaW5pdDogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQ7XG4gIGlmIChkZWNscy5sZW5ndGggIT09IDEgfHwgIShpbml0ID0gZGVjbHNbMF0uaW5pdGlhbGl6ZXIpIHx8XG4gICAgICBpbml0LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBjYWxsRXhwciA9IGluaXQgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gIGlmIChjYWxsRXhwci5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllciB8fFxuICAgICAgKGNhbGxFeHByLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikudGV4dCAhPT0gJ3JlcXVpcmUnIHx8XG4gICAgICBjYWxsRXhwci5hcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgbW9kdWxlRXhwciA9IGNhbGxFeHByLmFyZ3VtZW50c1swXTtcbiAgaWYgKG1vZHVsZUV4cHIua2luZCAhPT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIChtb2R1bGVFeHByIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG59XG5cbmZ1bmN0aW9uIGxhc3ROb2RlV2l0aChub2RlczogdHMuTm9kZVtdLCBwcmVkaWNhdGU6IChub2RlOiB0cy5Ob2RlKSA9PiBib29sZWFuKTogdHMuTm9kZXxudWxsIHtcbiAgZm9yIChsZXQgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgIGlmIChwcmVkaWNhdGUobm9kZSkpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGNvbW1lbnQgdGV4dCByYW5nZXMgYmVmb3JlIGFuZCBhZnRlciBhIG5vZGVcbiAqIGludG8gdHMuU3ludGhlc2l6ZWRDb21tZW50cyBmb3IgdGhlIG5vZGUgYW5kIHByZXZlbnQgdGhlXG4gKiBjb21tZW50IHRleHQgcmFuZ2VzIHRvIGJlIGVtaXR0ZWQsIHRvIGFsbG93XG4gKiBjaGFuZ2luZyB0aGVzZSBjb21tZW50cy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIGEgdmlzaXRvciB0byBiZSBhYmxlIHRvIGRvIHNvbWVcbiAqIHN0YXRlIG1hbmFnZW1lbnQgYWZ0ZXIgdGhlIGNhbGxlciBpcyBkb25lIGNoYW5naW5nIGEgbm9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0Tm9kZVdpdGhTeW50aGVzaXplZENvbW1lbnRzPFQgZXh0ZW5kcyB0cy5Ob2RlPihcbiAgICBjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IFQsXG4gICAgdmlzaXRvcjogKG5vZGU6IFQpID0+IFQpOiBUIHtcbiAgaWYgKG5vZGUuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQpIHtcbiAgICByZXR1cm4gdmlzaXRvcihub2RlKTtcbiAgfVxuICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkJsb2NrKSB7XG4gICAgY29uc3QgYmxvY2sgPSBub2RlIGFzIHRzLk5vZGUgYXMgdHMuQmxvY2s7XG4gICAgbm9kZSA9IHZpc2l0Tm9kZVN0YXRlbWVudHNXaXRoU3ludGhlc2l6ZWRDb21tZW50cyhcbiAgICAgICAgY29udGV4dCwgc291cmNlRmlsZSwgbm9kZSwgYmxvY2suc3RhdGVtZW50cyxcbiAgICAgICAgKG5vZGUsIHN0bXRzKSA9PiB2aXNpdG9yKHRzLnVwZGF0ZUJsb2NrKGJsb2NrLCBzdG10cykgYXMgdHMuTm9kZSBhcyBUKSk7XG4gIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUpIHtcbiAgICBub2RlID0gdmlzaXROb2RlU3RhdGVtZW50c1dpdGhTeW50aGVzaXplZENvbW1lbnRzKFxuICAgICAgICBjb250ZXh0LCBzb3VyY2VGaWxlLCBub2RlLCBzb3VyY2VGaWxlLnN0YXRlbWVudHMsXG4gICAgICAgIChub2RlLCBzdG10cykgPT4gdmlzaXRvcih1cGRhdGVTb3VyY2VGaWxlTm9kZShzb3VyY2VGaWxlLCBzdG10cykgYXMgdHMuTm9kZSBhcyBUKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZmlsZUNvbnRleHQgPSBhc3NlcnRGaWxlQ29udGV4dChjb250ZXh0LCBzb3VyY2VGaWxlKTtcbiAgICBjb25zdCBsZWFkaW5nTGFzdENvbW1lbnRFbmQgPVxuICAgICAgICBzeW50aGVzaXplTGVhZGluZ0NvbW1lbnRzKHNvdXJjZUZpbGUsIG5vZGUsIGZpbGVDb250ZXh0Lmxhc3RDb21tZW50RW5kKTtcbiAgICBjb25zdCB0cmFpbGluZ0xhc3RDb21tZW50RW5kID0gc3ludGhlc2l6ZVRyYWlsaW5nQ29tbWVudHMoc291cmNlRmlsZSwgbm9kZSk7XG4gICAgaWYgKGxlYWRpbmdMYXN0Q29tbWVudEVuZCAhPT0gLTEpIHtcbiAgICAgIGZpbGVDb250ZXh0Lmxhc3RDb21tZW50RW5kID0gbGVhZGluZ0xhc3RDb21tZW50RW5kO1xuICAgIH1cbiAgICBub2RlID0gdmlzaXRvcihub2RlKTtcbiAgICBpZiAodHJhaWxpbmdMYXN0Q29tbWVudEVuZCAhPT0gLTEpIHtcbiAgICAgIGZpbGVDb250ZXh0Lmxhc3RDb21tZW50RW5kID0gdHJhaWxpbmdMYXN0Q29tbWVudEVuZDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc2V0Tm9kZVRleHRSYW5nZVRvUHJldmVudER1cGxpY2F0ZUNvbW1lbnRzKG5vZGUpO1xufVxuXG4vKipcbiAqIFJlc2V0IHRoZSB0ZXh0IHJhbmdlIGZvciBzb21lIHNwZWNpYWwgbm9kZXMgYXMgb3RoZXJ3aXNlIFR5cGVTY3JpcHRcbiAqIHdvdWxkIGFsd2F5cyBlbWl0IHRoZSBvcmlnaW5hbCBjb21tZW50cyBmb3IgdGhlbS5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTk0XG4gKlxuICogQHBhcmFtIG5vZGVcbiAqL1xuZnVuY3Rpb24gcmVzZXROb2RlVGV4dFJhbmdlVG9QcmV2ZW50RHVwbGljYXRlQ29tbWVudHM8VCBleHRlbmRzIHRzLk5vZGU+KG5vZGU6IFQpOiBUIHtcbiAgdHMuc2V0RW1pdEZsYWdzKG5vZGUsICh0cy5nZXRFbWl0RmxhZ3Mobm9kZSkgfHwgMCkgfCB0cy5FbWl0RmxhZ3MuTm9Db21tZW50cyk7XG4gIC8vIFNlZSBhbHNvIGFkZFN5bnRoZXRpY0NvbW1lbnRzQWZ0ZXJUc1RyYW5zZm9ybWVyLlxuICAvLyBOb3RlOiBEb24ndCByZXNldCB0aGUgdGV4dFJhbmdlIGZvciB0cy5FeHBvcnREZWNsYXJhdGlvbiAvIHRzLkltcG9ydERlY2xhcmF0aW9uXG4gIC8vIHVudGlsIGFmdGVyIHRoZSBUeXBlU2NyaXB0IHRyYW5zZm9ybWVyIGFzIHdlIG5lZWQgdGhlIHNvdXJjZSBsb2NhdGlvblxuICAvLyB0byBtYXAgdGhlIGdlbmVyYXRlZCBgcmVxdWlyZWAgY2FsbHMgYmFjayB0byB0aGUgb3JpZ2luYWxcbiAgLy8gdHMuRXhwb3J0RGVjbGFyYXRpb24gLyB0cy5JbXBvcnREZWNsYXJhdGlvbiBub2Rlcy5cbiAgbGV0IGFsbG93VGV4dFJhbmdlID0gbm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24gJiZcbiAgICAgIG5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uICYmXG4gICAgICAhKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCAmJlxuICAgICAgICBoYXNNb2RpZmllckZsYWcobm9kZSwgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpKTtcbiAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uKSB7XG4gICAgYWxsb3dUZXh0UmFuZ2UgPSBmYWxzZTtcbiAgICBjb25zdCBwZCA9IG5vZGUgYXMgdHMuTm9kZSBhcyB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uO1xuICAgIG5vZGUgPSB0cy51cGRhdGVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgIHBkLCBwZC5kZWNvcmF0b3JzLCBwZC5tb2RpZmllcnMsIHJlc2V0VGV4dFJhbmdlKHBkLm5hbWUpIGFzIHRzLlByb3BlcnR5TmFtZSxcbiAgICAgICAgICAgICAgIHBkLnF1ZXN0aW9uVG9rZW4sIHBkLnR5cGUsIHBkLmluaXRpYWxpemVyKSBhcyB0cy5Ob2RlIGFzIFQ7XG4gIH1cbiAgaWYgKCFhbGxvd1RleHRSYW5nZSkge1xuICAgIG5vZGUgPSByZXNldFRleHRSYW5nZShub2RlKTtcbiAgfVxuICByZXR1cm4gbm9kZTtcblxuICBmdW5jdGlvbiByZXNldFRleHRSYW5nZTxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCk6IFQge1xuICAgIGlmICghKG5vZGUuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQpKSB7XG4gICAgICAvLyBuZWVkIHRvIGNsb25lIGFzIHdlIGRvbid0IHdhbnQgdG8gbW9kaWZ5IHNvdXJjZSBub2RlcyxcbiAgICAgIC8vIGFzIHRoZSBwYXJzZWQgU291cmNlRmlsZXMgY291bGQgYmUgY2FjaGVkIVxuICAgICAgbm9kZSA9IHRzLmdldE11dGFibGVDbG9uZShub2RlKTtcbiAgICB9XG4gICAgY29uc3QgdGV4dFJhbmdlID0ge3Bvczogbm9kZS5wb3MsIGVuZDogbm9kZS5lbmR9O1xuICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKG5vZGUsIHRleHRSYW5nZSk7XG4gICAgdHMuc2V0VGV4dFJhbmdlKG5vZGUsIHtwb3M6IC0xLCBlbmQ6IC0xfSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkcyBpbiB0aGUgbGVhZGluZyBjb21tZW50IHRleHQgcmFuZ2VzIG9mIHRoZSBnaXZlbiBub2RlLFxuICogY29udmVydHMgdGhlbSBpbnRvIGB0cy5TeW50aGV0aWNDb21tZW50YHMgYW5kIHN0b3JlcyB0aGVtIG9uIHRoZSBub2RlLlxuICpcbiAqIE5vdGU6IFRoaXMgd291bGQgYmUgZ3JlYXRseSBzaW1wbGlmaWVkIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzYxNS5cbiAqXG4gKiBAcGFyYW0gbGFzdENvbW1lbnRFbmQgVGhlIGVuZCBvZiB0aGUgbGFzdCBjb21tZW50XG4gKiBAcmV0dXJuIFRoZSBlbmQgb2YgdGhlIGxhc3QgZm91bmQgY29tbWVudCwgLTEgaWYgbm8gY29tbWVudCB3YXMgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVMZWFkaW5nQ29tbWVudHMoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZTogdHMuTm9kZSwgbGFzdENvbW1lbnRFbmQ6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xuICBjb25zdCBzaGFyZXNTdGFydFdpdGhQYXJlbnQgPSBwYXJlbnQgJiYgcGFyZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQmxvY2sgJiZcbiAgICAgIHBhcmVudC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUgJiYgcGFyZW50LmdldEZ1bGxTdGFydCgpID09PSBub2RlLmdldEZ1bGxTdGFydCgpO1xuICBpZiAoc2hhcmVzU3RhcnRXaXRoUGFyZW50IHx8IGxhc3RDb21tZW50RW5kID49IG5vZGUuZ2V0U3RhcnQoKSkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCBhZGp1c3RlZE5vZGVGdWxsU3RhcnQgPSBNYXRoLm1heChsYXN0Q29tbWVudEVuZCwgbm9kZS5nZXRGdWxsU3RhcnQoKSk7XG4gIGNvbnN0IGxlYWRpbmdDb21tZW50cyA9XG4gICAgICBnZXRBbGxMZWFkaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBhZGp1c3RlZE5vZGVGdWxsU3RhcnQsIG5vZGUuZ2V0U3RhcnQoKSk7XG4gIGlmIChsZWFkaW5nQ29tbWVudHMgJiYgbGVhZGluZ0NvbW1lbnRzLmxlbmd0aCkge1xuICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhub2RlLCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBsZWFkaW5nQ29tbWVudHMpKTtcbiAgICByZXR1cm4gbm9kZS5nZXRTdGFydCgpO1xuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBSZWFkcyBpbiB0aGUgdHJhaWxpbmcgY29tbWVudCB0ZXh0IHJhbmdlcyBvZiB0aGUgZ2l2ZW4gbm9kZSxcbiAqIGNvbnZlcnRzIHRoZW0gaW50byBgdHMuU3ludGhldGljQ29tbWVudGBzIGFuZCBzdG9yZXMgdGhlbSBvbiB0aGUgbm9kZS5cbiAqXG4gKiBOb3RlOiBUaGlzIHdvdWxkIGJlIGdyZWF0bHkgc2ltcGxpZmllZCB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTc2MTUuXG4gKlxuICogQHJldHVybiBUaGUgZW5kIG9mIHRoZSBsYXN0IGZvdW5kIGNvbW1lbnQsIC0xIGlmIG5vIGNvbW1lbnQgd2FzIGZvdW5kLlxuICovXG5mdW5jdGlvbiBzeW50aGVzaXplVHJhaWxpbmdDb21tZW50cyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiB0cy5Ob2RlKTogbnVtYmVyIHtcbiAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XG4gIGNvbnN0IHNoYXJlc0VuZFdpdGhQYXJlbnQgPSBwYXJlbnQgJiYgcGFyZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQmxvY2sgJiZcbiAgICAgIHBhcmVudC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUgJiYgcGFyZW50LmdldEVuZCgpID09PSBub2RlLmdldEVuZCgpO1xuICBpZiAoc2hhcmVzRW5kV2l0aFBhcmVudCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCB0cmFpbGluZ0NvbW1lbnRzID0gdHMuZ2V0VHJhaWxpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUudGV4dCwgbm9kZS5nZXRFbmQoKSk7XG4gIGlmICh0cmFpbGluZ0NvbW1lbnRzICYmIHRyYWlsaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgdHMuc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhub2RlLCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCB0cmFpbGluZ0NvbW1lbnRzKSk7XG4gICAgcmV0dXJuIHRyYWlsaW5nQ29tbWVudHNbdHJhaWxpbmdDb21tZW50cy5sZW5ndGggLSAxXS5lbmQ7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBhcnJheU9mPFQ+KHZhbHVlOiBUfHVuZGVmaW5lZHxudWxsKTogVFtdIHtcbiAgcmV0dXJuIHZhbHVlID8gW3ZhbHVlXSA6IFtdO1xufVxuXG4vKipcbiAqIENvbnZlcnQgbGVhZGluZy90cmFpbGluZyBkZXRhY2hlZCBjb21tZW50IHJhbmdlcyBvZiBzdGF0ZW1lbnQgYXJyYXlzXG4gKiAoZS5nLiB0aGUgc3RhdGVtZW50cyBvZiBhIHRzLlNvdXJjZUZpbGUgb3IgdHMuQmxvY2spIGludG9cbiAqIGB0cy5Ob25FbWl0dGVkU3RhdGVtZW50YHMgd2l0aCBgdHMuU3ludGhlc2l6ZWRDb21tZW50YHMgYW5kXG4gKiBwcmVwZW5kcyAvIGFwcGVuZHMgdGhlbSB0byB0aGUgZ2l2ZW4gc3RhdGVtZW50IGFycmF5LlxuICogVGhpcyBpcyBuZWVkZWQgdG8gYWxsb3cgY2hhbmdpbmcgdGhlc2UgY29tbWVudHMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB0YWtlcyBhIHZpc2l0b3IgdG8gYmUgYWJsZSB0byBkbyBzb21lXG4gKiBzdGF0ZSBtYW5hZ2VtZW50IGFmdGVyIHRoZSBjYWxsZXIgaXMgZG9uZSBjaGFuZ2luZyBhIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIHZpc2l0Tm9kZVN0YXRlbWVudHNXaXRoU3ludGhlc2l6ZWRDb21tZW50czxUIGV4dGVuZHMgdHMuTm9kZT4oXG4gICAgY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0LCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiBULFxuICAgIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+LFxuICAgIHZpc2l0b3I6IChub2RlOiBULCBzdGF0ZW1lbnRzOiB0cy5Ob2RlQXJyYXk8dHMuU3RhdGVtZW50PikgPT4gVCk6IFQge1xuICBjb25zdCBsZWFkaW5nID0gc3ludGhlc2l6ZURldGFjaGVkTGVhZGluZ0NvbW1lbnRzKHNvdXJjZUZpbGUsIG5vZGUsIHN0YXRlbWVudHMpO1xuICBjb25zdCB0cmFpbGluZyA9IHN5bnRoZXNpemVEZXRhY2hlZFRyYWlsaW5nQ29tbWVudHMoc291cmNlRmlsZSwgbm9kZSwgc3RhdGVtZW50cyk7XG4gIGlmIChsZWFkaW5nLmNvbW1lbnRTdG10IHx8IHRyYWlsaW5nLmNvbW1lbnRTdG10KSB7XG4gICAgY29uc3QgbmV3U3RhdGVtZW50czogdHMuU3RhdGVtZW50W10gPVxuICAgICAgICBbLi4uYXJyYXlPZihsZWFkaW5nLmNvbW1lbnRTdG10KSwgLi4uc3RhdGVtZW50cywgLi4uYXJyYXlPZih0cmFpbGluZy5jb21tZW50U3RtdCldO1xuICAgIHN0YXRlbWVudHMgPSB0cy5zZXRUZXh0UmFuZ2UodHMuY3JlYXRlTm9kZUFycmF5KG5ld1N0YXRlbWVudHMpLCB7cG9zOiAtMSwgZW5kOiAtMX0pO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHZpc2l0b3IgY3JlYXRlcyBhIG5ldyBub2RlIHdpdGggdGhlIG5ldyBzdGF0ZW1lbnRzLiBIb3dldmVyLCBkb2luZyBzb1xuICAgICAqIHJldmVhbHMgYSBUeXBlU2NyaXB0IGJ1Zy5cbiAgICAgKiBUbyByZXByb2R1Y2UgY29tbWVudCBvdXQgdGhlIGxpbmUgYmVsb3cgYW5kIGNvbXBpbGU6XG4gICAgICpcbiAgICAgKiAvLyAuLi4uLi5cbiAgICAgKlxuICAgICAqIGFic3RyYWN0IGNsYXNzIEEge1xuICAgICAqIH1cbiAgICAgKiBhYnN0cmFjdCBjbGFzcyBCIGV4dGVuZHMgQSB7XG4gICAgICogICAvLyAuLi4uLi5cbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgbmV3bGluZXMgYXJlIHNpZ25pZmljYW50LiBUaGlzIHdvdWxkIHJlc3VsdCBpbiB0aGUgZm9sbG93aW5nOlxuICAgICAqIHJ1bnRpbWUgZXJyb3IgXCJUeXBlRXJyb3I6IENhbm5vdCByZWFkIHByb3BlcnR5ICdtZW1iZXJzJyBvZiB1bmRlZmluZWRcIi5cbiAgICAgKlxuICAgICAqIFRoZSBsaW5lIGJlbG93IGlzIGEgd29ya2Fyb3VuZCB0aGF0IGVuc3VyZXMgdGhhdCB1cGRhdGVTb3VyY2VGaWxlTm9kZSBhbmRcbiAgICAgKiB1cGRhdGVCbG9jayBuZXZlciBjcmVhdGUgbmV3IE5vZGVzLlxuICAgICAqIFRPRE8oIzYzNCk6IGZpbGUgYSBidWcgd2l0aCBUUyB0ZWFtLlxuICAgICAqL1xuICAgIChub2RlIGFzIHRzLk5vZGUgYXMgdHMuU291cmNlRmlsZSkuc3RhdGVtZW50cyA9IHN0YXRlbWVudHM7XG5cbiAgICBjb25zdCBmaWxlQ29udGV4dCA9IGFzc2VydEZpbGVDb250ZXh0KGNvbnRleHQsIHNvdXJjZUZpbGUpO1xuICAgIGlmIChsZWFkaW5nLmxhc3RDb21tZW50RW5kICE9PSAtMSkge1xuICAgICAgZmlsZUNvbnRleHQubGFzdENvbW1lbnRFbmQgPSBsZWFkaW5nLmxhc3RDb21tZW50RW5kO1xuICAgIH1cbiAgICBub2RlID0gdmlzaXRvcihub2RlLCBzdGF0ZW1lbnRzKTtcbiAgICBpZiAodHJhaWxpbmcubGFzdENvbW1lbnRFbmQgIT09IC0xKSB7XG4gICAgICBmaWxlQ29udGV4dC5sYXN0Q29tbWVudEVuZCA9IHRyYWlsaW5nLmxhc3RDb21tZW50RW5kO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICByZXR1cm4gdmlzaXRvcihub2RlLCBzdGF0ZW1lbnRzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGxlYWRpbmcgZGV0YWNoZWQgY29tbWVudCByYW5nZXMgb2Ygc3RhdGVtZW50IGFycmF5c1xuICogKGUuZy4gdGhlIHN0YXRlbWVudHMgb2YgYSB0cy5Tb3VyY2VGaWxlIG9yIHRzLkJsb2NrKSBpbnRvIGFcbiAqIGB0cy5Ob25FbWl0dGVkU3RhdGVtZW50YCB3aXRoIGB0cy5TeW50aGVzaXplZENvbW1lbnRgcy5cbiAqXG4gKiBBIERldGFjaGVkIGxlYWRpbmcgY29tbWVudCBpcyB0aGUgZmlyc3QgY29tbWVudCBpbiBhIFNvdXJjZUZpbGUgLyBCbG9ja1xuICogdGhhdCBpcyBzZXBhcmF0ZWQgd2l0aCBhIG5ld2xpbmUgZnJvbSB0aGUgZmlyc3Qgc3RhdGVtZW50LlxuICpcbiAqIE5vdGU6IFRoaXMgd291bGQgYmUgZ3JlYXRseSBzaW1wbGlmaWVkIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzYxNS5cbiAqL1xuZnVuY3Rpb24gc3ludGhlc2l6ZURldGFjaGVkTGVhZGluZ0NvbW1lbnRzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IHRzLk5vZGUsIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+KTpcbiAgICB7Y29tbWVudFN0bXQ6IHRzLlN0YXRlbWVudHxudWxsLCBsYXN0Q29tbWVudEVuZDogbnVtYmVyfSB7XG4gIGxldCB0cml2aWFFbmQgPSBzdGF0ZW1lbnRzLmVuZDtcbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoKSB7XG4gICAgdHJpdmlhRW5kID0gc3RhdGVtZW50c1swXS5nZXRTdGFydCgpO1xuICB9XG4gIGNvbnN0IGRldGFjaGVkQ29tbWVudHMgPSBnZXREZXRhY2hlZExlYWRpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUsIHN0YXRlbWVudHMucG9zLCB0cml2aWFFbmQpO1xuICBpZiAoIWRldGFjaGVkQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtjb21tZW50U3RtdDogbnVsbCwgbGFzdENvbW1lbnRFbmQ6IC0xfTtcbiAgfVxuICBjb25zdCBsYXN0Q29tbWVudEVuZCA9IGRldGFjaGVkQ29tbWVudHNbZGV0YWNoZWRDb21tZW50cy5sZW5ndGggLSAxXS5lbmQ7XG4gIGNvbnN0IGNvbW1lbnRTdG10ID0gY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlKTtcbiAgdHMuc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhcbiAgICAgIGNvbW1lbnRTdG10LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBkZXRhY2hlZENvbW1lbnRzKSk7XG4gIHJldHVybiB7Y29tbWVudFN0bXQsIGxhc3RDb21tZW50RW5kfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHRyYWlsaW5nIGRldGFjaGVkIGNvbW1lbnQgcmFuZ2VzIG9mIHN0YXRlbWVudCBhcnJheXNcbiAqIChlLmcuIHRoZSBzdGF0ZW1lbnRzIG9mIGEgdHMuU291cmNlRmlsZSBvciB0cy5CbG9jaykgaW50byBhXG4gKiBgdHMuTm9uRW1pdHRlZFN0YXRlbWVudGAgd2l0aCBgdHMuU3ludGhlc2l6ZWRDb21tZW50YHMuXG4gKlxuICogQSBEZXRhY2hlZCB0cmFpbGluZyBjb21tZW50IGFyZSBhbGwgY29tbWVudHMgYWZ0ZXIgdGhlIGZpcnN0IG5ld2xpbmVcbiAqIHRoZSBmb2xsb3dzIHRoZSBsYXN0IHN0YXRlbWVudCBpbiBhIFNvdXJjZUZpbGUgLyBCbG9jay5cbiAqXG4gKiBOb3RlOiBUaGlzIHdvdWxkIGJlIGdyZWF0bHkgc2ltcGxpZmllZCB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTc2MTUuXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVEZXRhY2hlZFRyYWlsaW5nQ29tbWVudHMoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZTogdHMuTm9kZSwgc3RhdGVtZW50czogdHMuTm9kZUFycmF5PHRzLlN0YXRlbWVudD4pOlxuICAgIHtjb21tZW50U3RtdDogdHMuU3RhdGVtZW50fG51bGwsIGxhc3RDb21tZW50RW5kOiBudW1iZXJ9IHtcbiAgbGV0IHRyYWlsaW5nQ29tbWVudFN0YXJ0ID0gc3RhdGVtZW50cy5lbmQ7XG4gIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGxhc3RTdG10ID0gc3RhdGVtZW50c1tzdGF0ZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGxhc3RTdG10VHJhaWxpbmdDb21tZW50cyA9IHRzLmdldFRyYWlsaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLnRleHQsIGxhc3RTdG10LmVuZCk7XG4gICAgaWYgKGxhc3RTdG10VHJhaWxpbmdDb21tZW50cyAmJiBsYXN0U3RtdFRyYWlsaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgICB0cmFpbGluZ0NvbW1lbnRTdGFydCA9IGxhc3RTdG10VHJhaWxpbmdDb21tZW50c1tsYXN0U3RtdFRyYWlsaW5nQ29tbWVudHMubGVuZ3RoIC0gMV0uZW5kO1xuICAgIH1cbiAgfVxuICBjb25zdCBkZXRhY2hlZENvbW1lbnRzID0gZ2V0QWxsTGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgdHJhaWxpbmdDb21tZW50U3RhcnQsIG5vZGUuZW5kKTtcbiAgaWYgKCFkZXRhY2hlZENvbW1lbnRzIHx8ICFkZXRhY2hlZENvbW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB7Y29tbWVudFN0bXQ6IG51bGwsIGxhc3RDb21tZW50RW5kOiAtMX07XG4gIH1cbiAgY29uc3QgbGFzdENvbW1lbnRFbmQgPSBkZXRhY2hlZENvbW1lbnRzW2RldGFjaGVkQ29tbWVudHMubGVuZ3RoIC0gMV0uZW5kO1xuICBjb25zdCBjb21tZW50U3RtdCA9IGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQoc291cmNlRmlsZSk7XG4gIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhcbiAgICAgIGNvbW1lbnRTdG10LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBkZXRhY2hlZENvbW1lbnRzKSk7XG4gIHJldHVybiB7Y29tbWVudFN0bXQsIGxhc3RDb21tZW50RW5kfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSB0aGUgZGV0YWNoZWQgbGVhZGluZyBjb21tZW50IHJhbmdlcyBpbiBhbiBhcmVhIG9mIGEgU291cmNlRmlsZS5cbiAqIEBwYXJhbSBzb3VyY2VGaWxlIFRoZSBzb3VyY2UgZmlsZVxuICogQHBhcmFtIHN0YXJ0IFdoZXJlIHRvIHN0YXJ0IHNjYW5uaW5nXG4gKiBAcGFyYW0gZW5kIFdoZXJlIHRvIGVuZCBzY2FubmluZ1xuICovXG4vLyBOb3RlOiBUaGlzIGNvZGUgaXMgYmFzZWQgb24gY29tcGlsZXIvY29tbWVudHMudHMgaW4gVHlwZVNjcmlwdFxuZnVuY3Rpb24gZ2V0RGV0YWNoZWRMZWFkaW5nQ29tbWVudFJhbmdlcyhcbiAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IHRzLkNvbW1lbnRSYW5nZVtdIHtcbiAgY29uc3QgbGVhZGluZ0NvbW1lbnRzID0gZ2V0QWxsTGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgc3RhcnQsIGVuZCk7XG4gIGlmICghbGVhZGluZ0NvbW1lbnRzIHx8ICFsZWFkaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGRldGFjaGVkQ29tbWVudHM6IHRzLkNvbW1lbnRSYW5nZVtdID0gW107XG4gIGxldCBsYXN0Q29tbWVudDogdHMuQ29tbWVudFJhbmdlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGNvbnN0IGNvbW1lbnQgb2YgbGVhZGluZ0NvbW1lbnRzKSB7XG4gICAgaWYgKGxhc3RDb21tZW50KSB7XG4gICAgICBjb25zdCBsYXN0Q29tbWVudExpbmUgPSBnZXRMaW5lT2ZQb3Moc291cmNlRmlsZSwgbGFzdENvbW1lbnQuZW5kKTtcbiAgICAgIGNvbnN0IGNvbW1lbnRMaW5lID0gZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGNvbW1lbnQucG9zKTtcblxuICAgICAgaWYgKGNvbW1lbnRMaW5lID49IGxhc3RDb21tZW50TGluZSArIDIpIHtcbiAgICAgICAgLy8gVGhlcmUgd2FzIGEgYmxhbmsgbGluZSBiZXR3ZWVuIHRoZSBsYXN0IGNvbW1lbnQgYW5kIHRoaXMgY29tbWVudC4gIFRoaXNcbiAgICAgICAgLy8gY29tbWVudCBpcyBub3QgcGFydCBvZiB0aGUgY29weXJpZ2h0IGNvbW1lbnRzLiAgUmV0dXJuIHdoYXQgd2UgaGF2ZSBzb1xuICAgICAgICAvLyBmYXIuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRldGFjaGVkQ29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICBsYXN0Q29tbWVudCA9IGNvbW1lbnQ7XG4gIH1cblxuICBpZiAoZGV0YWNoZWRDb21tZW50cy5sZW5ndGgpIHtcbiAgICAvLyBBbGwgY29tbWVudHMgbG9vayBsaWtlIHRoZXkgY291bGQgaGF2ZSBiZWVuIHBhcnQgb2YgdGhlIGNvcHlyaWdodCBoZWFkZXIuICBNYWtlXG4gICAgLy8gc3VyZSB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgYmxhbmsgbGluZSBiZXR3ZWVuIGl0IGFuZCB0aGUgbm9kZS4gIElmIG5vdCwgaXQncyBub3RcbiAgICAvLyBhIGNvcHlyaWdodCBoZWFkZXIuXG4gICAgY29uc3QgbGFzdENvbW1lbnRMaW5lID1cbiAgICAgICAgZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGRldGFjaGVkQ29tbWVudHNbZGV0YWNoZWRDb21tZW50cy5sZW5ndGggLSAxXS5lbmQpO1xuICAgIGNvbnN0IG5vZGVMaW5lID0gZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGVuZCk7XG4gICAgaWYgKG5vZGVMaW5lID49IGxhc3RDb21tZW50TGluZSArIDIpIHtcbiAgICAgIC8vIFZhbGlkIGRldGFjaGVkQ29tbWVudHNcbiAgICAgIHJldHVybiBkZXRhY2hlZENvbW1lbnRzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGdldExpbmVPZlBvcyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBwb3M6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBwb3MpLmxpbmU7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHRzLkNvbW1lbnRSYW5nZWBzIGludG8gYHRzLlN5bnRoZXNpemVkQ29tbWVudGBzXG4gKiBAcGFyYW0gc291cmNlRmlsZVxuICogQHBhcmFtIHBhcnNlZENvbW1lbnRzXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVDb21tZW50UmFuZ2VzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHBhcnNlZENvbW1lbnRzOiB0cy5Db21tZW50UmFuZ2VbXSk6IHRzLlN5bnRoZXNpemVkQ29tbWVudFtdIHtcbiAgY29uc3Qgc3ludGhlc2l6ZWRDb21tZW50czogdHMuU3ludGhlc2l6ZWRDb21tZW50W10gPSBbXTtcbiAgcGFyc2VkQ29tbWVudHMuZm9yRWFjaCgoe2tpbmQsIHBvcywgZW5kLCBoYXNUcmFpbGluZ05ld0xpbmV9LCBjb21tZW50SWR4KSA9PiB7XG4gICAgbGV0IGNvbW1lbnRUZXh0ID0gc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhwb3MsIGVuZCkudHJpbSgpO1xuICAgIGlmIChraW5kID09PSB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEpIHtcbiAgICAgIGNvbW1lbnRUZXh0ID0gY29tbWVudFRleHQucmVwbGFjZSgvKF5cXC9cXCopfChcXCpcXC8kKS9nLCAnJyk7XG4gICAgfSBlbHNlIGlmIChraW5kID09PSB0cy5TeW50YXhLaW5kLlNpbmdsZUxpbmVDb21tZW50VHJpdmlhKSB7XG4gICAgICBpZiAoY29tbWVudFRleHQuc3RhcnRzV2l0aCgnLy8vJykpIHtcbiAgICAgICAgLy8gdHJpcHBsZS1zbGFzaCBjb21tZW50cyBhcmUgdHlwZXNjcmlwdCBzcGVjaWZpYywgaWdub3JlIHRoZW0gaW4gdGhlIG91dHB1dC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29tbWVudFRleHQgPSBjb21tZW50VGV4dC5yZXBsYWNlKC8oXlxcL1xcLykvZywgJycpO1xuICAgIH1cbiAgICBzeW50aGVzaXplZENvbW1lbnRzLnB1c2goe2tpbmQsIHRleHQ6IGNvbW1lbnRUZXh0LCBoYXNUcmFpbGluZ05ld0xpbmUsIHBvczogLTEsIGVuZDogLTF9KTtcbiAgfSk7XG4gIHJldHVybiBzeW50aGVzaXplZENvbW1lbnRzO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBub24gZW1pdHRlZCBzdGF0ZW1lbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBzdG9yZSBzeW50aGVzaXplZCBjb21tZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLk5vdEVtaXR0ZWRTdGF0ZW1lbnQge1xuICBjb25zdCBzdG10ID0gdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlKTtcbiAgdHMuc2V0T3JpZ2luYWxOb2RlKHN0bXQsIHVuZGVmaW5lZCk7XG4gIHRzLnNldFRleHRSYW5nZShzdG10LCB7cG9zOiAwLCBlbmQ6IDB9KTtcbiAgdHMuc2V0RW1pdEZsYWdzKHN0bXQsIHRzLkVtaXRGbGFncy5DdXN0b21Qcm9sb2d1ZSk7XG4gIHJldHVybiBzdG10O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxlYWRpbmcgY29tbWVudCByYW5nZXMgaW4gdGhlIHNvdXJjZSBmaWxlIHRoYXQgc3RhcnQgYXQgdGhlIGdpdmVuIHBvc2l0aW9uLlxuICogVGhpcyBpcyB0aGUgc2FtZSBhcyBgdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXNgLCBleGNlcHQgdGhhdCBpdCBkb2VzIG5vdCBza2lwXG4gKiBjb21tZW50cyBiZWZvcmUgdGhlIGZpcnN0IG5ld2xpbmUgaW4gdGhlIHJhbmdlLlxuICpcbiAqIEBwYXJhbSBzb3VyY2VGaWxlXG4gKiBAcGFyYW0gc3RhcnQgV2hlcmUgdG8gc3RhcnQgc2Nhbm5pbmdcbiAqIEBwYXJhbSBlbmQgV2hlcmUgdG8gZW5kIHNjYW5uaW5nXG4gKi9cbmZ1bmN0aW9uIGdldEFsbExlYWRpbmdDb21tZW50UmFuZ2VzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogdHMuQ29tbWVudFJhbmdlW10ge1xuICAvLyBleGV1dGUgdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMgd2l0aCBwb3MgPSAwIHNvIHRoYXQgaXQgZG9lcyBub3Qgc2tpcFxuICAvLyBjb21tZW50cyB1bnRpbCB0aGUgZmlyc3QgbmV3bGluZS5cbiAgY29uc3QgY29tbWVudFJhbmdlcyA9IHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUudGV4dC5zdWJzdHJpbmcoc3RhcnQsIGVuZCksIDApIHx8IFtdO1xuICByZXR1cm4gY29tbWVudFJhbmdlcy5tYXAoY3IgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzVHJhaWxpbmdOZXdMaW5lOiBjci5oYXNUcmFpbGluZ05ld0xpbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IGNyLmtpbmQgYXMgbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3M6IGNyLnBvcyArIHN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IGNyLmVuZCArIHN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG59XG5cbi8qKlxuICogVGhpcyBpcyBhIHZlcnNpb24gb2YgYHRzLnZpc2l0RWFjaENoaWxkYCB0aGF0IHdvcmtzIHRoYXQgY2FsbHMgb3VyIHZlcnNpb25cbiAqIG9mIGB1cGRhdGVTb3VyY2VGaWxlTm9kZWAsIHNvIHRoYXQgdHlwZXNjcmlwdCBkb2Vzbid0IGxvc2UgdHlwZSBpbmZvcm1hdGlvblxuICogZm9yIHByb3BlcnR5IGRlY29yYXRvcnMuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzM4NFxuICpcbiAqIEBwYXJhbSBzZlxuICogQHBhcmFtIHN0YXRlbWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RWFjaENoaWxkKFxuICAgIG5vZGU6IHRzLk5vZGUsIHZpc2l0b3I6IHRzLlZpc2l0b3IsIGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLk5vZGUge1xuICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUpIHtcbiAgICBjb25zdCBzZiA9IG5vZGUgYXMgdHMuU291cmNlRmlsZTtcbiAgICByZXR1cm4gdXBkYXRlU291cmNlRmlsZU5vZGUoc2YsIHRzLnZpc2l0TGV4aWNhbEVudmlyb25tZW50KHNmLnN0YXRlbWVudHMsIHZpc2l0b3IsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGEgdmVyc2lvbiBvZiBgdHMudXBkYXRlU291cmNlRmlsZU5vZGVgIHRoYXQgd29ya3NcbiAqIHdlbGwgd2l0aCBwcm9wZXJ0eSBkZWNvcmF0b3JzLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTczODRcbiAqIFRPRE8oIzYzNCk6IFRoaXMgaGFzIGJlZW4gZml4ZWQgaW4gVFMgMi41LiBJbnZlc3RpZ2F0ZSByZW1vdmFsLlxuICpcbiAqIEBwYXJhbSBzZlxuICogQHBhcmFtIHN0YXRlbWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNvdXJjZUZpbGVOb2RlKFxuICAgIHNmOiB0cy5Tb3VyY2VGaWxlLCBzdGF0ZW1lbnRzOiB0cy5Ob2RlQXJyYXk8dHMuU3RhdGVtZW50Pik6IHRzLlNvdXJjZUZpbGUge1xuICBpZiAoc3RhdGVtZW50cyA9PT0gc2Yuc3RhdGVtZW50cykge1xuICAgIHJldHVybiBzZjtcbiAgfVxuICAvLyBOb3RlOiBOZWVkIHRvIGNsb25lIHRoZSBvcmlnaW5hbCBmaWxlIChhbmQgbm90IHVzZSBgdHMudXBkYXRlU291cmNlRmlsZU5vZGVgKVxuICAvLyBhcyBvdGhlcndpc2UgVFMgZmFpbHMgd2hlbiByZXNvbHZpbmcgdHlwZXMgZm9yIGRlY29yYXRvcnMuXG4gIHNmID0gdHMuZ2V0TXV0YWJsZUNsb25lKHNmKTtcbiAgc2Yuc3RhdGVtZW50cyA9IHN0YXRlbWVudHM7XG4gIHJldHVybiBzZjtcbn1cblxuLy8gQ29waWVkIGZyb20gVHlwZVNjcmlwdFxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZU5vZGVLaW5kKGtpbmQ6IHRzLlN5bnRheEtpbmQpIHtcbiAgcmV0dXJuIChraW5kID49IHRzLlN5bnRheEtpbmQuRmlyc3RUeXBlTm9kZSAmJiBraW5kIDw9IHRzLlN5bnRheEtpbmQuTGFzdFR5cGVOb2RlKSB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5BbnlLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuTnVtYmVyS2V5d29yZCB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5PYmplY3RLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuQm9vbGVhbktleXdvcmQgfHxcbiAgICAgIGtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nS2V5d29yZCB8fCBraW5kID09PSB0cy5TeW50YXhLaW5kLlN5bWJvbEtleXdvcmQgfHxcbiAgICAgIGtpbmQgPT09IHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQgfHwga2luZCA9PT0gdHMuU3ludGF4S2luZC5Wb2lkS2V5d29yZCB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5VbmRlZmluZWRLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQgfHxcbiAgICAgIGtpbmQgPT09IHRzLlN5bnRheEtpbmQuTmV2ZXJLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvbldpdGhUeXBlQXJndW1lbnRzO1xufVxuIl19