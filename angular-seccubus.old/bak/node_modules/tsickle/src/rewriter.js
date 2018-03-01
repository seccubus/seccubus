/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
        define("tsickle/src/rewriter", ["require", "exports", "tsickle/src/fileoverview_comment_transformer", "tsickle/src/source_map_utils", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fileoverview_comment_transformer_1 = require("tsickle/src/fileoverview_comment_transformer");
    var source_map_utils_1 = require("tsickle/src/source_map_utils");
    var ts = require("tsickle/src/typescript");
    /**
     * A Rewriter manages iterating through a ts.SourceFile, copying input
     * to output while letting the subclass potentially alter some nodes
     * along the way by implementing maybeProcess().
     */
    var Rewriter = /** @class */ (function () {
        function Rewriter(file, sourceMapper) {
            if (sourceMapper === void 0) { sourceMapper = source_map_utils_1.NOOP_SOURCE_MAPPER; }
            this.file = file;
            this.sourceMapper = sourceMapper;
            this.output = [];
            /** Errors found while examining the code. */
            this.diagnostics = [];
            /** Current position in the output. */
            this.position = { line: 0, column: 0, position: 0 };
            /**
             * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
             * print statements.
             */
            this.indent = 0;
            /**
             * Skip emitting any code before the given offset. E.g. used to avoid emitting @fileoverview
             * comments twice.
             */
            this.skipCommentsUpToOffset = -1;
        }
        Rewriter.prototype.getOutput = function (prefix) {
            if (this.indent !== 0) {
                throw new Error('visit() failed to track nesting');
            }
            var out = this.output.join('');
            if (prefix) {
                // Insert prefix after any leading @fileoverview comments, so they still come first in the
                // file. This must not use file.getStart() (comment position in the input file), but rahter
                // check comments in the new output, as those (in particular for comments) are unrelated.
                var insertionIdx = 0;
                try {
                    for (var _a = __values(ts.getLeadingCommentRanges(out, 0) || []), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var cr = _b.value;
                        if (fileoverview_comment_transformer_1.isClosureFileoverviewComment(out.substring(cr.pos, cr.end))) {
                            insertionIdx = cr.end;
                            // Include space (in particular line breaks) after a @fileoverview comment; without the
                            // space seperating it, TypeScript might elide the emit.
                            while (insertionIdx < out.length && out[insertionIdx].match(/\s/))
                                insertionIdx++;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                out = out.substring(0, insertionIdx) + prefix + out.substring(insertionIdx);
                this.sourceMapper.shiftByOffset(prefix.length);
            }
            return {
                output: out,
                diagnostics: this.diagnostics,
            };
            var e_1, _c;
        };
        /**
         * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
         */
        Rewriter.prototype.visit = function (node) {
            // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
            this.indent++;
            try {
                if (!this.maybeProcess(node)) {
                    this.writeNode(node);
                }
            }
            catch (e) {
                if (!e.message)
                    e.message = 'Unhandled error in tsickle';
                e.message += "\n at " + ts.SyntaxKind[node.kind] + " in " + this.file.fileName + ":";
                var _a = this.file.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
                e.message += line + 1 + ":" + (character + 1);
                throw e;
            }
            this.indent--;
        };
        /**
         * maybeProcess lets subclasses optionally processes a node.
         *
         * @return True if the node has been handled and doesn't need to be traversed;
         *    false to have the node written and its children recursively visited.
         */
        Rewriter.prototype.maybeProcess = function (node) {
            return false;
        };
        /** writeNode writes a ts.Node, calling this.visit() on its children. */
        Rewriter.prototype.writeNode = function (node, skipComments, newLineIfCommentsStripped) {
            if (skipComments === void 0) { skipComments = false; }
            if (newLineIfCommentsStripped === void 0) { newLineIfCommentsStripped = true; }
            var pos = node.getFullStart();
            if (skipComments) {
                // To skip comments, we skip all whitespace/comments preceding
                // the node.  But if there was anything skipped we should emit
                // a newline in its place so that the node remains separated
                // from the previous node.  TODO: don't skip anything here if
                // there wasn't any comment.
                if (newLineIfCommentsStripped && node.getFullStart() < node.getStart()) {
                    this.emit('\n');
                }
                pos = node.getStart();
            }
            this.writeNodeFrom(node, pos);
        };
        Rewriter.prototype.writeNodeFrom = function (node, pos, end) {
            var _this = this;
            if (end === void 0) { end = node.getEnd(); }
            if (end <= this.skipCommentsUpToOffset) {
                return;
            }
            var oldSkipCommentsUpToOffset = this.skipCommentsUpToOffset;
            this.skipCommentsUpToOffset = Math.max(this.skipCommentsUpToOffset, pos);
            ts.forEachChild(node, function (child) {
                _this.writeRange(node, pos, child.getFullStart());
                _this.visit(child);
                pos = child.getEnd();
            });
            this.writeRange(node, pos, end);
            this.skipCommentsUpToOffset = oldSkipCommentsUpToOffset;
        };
        /**
         * Writes all leading trivia (whitespace or comments) on node, or all trivia up to the given
         * position. Also marks those trivia as "already emitted" by shifting the skipCommentsUpTo marker.
         */
        Rewriter.prototype.writeLeadingTrivia = function (node, upTo) {
            if (upTo === void 0) { upTo = 0; }
            var upToOffset = upTo || node.getStart();
            this.writeRange(node, node.getFullStart(), upTo || node.getStart());
            this.skipCommentsUpToOffset = upToOffset;
        };
        Rewriter.prototype.addSourceMapping = function (node) {
            this.writeRange(node, node.getEnd(), node.getEnd());
        };
        /**
         * Write a span of the input file as expressed by absolute offsets.
         * These offsets are found in attributes like node.getFullStart() and
         * node.getEnd().
         */
        Rewriter.prototype.writeRange = function (node, from, to) {
            var fullStart = node.getFullStart();
            var textStart = node.getStart();
            if (from >= fullStart && from < textStart) {
                from = Math.max(from, this.skipCommentsUpToOffset);
            }
            // Add a source mapping. writeRange(from, to) always corresponds to
            // original source code, so add a mapping at the current location that
            // points back to the location at `from`. The additional code generated
            // by tsickle will then be considered part of the last mapped code
            // section preceding it. That's arguably incorrect (e.g. for the fake
            // methods defining properties), but is good enough for stack traces.
            var pos = this.file.getLineAndCharacterOfPosition(from);
            this.sourceMapper.addMapping(node, { line: pos.line, column: pos.character, position: from }, this.position, to - from);
            // getSourceFile().getText() is wrong here because it has the text of
            // the SourceFile node of the AST, which doesn't contain the comments
            // preceding that node.  Semantically these ranges are just offsets
            // into the original source file text, so slice from that.
            var text = this.file.text.slice(from, to);
            if (text) {
                this.emit(text);
            }
        };
        Rewriter.prototype.emit = function (str) {
            this.output.push(str);
            try {
                for (var str_1 = __values(str), str_1_1 = str_1.next(); !str_1_1.done; str_1_1 = str_1.next()) {
                    var c = str_1_1.value;
                    this.position.column++;
                    if (c === '\n') {
                        this.position.line++;
                        this.position.column = 0;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (str_1_1 && !str_1_1.done && (_a = str_1.return)) _a.call(str_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.position.position += str.length;
            var e_2, _a;
        };
        /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
        Rewriter.prototype.escapeForComment = function (str) {
            return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
        };
        /* tslint:disable: no-unused-variable */
        Rewriter.prototype.logWithIndent = function (message) {
            /* tslint:enable: no-unused-variable */
            var prefix = new Array(this.indent + 1).join('| ');
            console.log(prefix + message);
        };
        /**
         * Produces a compiler error that references the Node's kind.  This is useful for the "else"
         * branch of code that is attempting to handle all possible input Node types, to ensure all cases
         * covered.
         */
        Rewriter.prototype.errorUnimplementedKind = function (node, where) {
            this.error(node, ts.SyntaxKind[node.kind] + " not implemented in " + where);
        };
        Rewriter.prototype.error = function (node, messageText) {
            this.diagnostics.push({
                file: node.getSourceFile(),
                start: node.getStart(),
                length: node.getEnd() - node.getStart(),
                messageText: messageText,
                category: ts.DiagnosticCategory.Error,
                code: 0,
            });
        };
        return Rewriter;
    }());
    exports.Rewriter = Rewriter;
    /** Returns the string contents of a ts.Identifier. */
    function getIdentifierText(identifier) {
        // NOTE: the 'text' property on an Identifier may be escaped if it starts
        // with '__', so just use getText().
        return identifier.getText();
    }
    exports.getIdentifierText = getIdentifierText;
    /** Returns a dot-joined qualified name (foo.bar.Baz). */
    function getEntityNameText(name) {
        if (ts.isIdentifier(name)) {
            return getIdentifierText(name);
        }
        return getEntityNameText(name.left) + '.' + getIdentifierText(name.right);
    }
    exports.getEntityNameText = getEntityNameText;
    /**
     * Converts an escaped TypeScript name into the original source name.
     * Prefer getIdentifierText() instead if possible.
     */
    function unescapeName(name) {
        // See the private function unescapeIdentifier in TypeScript's utilities.ts.
        if (name.match(/^___/))
            return name.substr(1);
        return name;
    }
    exports.unescapeName = unescapeName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV3cml0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmV3cml0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsaUdBQWdGO0lBQ2hGLGlFQUFvRjtJQUNwRiwyQ0FBbUM7SUFFbkM7Ozs7T0FJRztJQUNIO1FBaUJFLGtCQUFtQixJQUFtQixFQUFVLFlBQStDO1lBQS9DLDZCQUFBLEVBQUEsZUFBNkIscUNBQWtCO1lBQTVFLFNBQUksR0FBSixJQUFJLENBQWU7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBbUM7WUFoQnZGLFdBQU0sR0FBYSxFQUFFLENBQUM7WUFDOUIsNkNBQTZDO1lBQ25DLGdCQUFXLEdBQW9CLEVBQUUsQ0FBQztZQUM1QyxzQ0FBc0M7WUFDOUIsYUFBUSxHQUFtQixFQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUM7WUFDckU7OztlQUdHO1lBQ0ssV0FBTSxHQUFHLENBQUMsQ0FBQztZQUNuQjs7O2VBR0c7WUFDSywyQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUdwQyxDQUFDO1FBRUQsNEJBQVMsR0FBVCxVQUFVLE1BQWU7WUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUNELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsMEZBQTBGO2dCQUMxRiwyRkFBMkY7Z0JBQzNGLHlGQUF5RjtnQkFDekYsSUFBSSxZQUFZLEdBQUcsQ0FBQyxD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Q0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFMRCw4Q0FLQztJQUVEOzs7T0FHRztJQUNILHNCQUE2QixJQUFZO1FBQ3ZDLDRFQUE0RTtRQUM1RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFKRCxvQ0FJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc0Nsb3N1cmVGaWxlb3ZlcnZpZXdDb21tZW50fSBmcm9tICcuL2ZpbGVvdmVydmlld19jb21tZW50X3RyYW5zZm9ybWVyJztcbmltcG9ydCB7Tk9PUF9TT1VSQ0VfTUFQUEVSLCBTb3VyY2VNYXBwZXIsIFNvdXJjZVBvc2l0aW9ufSBmcm9tICcuL3NvdXJjZV9tYXBfdXRpbHMnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBBIFJld3JpdGVyIG1hbmFnZXMgaXRlcmF0aW5nIHRocm91Z2ggYSB0cy5Tb3VyY2VGaWxlLCBjb3B5aW5nIGlucHV0XG4gKiB0byBvdXRwdXQgd2hpbGUgbGV0dGluZyB0aGUgc3ViY2xhc3MgcG90ZW50aWFsbHkgYWx0ZXIgc29tZSBub2Rlc1xuICogYWxvbmcgdGhlIHdheSBieSBpbXBsZW1lbnRpbmcgbWF5YmVQcm9jZXNzKCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXdyaXRlciB7XG4gIHByaXZhdGUgb3V0cHV0OiBzdHJpbmdbXSA9IFtdO1xuICAvKiogRXJyb3JzIGZvdW5kIHdoaWxlIGV4YW1pbmluZyB0aGUgY29kZS4gKi9cbiAgcHJvdGVjdGVkIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgLyoqIEN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIG91dHB1dC4gKi9cbiAgcHJpdmF0ZSBwb3NpdGlvbjogU291cmNlUG9zaXRpb24gPSB7bGluZTogMCwgY29sdW1uOiAwLCBwb3NpdGlvbjogMH07XG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBsZXZlbCBvZiByZWN1cnNpb24gdGhyb3VnaCBUeXBlU2NyaXB0IE5vZGVzLiAgVXNlZCBpbiBmb3JtYXR0aW5nIGludGVybmFsIGRlYnVnXG4gICAqIHByaW50IHN0YXRlbWVudHMuXG4gICAqL1xuICBwcml2YXRlIGluZGVudCA9IDA7XG4gIC8qKlxuICAgKiBTa2lwIGVtaXR0aW5nIGFueSBjb2RlIGJlZm9yZSB0aGUgZ2l2ZW4gb2Zmc2V0LiBFLmcuIHVzZWQgdG8gYXZvaWQgZW1pdHRpbmcgQGZpbGVvdmVydmlld1xuICAgKiBjb21tZW50cyB0d2ljZS5cbiAgICovXG4gIHByaXZhdGUgc2tpcENvbW1lbnRzVXBUb09mZnNldCA9IC0xO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmaWxlOiB0cy5Tb3VyY2VGaWxlLCBwcml2YXRlIHNvdXJjZU1hcHBlcjogU291cmNlTWFwcGVyID0gTk9PUF9TT1VSQ0VfTUFQUEVSKSB7XG4gIH1cblxuICBnZXRPdXRwdXQocHJlZml4Pzogc3RyaW5nKToge291dHB1dDogc3RyaW5nLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gICAgaWYgKHRoaXMuaW5kZW50ICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Zpc2l0KCkgZmFpbGVkIHRvIHRyYWNrIG5lc3RpbmcnKTtcbiAgICB9XG4gICAgbGV0IG91dCA9IHRoaXMub3V0cHV0LmpvaW4oJycpO1xuICAgIGlmIChwcmVmaXgpIHtcbiAgICAgIC8vIEluc2VydCBwcmVmaXggYWZ0ZXIgYW55IGxlYWRpbmcgQGZpbGVvdmVydmlldyBjb21tZW50cywgc28gdGhleSBzdGlsbCBjb21lIGZpcnN0IGluIHRoZVxuICAgICAgLy8gZmlsZS4gVGhpcyBtdXN0IG5vdCB1c2UgZmlsZS5nZXRTdGFydCgpIChjb21tZW50IHBvc2l0aW9uIGluIHRoZSBpbnB1dCBmaWxlKSwgYnV0IHJhaHRlclxuICAgICAgLy8gY2hlY2sgY29tbWVudHMgaW4gdGhlIG5ldyBvdXRwdXQsIGFzIHRob3NlIChpbiBwYXJ0aWN1bGFyIGZvciBjb21tZW50cykgYXJlIHVucmVsYXRlZC5cbiAgICAgIGxldCBpbnNlcnRpb25JZHggPSAwO1xuICAgICAgZm9yIChjb25zdCBjciBvZiB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlcyhvdXQsIDApIHx8IFtdKSB7XG4gICAgICAgIGlmIChpc0Nsb3N1cmVGaWxlb3ZlcnZpZXdDb21tZW50KG91dC5zdWJzdHJpbmcoY3IucG9zLCBjci5lbmQpKSkge1xuICAgICAgICAgIGluc2VydGlvbklkeCA9IGNyLmVuZDtcbiAgICAgICAgICAvLyBJbmNsdWRlIHNwYWNlIChpbiBwYXJ0aWN1bGFyIGxpbmUgYnJlYWtzKSBhZnRlciBhIEBmaWxlb3ZlcnZpZXcgY29tbWVudDsgd2l0aG91dCB0aGVcbiAgICAgICAgICAvLyBzcGFjZSBzZXBlcmF0aW5nIGl0LCBUeXBlU2NyaXB0IG1pZ2h0IGVsaWRlIHRoZSBlbWl0LlxuICAgICAgICAgIHdoaWxlIChpbnNlcnRpb25JZHggPCBvdXQubGVuZ3RoICYmIG91dFtpbnNlcnRpb25JZHhdLm1hdGNoKC9cXHMvKSkgaW5zZXJ0aW9uSWR4Kys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcoMCwgaW5zZXJ0aW9uSWR4KSArIHByZWZpeCArIG91dC5zdWJzdHJpbmcoaW5zZXJ0aW9uSWR4KTtcbiAgICAgIHRoaXMuc291cmNlTWFwcGVyLnNoaWZ0QnlPZmZzZXQocHJlZml4Lmxlbmd0aCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBvdXRwdXQ6IG91dCxcbiAgICAgIGRpYWdub3N0aWNzOiB0aGlzLmRpYWdub3N0aWNzLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogdmlzaXQgdHJhdmVyc2VzIGEgTm9kZSwgcmVjdXJzaXZlbHkgd3JpdGluZyBhbGwgbm9kZXMgbm90IGhhbmRsZWQgYnkgdGhpcy5tYXliZVByb2Nlc3MuXG4gICAqL1xuICB2aXNpdChub2RlOiB0cy5Ob2RlKSB7XG4gICAgLy8gdGhpcy5sb2dXaXRoSW5kZW50KCdub2RlOiAnICsgdHMuU3ludGF4S2luZFtub2RlLmtpbmRdKTtcbiAgICB0aGlzLmluZGVudCsrO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMubWF5YmVQcm9jZXNzKG5vZGUpKSB7XG4gICAgICAgIHRoaXMud3JpdGVOb2RlKG5vZGUpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICghZS5tZXNzYWdlKSBlLm1lc3NhZ2UgPSAnVW5oYW5kbGVkIGVycm9yIGluIHRzaWNrbGUnO1xuICAgICAgZS5tZXNzYWdlICs9IGBcXG4gYXQgJHt0cy5TeW50YXhLaW5kW25vZGUua2luZF19IGluICR7dGhpcy5maWxlLmZpbGVOYW1lfTpgO1xuICAgICAgY29uc3Qge2xpbmUsIGNoYXJhY3Rlcn0gPSB0aGlzLmZpbGUuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24obm9kZS5nZXRTdGFydCgpKTtcbiAgICAgIGUubWVzc2FnZSArPSBgJHtsaW5lICsgMX06JHtjaGFyYWN0ZXIgKyAxfWA7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICB0aGlzLmluZGVudC0tO1xuICB9XG5cbiAgLyoqXG4gICAqIG1heWJlUHJvY2VzcyBsZXRzIHN1YmNsYXNzZXMgb3B0aW9uYWxseSBwcm9jZXNzZXMgYSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5vZGUgaGFzIGJlZW4gaGFuZGxlZCBhbmQgZG9lc24ndCBuZWVkIHRvIGJlIHRyYXZlcnNlZDtcbiAgICogICAgZmFsc2UgdG8gaGF2ZSB0aGUgbm9kZSB3cml0dGVuIGFuZCBpdHMgY2hpbGRyZW4gcmVjdXJzaXZlbHkgdmlzaXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBtYXliZVByb2Nlc3Mobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiB3cml0ZU5vZGUgd3JpdGVzIGEgdHMuTm9kZSwgY2FsbGluZyB0aGlzLnZpc2l0KCkgb24gaXRzIGNoaWxkcmVuLiAqL1xuICB3cml0ZU5vZGUobm9kZTogdHMuTm9kZSwgc2tpcENvbW1lbnRzID0gZmFsc2UsIG5ld0xpbmVJZkNvbW1lbnRzU3RyaXBwZWQgPSB0cnVlKSB7XG4gICAgbGV0IHBvcyA9IG5vZGUuZ2V0RnVsbFN0YXJ0KCk7XG4gICAgaWYgKHNraXBDb21tZW50cykge1xuICAgICAgLy8gVG8gc2tpcCBjb21tZW50cywgd2Ugc2tpcCBhbGwgd2hpdGVzcGFjZS9jb21tZW50cyBwcmVjZWRpbmdcbiAgICAgIC8vIHRoZSBub2RlLiAgQnV0IGlmIHRoZXJlIHdhcyBhbnl0aGluZyBza2lwcGVkIHdlIHNob3VsZCBlbWl0XG4gICAgICAvLyBhIG5ld2xpbmUgaW4gaXRzIHBsYWNlIHNvIHRoYXQgdGhlIG5vZGUgcmVtYWlucyBzZXBhcmF0ZWRcbiAgICAgIC8vIGZyb20gdGhlIHByZXZpb3VzIG5vZGUuICBUT0RPOiBkb24ndCBza2lwIGFueXRoaW5nIGhlcmUgaWZcbiAgICAgIC8vIHRoZXJlIHdhc24ndCBhbnkgY29tbWVudC5cbiAgICAgIGlmIChuZXdMaW5lSWZDb21tZW50c1N0cmlwcGVkICYmIG5vZGUuZ2V0RnVsbFN0YXJ0KCkgPCBub2RlLmdldFN0YXJ0KCkpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHBvcyA9IG5vZGUuZ2V0U3RhcnQoKTtcbiAgICB9XG4gICAgdGhpcy53cml0ZU5vZGVGcm9tKG5vZGUsIHBvcyk7XG4gIH1cblxuICB3cml0ZU5vZGVGcm9tKG5vZGU6IHRzLk5vZGUsIHBvczogbnVtYmVyLCBlbmQgPSBub2RlLmdldEVuZCgpKSB7XG4gICAgaWYgKGVuZCA8PSB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkU2tpcENvbW1lbnRzVXBUb09mZnNldCA9IHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldDtcbiAgICB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQgPSBNYXRoLm1heCh0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQsIHBvcyk7XG4gICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIGNoaWxkID0+IHtcbiAgICAgIHRoaXMud3JpdGVSYW5nZShub2RlLCBwb3MsIGNoaWxkLmdldEZ1bGxTdGFydCgpKTtcbiAgICAgIHRoaXMudmlzaXQoY2hpbGQpO1xuICAgICAgcG9zID0gY2hpbGQuZ2V0RW5kKCk7XG4gICAgfSk7XG4gICAgdGhpcy53cml0ZVJhbmdlKG5vZGUsIHBvcywgZW5kKTtcbiAgICB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQgPSBvbGRTa2lwQ29tbWVudHNVcFRvT2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFdyaXRlcyBhbGwgbGVhZGluZyB0cml2aWEgKHdoaXRlc3BhY2Ugb3IgY29tbWVudHMpIG9uIG5vZGUsIG9yIGFsbCB0cml2aWEgdXAgdG8gdGhlIGdpdmVuXG4gICAqIHBvc2l0aW9uLiBBbHNvIG1hcmtzIHRob3NlIHRyaXZpYSBhcyBcImFscmVhZHkgZW1pdHRlZFwiIGJ5IHNoaWZ0aW5nIHRoZSBza2lwQ29tbWVudHNVcFRvIG1hcmtlci5cbiAgICovXG4gIHdyaXRlTGVhZGluZ1RyaXZpYShub2RlOiB0cy5Ob2RlLCB1cFRvID0gMCkge1xuICAgIGNvbnN0IHVwVG9PZmZzZXQgPSB1cFRvIHx8IG5vZGUuZ2V0U3RhcnQoKTtcbiAgICB0aGlzLndyaXRlUmFuZ2Uobm9kZSwgbm9kZS5nZXRGdWxsU3RhcnQoKSwgdXBUbyB8fCBub2RlLmdldFN0YXJ0KCkpO1xuICAgIHRoaXMuc2tpcENvbW1lbnRzVXBUb09mZnNldCA9IHVwVG9PZmZzZXQ7XG4gIH1cblxuICBhZGRTb3VyY2VNYXBwaW5nKG5vZGU6IHRzLk5vZGUpIHtcbiAgICB0aGlzLndyaXRlUmFuZ2Uobm9kZSwgbm9kZS5nZXRFbmQoKSwgbm9kZS5nZXRFbmQoKSk7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGUgYSBzcGFuIG9mIHRoZSBpbnB1dCBmaWxlIGFzIGV4cHJlc3NlZCBieSBhYnNvbHV0ZSBvZmZzZXRzLlxuICAgKiBUaGVzZSBvZmZzZXRzIGFyZSBmb3VuZCBpbiBhdHRyaWJ1dGVzIGxpa2Ugbm9kZS5nZXRGdWxsU3RhcnQoKSBhbmRcbiAgICogbm9kZS5nZXRFbmQoKS5cbiAgICovXG4gIHdyaXRlUmFuZ2Uobm9kZTogdHMuTm9kZSwgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyKSB7XG4gICAgY29uc3QgZnVsbFN0YXJ0ID0gbm9kZS5nZXRGdWxsU3RhcnQoKTtcbiAgICBjb25zdCB0ZXh0U3RhcnQgPSBub2RlLmdldFN0YXJ0KCk7XG4gICAgaWYgKGZyb20gPj0gZnVsbFN0YXJ0ICYmIGZyb20gPCB0ZXh0U3RhcnQpIHtcbiAgICAgIGZyb20gPSBNYXRoLm1heChmcm9tLCB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQpO1xuICAgIH1cbiAgICAvLyBBZGQgYSBzb3VyY2UgbWFwcGluZy4gd3JpdGVSYW5nZShmcm9tLCB0bykgYWx3YXlzIGNvcnJlc3BvbmRzIHRvXG4gICAgLy8gb3JpZ2luYWwgc291cmNlIGNvZGUsIHNvIGFkZCBhIG1hcHBpbmcgYXQgdGhlIGN1cnJlbnQgbG9jYXRpb24gdGhhdFxuICAgIC8vIHBvaW50cyBiYWNrIHRvIHRoZSBsb2NhdGlvbiBhdCBgZnJvbWAuIFRoZSBhZGRpdGlvbmFsIGNvZGUgZ2VuZXJhdGVkXG4gICAgLy8gYnkgdHNpY2tsZSB3aWxsIHRoZW4gYmUgY29uc2lkZXJlZCBwYXJ0IG9mIHRoZSBsYXN0IG1hcHBlZCBjb2RlXG4gICAgLy8gc2VjdGlvbiBwcmVjZWRpbmcgaXQuIFRoYXQncyBhcmd1YWJseSBpbmNvcnJlY3QgKGUuZy4gZm9yIHRoZSBmYWtlXG4gICAgLy8gbWV0aG9kcyBkZWZpbmluZyBwcm9wZXJ0aWVzKSwgYnV0IGlzIGdvb2QgZW5vdWdoIGZvciBzdGFjayB0cmFjZXMuXG4gICAgY29uc3QgcG9zID0gdGhpcy5maWxlLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKGZyb20pO1xuICAgIHRoaXMuc291cmNlTWFwcGVyLmFkZE1hcHBpbmcoXG4gICAgICAgIG5vZGUsIHtsaW5lOiBwb3MubGluZSwgY29sdW1uOiBwb3MuY2hhcmFjdGVyLCBwb3NpdGlvbjogZnJvbX0sIHRoaXMucG9zaXRpb24sIHRvIC0gZnJvbSk7XG4gICAgLy8gZ2V0U291cmNlRmlsZSgpLmdldFRleHQoKSBpcyB3cm9uZyBoZXJlIGJlY2F1c2UgaXQgaGFzIHRoZSB0ZXh0IG9mXG4gICAgLy8gdGhlIFNvdXJjZUZpbGUgbm9kZSBvZiB0aGUgQVNULCB3aGljaCBkb2Vzbid0IGNvbnRhaW4gdGhlIGNvbW1lbnRzXG4gICAgLy8gcHJlY2VkaW5nIHRoYXQgbm9kZS4gIFNlbWFudGljYWxseSB0aGVzZSByYW5nZXMgYXJlIGp1c3Qgb2Zmc2V0c1xuICAgIC8vIGludG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIHRleHQsIHNvIHNsaWNlIGZyb20gdGhhdC5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5maWxlLnRleHQuc2xpY2UoZnJvbSwgdG8pO1xuICAgIGlmICh0ZXh0KSB7XG4gICAgICB0aGlzLmVtaXQodGV4dCk7XG4gICAgfVxuICB9XG5cbiAgZW1pdChzdHI6IHN0cmluZykge1xuICAgIHRoaXMub3V0cHV0LnB1c2goc3RyKTtcbiAgICBmb3IgKGNvbnN0IGMgb2Ygc3RyKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uLmNvbHVtbisrO1xuICAgICAgaWYgKGMgPT09ICdcXG4nKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24ubGluZSsrO1xuICAgICAgICB0aGlzLnBvc2l0aW9uLmNvbHVtbiA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24ucG9zaXRpb24gKz0gc3RyLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGNvbW1lbnQgbWV0YWNoYXJhY3RlcnMgZnJvbSBhIHN0cmluZywgdG8gbWFrZSBpdCBzYWZlIHRvIGVtYmVkIGluIGEgY29tbWVudC4gKi9cbiAgZXNjYXBlRm9yQ29tbWVudChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC9cXCovZywgJ19fJykucmVwbGFjZSgvXFwqXFwvL2csICdfXycpO1xuICB9XG5cbiAgLyogdHNsaW50OmRpc2FibGU6IG5vLXVudXNlZC12YXJpYWJsZSAqL1xuICBsb2dXaXRoSW5kZW50KG1lc3NhZ2U6IHN0cmluZykge1xuICAgIC8qIHRzbGludDplbmFibGU6IG5vLXVudXNlZC12YXJpYWJsZSAqL1xuICAgIGNvbnN0IHByZWZpeCA9IG5ldyBBcnJheSh0aGlzLmluZGVudCArIDEpLmpvaW4oJ3wgJyk7XG4gICAgY29uc29sZS5sb2cocHJlZml4ICsgbWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgYSBjb21waWxlciBlcnJvciB0aGF0IHJlZmVyZW5jZXMgdGhlIE5vZGUncyBraW5kLiAgVGhpcyBpcyB1c2VmdWwgZm9yIHRoZSBcImVsc2VcIlxuICAgKiBicmFuY2ggb2YgY29kZSB0aGF0IGlzIGF0dGVtcHRpbmcgdG8gaGFuZGxlIGFsbCBwb3NzaWJsZSBpbnB1dCBOb2RlIHR5cGVzLCB0byBlbnN1cmUgYWxsIGNhc2VzXG4gICAqIGNvdmVyZWQuXG4gICAqL1xuICBlcnJvclVuaW1wbGVtZW50ZWRLaW5kKG5vZGU6IHRzLk5vZGUsIHdoZXJlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmVycm9yKG5vZGUsIGAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX0gbm90IGltcGxlbWVudGVkIGluICR7d2hlcmV9YCk7XG4gIH1cblxuICBlcnJvcihub2RlOiB0cy5Ob2RlLCBtZXNzYWdlVGV4dDogc3RyaW5nKSB7XG4gICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKHtcbiAgICAgIGZpbGU6IG5vZGUuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgc3RhcnQ6IG5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIGxlbmd0aDogbm9kZS5nZXRFbmQoKSAtIG5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIG1lc3NhZ2VUZXh0LFxuICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgIGNvZGU6IDAsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqIFJldHVybnMgdGhlIHN0cmluZyBjb250ZW50cyBvZiBhIHRzLklkZW50aWZpZXIuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRlbnRpZmllclRleHQoaWRlbnRpZmllcjogdHMuSWRlbnRpZmllcik6IHN0cmluZyB7XG4gIC8vIE5PVEU6IHRoZSAndGV4dCcgcHJvcGVydHkgb24gYW4gSWRlbnRpZmllciBtYXkgYmUgZXNjYXBlZCBpZiBpdCBzdGFydHNcbiAgLy8gd2l0aCAnX18nLCBzbyBqdXN0IHVzZSBnZXRUZXh0KCkuXG4gIHJldHVybiBpZGVudGlmaWVyLmdldFRleHQoKTtcbn1cblxuLyoqIFJldHVybnMgYSBkb3Qtam9pbmVkIHF1YWxpZmllZCBuYW1lIChmb28uYmFyLkJheikuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW50aXR5TmFtZVRleHQobmFtZTogdHMuRW50aXR5TmFtZSk6IHN0cmluZyB7XG4gIGlmICh0cy5pc0lkZW50aWZpZXIobmFtZSkpIHtcbiAgICByZXR1cm4gZ2V0SWRlbnRpZmllclRleHQobmFtZSk7XG4gIH1cbiAgcmV0dXJuIGdldEVudGl0eU5hbWVUZXh0KG5hbWUubGVmdCkgKyAnLicgKyBnZXRJZGVudGlmaWVyVGV4dChuYW1lLnJpZ2h0KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBlc2NhcGVkIFR5cGVTY3JpcHQgbmFtZSBpbnRvIHRoZSBvcmlnaW5hbCBzb3VyY2UgbmFtZS5cbiAqIFByZWZlciBnZXRJZGVudGlmaWVyVGV4dCgpIGluc3RlYWQgaWYgcG9zc2libGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmVzY2FwZU5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gU2VlIHRoZSBwcml2YXRlIGZ1bmN0aW9uIHVuZXNjYXBlSWRlbnRpZmllciBpbiBUeXBlU2NyaXB0J3MgdXRpbGl0aWVzLnRzLlxuICBpZiAobmFtZS5tYXRjaCgvXl9fXy8pKSByZXR1cm4gbmFtZS5zdWJzdHIoMSk7XG4gIHJldHVybiBuYW1lO1xufVxuIl19