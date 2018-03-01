/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        define("tsickle/src/es5processor", ["require", "exports", "path", "tsickle/src/fileoverview_comment_transformer", "tsickle/src/rewriter", "tsickle/src/typescript", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var fileoverview_comment_transformer_1 = require("tsickle/src/fileoverview_comment_transformer");
    var rewriter_1 = require("tsickle/src/rewriter");
    var ts = require("tsickle/src/typescript");
    var util_1 = require("tsickle/src/util");
    // Matches common extensions of TypeScript input filenames
    var TS_EXTENSIONS = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
    /**
     * Extracts the namespace part of a goog: import, or returns null if the given
     * import is not a goog: import.
     */
    function extractGoogNamespaceImport(tsImport) {
        if (tsImport.match(/^goog:/))
            return tsImport.substring('goog:'.length);
        return null;
    }
    exports.extractGoogNamespaceImport = extractGoogNamespaceImport;
    /**
     * Convert from implicit `import {} from 'pkg'` to `import {} from 'pkg/index'.
     * TypeScript supports the shorthand, but not all ES6 module loaders do.
     * Workaround for https://github.com/Microsoft/TypeScript/issues/12597
     */
    function resolveIndexShorthand(host, fileName, imported) {
        var resolved = ts.resolveModuleName(imported, fileName, host.options, host.host);
        if (!resolved || !resolved.resolvedModule)
            return imported;
        var requestedModule = imported.replace(TS_EXTENSIONS, '');
        var resolvedModule = resolved.resolvedModule.resolvedFileName.replace(TS_EXTENSIONS, '');
        if (resolvedModule.indexOf('node_modules') === -1 &&
            requestedModule.substr(requestedModule.lastIndexOf('/')) !==
                resolvedModule.substr(resolvedModule.lastIndexOf('/'))) {
            imported = './' + path.relative(path.dirname(fileName), resolvedModule).replace(path.sep, '/');
        }
        return imported;
    }
    exports.resolveIndexShorthand = resolveIndexShorthand;
    /**
     * ES5Processor postprocesses TypeScript compilation output JS, to rewrite commonjs require()s into
     * goog.require(). Contrary to its name it handles converting the modules in both ES5 and ES6
     * outputs.
     */
    var ES5Processor = /** @class */ (function (_super) {
        __extends(ES5Processor, _super);
        function ES5Processor(host, file) {
            var _this = _super.call(this, file) || this;
            _this.host = host;
            /**
             * namespaceImports collects the variables for imported goog.modules.
             * If the original TS input is:
             *   import foo from 'goog:bar';
             * then TS produces:
             *   var foo = require('goog:bar');
             * and this class rewrites it to:
             *   var foo = require('goog.bar');
             * After this step, namespaceImports['foo'] is true.
             * (This is used to rewrite 'foo.default' into just 'foo'.)
             */
            _this.namespaceImports = new Set();
            /**
             * moduleVariables maps from module names to the variables they're assigned to.
             * Continuing the above example, moduleVariables['goog.bar'] = 'foo'.
             */
            _this.moduleVariables = new Map();
            /** strippedStrict is true once we've stripped a "use strict"; from the input. */
            _this.strippedStrict = false;
            /** unusedIndex is used to generate fresh symbols for unnamed imports. */
            _this.unusedIndex = 0;
            return _this;
        }
        ES5Processor.prototype.process = function () {
            this.emitFileComment();
            var moduleId = this.host.fileNameToModuleId(this.file.fileName);
            var moduleName = this.host.pathToModuleName('', this.file.fileName);
            // NB: No linebreak after module call so sourcemaps are not offset.
            this.emit("goog.module('" + moduleName + "');");
            if (this.host.prelude)
                this.emit(this.host.prelude);
            // Allow code to use `module.id` to discover its module URL, e.g. to resolve
            // a template URL against.
            // Uses 'var', as this code is inserted in ES6 and ES5 modes.
            // The following pattern ensures closure doesn't throw an error in advanced
            // optimizations mode.
            if (this.host.es5Mode) {
                this.emit("var module = module || {id: '" + moduleId + "'};");
            }
            else {
                // The `exports = {}` serves as a default export to disable Closure Compiler's error checking
                // for mutable exports. That's OK because TS compiler makes sure that consuming code always
                // accesses exports through the module object, so mutable exports work.
                // It is only inserted in ES6 because we strip `.default` accesses in ES5 mode, which breaks
                // when assigning an `exports = {}` object and then later accessing it.
                this.emit(" exports = {}; var module = {id: '" + moduleId + "'};");
            }
            var pos = 0;
            try {
                for (var _a = __values(this.file.statements), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var stmt = _b.value;
                    this.writeRange(this.file, pos, stmt.getFullStart());
                    this.visitTopLevel(stmt);
                    pos = stmt.getEnd();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.writeRange(this.file, pos, this.file.getEnd());
            var referencedModules = Array.from(this.moduleVariables.keys());
            // Note: don't sort referencedModules, as the keys are in the same order
            // they occur in the source file.
            var output = this.getOutput().output;
            return { output: output, referencedModules: referencedModules };
            var e_1, _c;
        };
        /** Emits file comments for the current source file, if any. */
        ES5Processor.prototype.emitFileComment = function () {
            var _this = this;
            var leadingComments = ts.getLeadingCommentRanges(this.file.getFullText(), 0) || [];
            var fileComment = leadingComments.find(function (c) {
                if (c.kind !== ts.SyntaxKind.MultiLineCommentTrivia)
                    return false;
                var commentText = _this.file.getFullText().substring(c.pos, c.end);
                return fileoverview_comment_transformer_1.isClosureFileoverviewComment(commentText);
            });
            if (!fileComment)
                return;
            var end = fileComment.end;
            if (fileComment.hasTrailingNewLine)
                end++;
            this.writeLeadingTrivia(this.file, end);
        };
        /**
         * visitTopLevel processes a top-level ts.Node and emits its contents.
         *
         * It's separate from the normal Rewriter recursive traversal
         * because some top-level statements are handled specially.
         */
        ES5Processor.prototype.visitTopLevel = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.ExpressionStatement:
                    // Check for "use strict" and skip it if necessary.
                    if (!this.strippedStrict && this.isUseStrict(node)) {
                        this.emitCommentWithoutStatementBody(node);
                        this.strippedStrict = true;
                        return;
                    }
                    // Check for:
                    // - "require('foo');" (a require for its side effects)
                    // - "__export(require(...));" (an "export * from ...")
                    if (this.emitRewrittenRequires(node)) {
                        return;
                    }
                    // Check for
                    //   Object.defineProperty(exports, "__esModule", ...);
                    if (this.isEsModuleProperty(node)) {
                        this.emitCommentWithoutStatementBody(node);
                        return;
                    }
                    // Otherwise fall through to default processing.
                    break;
                case ts.SyntaxKind.VariableStatement:
                    // Check for a "var x = require('foo');".
                    if (this.emitRewrittenRequires(node))
                        return;
                    break;
                default:
                    break;
            }
            this.visit(node);
        };
        /**
         * The TypeScript AST attaches comments to statement nodes, so even if a node
         * contains code we want to skip emitting, we need to emit the attached
         * comment(s).
         */
        ES5Processor.prototype.emitCommentWithoutStatementBody = function (node) {
            this.writeLeadingTrivia(node);
        };
        /** isUseStrict returns true if node is a "use strict"; statement. */
        ES5Processor.prototype.isUseStrict = function (node) {
            if (node.kind !== ts.SyntaxKind.ExpressionStatement)
                return false;
            var exprStmt = node;
            var expr = exprStmt.expression;
            if (expr.kind !== ts.SyntaxKind.StringLiteral)
                return false;
            var literal = expr;
            return literal.text === 'use strict';
        };
        /**
         * emitRewrittenRequires rewrites require()s into goog.require() equivalents.
         *
         * @return True if the node was rewritten, false if needs ordinary processing.
         */
        ES5Processor.prototype.emitRewrittenRequires = function (node) {
            // We're looking for requires, of one of the forms:
            // - "var importName = require(...);".
            // - "require(...);".
            if (node.kind === ts.SyntaxKind.VariableStatement) {
                // It's possibly of the form "var x = require(...);".
                var varStmt = node;
                // Verify it's a single decl (and not "var x = ..., y = ...;").
                if (varStmt.declarationList.declarations.length !== 1)
                    return false;
                var decl = varStmt.declarationList.declarations[0];
                // Grab the variable name (avoiding things like destructuring binds).
                if (decl.name.kind !== ts.SyntaxKind.Identifier)
                    return false;
                var varName = rewriter_1.getIdentifierText(decl.name);
                if (!decl.initializer || decl.initializer.kind !== ts.SyntaxKind.CallExpression)
                    return false;
                var call = decl.initializer;
                var require_1 = this.extractRequire(call);
                if (!require_1)
                    return false;
                this.writeLeadingTrivia(node);
                this.emitGoogRequire(varName, require_1);
                return true;
            }
            else if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                // It's possibly of the form:
                // - require(...);
                // - __export(require(...));
                // - tslib_1.__exportStar(require(...));
                // All are CallExpressions.
                var exprStmt = node;
                var expr = exprStmt.expression;
                if (expr.kind !== ts.SyntaxKind.CallExpression)
                    return false;
                var call = expr;
                var require_2 = this.extractRequire(call);
                var isExport = false;
                if (!require_2) {
                    // If it's an __export(require(...)), we emit:
                    //   var x = require(...);
                    //   __export(x);
                    // This extra variable is necessary in case there's a later import of the
                    // same module name.
                    var innerCall = this.isExportRequire(call);
                    if (!innerCall)
                        return false;
                    isExport = true;
                    call = innerCall; // Update call to point at the require() expression.
                    require_2 = this.extractRequire(call);
                }
                if (!require_2)
                    return false;
                this.writeLeadingTrivia(node);
                var varName = this.emitGoogRequire(null, require_2);
                if (isExport) {
                    // node is a statement containing a require() in it, while
                    // requireCall is that call.  We replace the require() call
                    // with the variable we emitted.
                    var fullStatement = node.getText();
                    var requireCall = call.getText();
                    this.emit(fullStatement.replace(requireCall, varName));
                }
                return true;
            }
            else {
                // It's some other type of statement.
                return false;
            }
        };
        /**
         * Emits a goog.require() statement for a given variable name and TypeScript import.
         *
         * E.g. from:
         *   var varName = require('tsImport');
         * produces:
         *   var varName = goog.require('goog.module.name');
         *
         * If the input varName is null, generates a new variable name if necessary.
         *
         * @return The variable name for the imported module, reusing a previous import if one
         *    is available.
         */
        ES5Processor.prototype.emitGoogRequire = function (varName, tsImport) {
            var modName;
            var isNamespaceImport = false;
            var nsImport = extractGoogNamespaceImport(tsImport);
            if (nsImport !== null) {
                // This is a namespace import, of the form "goog:foo.bar".
                // Fix it to just "foo.bar".
                modName = nsImport;
                isNamespaceImport = true;
            }
            else {
                if (this.host.convertIndexImportShorthand) {
                    tsImport = resolveIndexShorthand(this.host, this.file.fileName, tsImport);
                }
                modName = this.host.pathToModuleName(this.file.fileName, tsImport);
            }
            if (!varName) {
                var mv = this.moduleVariables.get(modName);
                if (mv) {
                    // Caller didn't request a specific variable name and we've already
                    // imported the module, so just return the name we already have for this module.
                    return mv;
                }
                // Note: we always introduce a variable for any import, regardless of whether
                // the caller requested one.  This avoids a Closure error.
                varName = this.generateFreshVariableName();
            }
            if (isNamespaceImport)
                this.namespaceImports.add(varName);
            if (this.moduleVariables.has(modName)) {
                this.emit("var " + varName + " = " + this.moduleVariables.get(modName) + ";");
            }
            else {
                this.emit("var " + varName + " = goog.require('" + modName + "');");
                this.moduleVariables.set(modName, varName);
            }
            return varName;
        };
        // workaround for syntax highlighting bug in Sublime: `
        /**
         * Returns the string argument if call is of the form
         *   require('foo')
         */
        ES5Processor.prototype.extractRequire = function (call) {
            // Verify that the call is a call to require(...).
            if (call.expression.kind !== ts.SyntaxKind.Identifier)
                return null;
            var ident = call.expression;
            if (rewriter_1.getIdentifierText(ident) !== 'require')
                return null;
            // Verify the call takes a single string argument and grab it.
            if (call.arguments.length !== 1)
                return null;
            var arg = call.arguments[0];
            if (arg.kind !== ts.SyntaxKind.StringLiteral)
                return null;
            return arg.text;
        };
        /**
         * Returns the require() call node if the outer call is of the forms:
         * - __export(require('foo'))
         * - tslib_1.__exportStar(require('foo'), bar)
         */
        ES5Processor.prototype.isExportRequire = function (call) {
            switch (call.expression.kind) {
                case ts.SyntaxKind.Identifier:
                    var ident = call.expression;
                    // TS_24_COMPAT: accept three leading underscores
                    if (ident.text !== '__export' && ident.text !== '___export') {
                        return null;
                    }
                    break;
                case ts.SyntaxKind.PropertyAccessExpression:
                    var propAccess = call.expression;
                    // TS_24_COMPAT: accept three leading underscores
                    if (propAccess.name.text !== '__exportStar' && propAccess.name.text !== '___exportStar') {
                        return null;
                    }
                    break;
                default:
                    return null;
            }
            // Verify the call takes at least one argument and check it.
            if (call.arguments.length < 1)
                return null;
            var arg = call.arguments[0];
            if (arg.kind !== ts.SyntaxKind.CallExpression)
                return null;
            var innerCall = arg;
            if (!this.extractRequire(innerCall))
                return null;
            return innerCall;
        };
        ES5Processor.prototype.isEsModuleProperty = function (expr) {
            // We're matching the explicit source text generated by the TS compiler.
            return expr.getText() === 'Object.defineProperty(exports, "__esModule", { value: true });';
        };
        /**
         * maybeProcess is called during the recursive traversal of the program's AST.
         *
         * @return True if the node was processed/emitted, false if it should be emitted as is.
         */
        ES5Processor.prototype.maybeProcess = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.PropertyAccessExpression:
                    var propAccess = node;
                    // We're looking for an expression of the form:
                    //   module_name_var.default
                    if (rewriter_1.getIdentifierText(propAccess.name) !== 'default')
                        break;
                    if (propAccess.expression.kind !== ts.SyntaxKind.Identifier)
                        break;
                    var lhs = rewriter_1.getIdentifierText(propAccess.expression);
                    if (!this.namespaceImports.has(lhs))
                        break;
                    // Emit the same expression, with spaces to replace the ".default" part
                    // so that source maps still line up.
                    this.writeLeadingTrivia(node);
                    this.emit(lhs + "        ");
                    return true;
                default:
                    break;
            }
            return false;
        };
        /** Generates a new variable name inside the tsickle_ namespace. */
        ES5Processor.prototype.generateFreshVariableName = function () {
            return "tsickle_module_" + this.unusedIndex++ + "_";
        };
        return ES5Processor;
    }(rewriter_1.Rewriter));
    /**
     * Converts TypeScript's JS+CommonJS output to Closure goog.module etc.
     * For use as a postprocessing step *after* TypeScript emits JavaScript.
     *
     * @param fileName The source file name.
     * @param moduleId The "module id", a module-identifying string that is
     *     the value module.id in the scope of the module.
     * @param pathToModuleName A function that maps a filesystem .ts path to a
     *     Closure module name, as found in a goog.require('...') statement.
     *     The context parameter is the referencing file, used for resolving
     *     imports with relative paths like "import * as foo from '../foo';".
     * @param prelude An additional prelude to insert after the `goog.module` call,
     *     e.g. with additional imports or requires.
     */
    function processES5(host, fileName, content) {
        var file = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES5, true);
        return new ES5Processor(host, file).process();
    }
    exports.processES5 = processES5;
    function convertCommonJsToGoogModuleIfNeeded(host, modulesManifest, fileName, content) {
        if (!host.googmodule || util_1.isDtsFileName(fileName)) {
            return content;
        }
        var _a = processES5(host, fileName, content), output = _a.output, referencedModules = _a.referencedModules;
        var moduleName = host.pathToModuleName('', fileName);
        modulesManifest.addModule(fileName, moduleName);
        try {
            for (var referencedModules_1 = __values(referencedModules), referencedModules_1_1 = referencedModules_1.next(); !referencedModules_1_1.done; referencedModules_1_1 = referencedModules_1.next()) {
                var referenced = referencedModules_1_1.value;
                modulesManifest.addReferencedModule(fileName, referenced);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (referencedModules_1_1 && !referencedModules_1_1.done && (_b = referencedModules_1.return)) _b.call(referencedModules_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return output;
        var e_2, _b;
    }
    exports.convertCommonJsToGoogModuleIfNeeded = convertCommonJsToGoogModuleIfNeeded;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXM1cHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2VzNXByb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsMkJBQTZCO0lBRTdCLGlHQUFnRjtJQUVoRixpREFBdUQ7SUFDdkQsMkNBQW1DO0lBQ25DLHlDQUFxQztJQUVyQywwREFBMEQ7SUFDMUQsSUFBTSxhQUFhLEdBQUcsa0NBQWtDLENBQUM7SUE2QnpEOzs7T0FHRztJQUNILG9DQUEyQyxRQUFnQjtRQUN6RCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBSEQsZ0VBR0M7SUFFRDs7OztPQUlHO0lBQ0gsK0JBQ0ksSUFBa0UsRUFBRSxRQUFnQixFQUNwRixRQUFnQjtRQUNsQixJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRixFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQzNELElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVELElBQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRixFQUFFLENBQUMsQ0FBQyxjQUFj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QUVELDZDQUNJLElBQXNCLEVBQUUsZUFBZ0MsRUFBRSxRQUFnQixFQUMxRSxPQUFlO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxvQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFDSyxJQUFBLHdDQUFpRSxFQUFoRSxrQkFBTSxFQUFFLHdDQUFpQixDQUF3QztRQUV4RSxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELGVBQWUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDOztZQUNoRCxHQUFHLENBQUMsQ0FBcUIsSUFBQSxzQkFBQSxTQUFBLGlCQUFpQixDQUFBLG9EQUFBO2dCQUFyQyxJQUFNLFVBQVUsOEJBQUE7Z0JBQ25CLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDM0Q7Ozs7Ozs7OztRQUVELE1BQU0sQ0FBQyxNQUFNLENBQUM7O0lBQ2hCLENBQUM7SUFmRCxrRkFlQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtpc0Nsb3N1cmVGaWxlb3ZlcnZpZXdDb21tZW50fSBmcm9tICcuL2ZpbGVvdmVydmlld19jb21tZW50X3RyYW5zZm9ybWVyJztcbmltcG9ydCB7TW9kdWxlc01hbmlmZXN0fSBmcm9tICcuL21vZHVsZXNfbWFuaWZlc3QnO1xuaW1wb3J0IHtnZXRJZGVudGlmaWVyVGV4dCwgUmV3cml0ZXJ9IGZyb20gJy4vcmV3cml0ZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcbmltcG9ydCB7aXNEdHNGaWxlTmFtZX0gZnJvbSAnLi91dGlsJztcblxuLy8gTWF0Y2hlcyBjb21tb24gZXh0ZW5zaW9ucyBvZiBUeXBlU2NyaXB0IGlucHV0IGZpbGVuYW1lc1xuY29uc3QgVFNfRVhURU5TSU9OUyA9IC8oXFwudHN8XFwuZFxcLnRzfFxcLmpzfFxcLmpzeHxcXC50c3gpJC87XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXM1UHJvY2Vzc29ySG9zdCB7XG4gIC8qKlxuICAgKiBUYWtlcyBhIGNvbnRleHQgKHRoZSBjdXJyZW50IGZpbGUpIGFuZCB0aGUgcGF0aCBvZiB0aGUgZmlsZSB0byBpbXBvcnRcbiAgICogIGFuZCBnZW5lcmF0ZXMgYSBnb29nbW9kdWxlIG1vZHVsZSBuYW1lXG4gICAqL1xuICBwYXRoVG9Nb2R1bGVOYW1lKGNvbnRleHQ6IHN0cmluZywgaW1wb3J0UGF0aDogc3RyaW5nKTogc3RyaW5nO1xuICAvKipcbiAgICogSWYgd2UgZG8gZ29vZ21vZHVsZSBwcm9jZXNzaW5nLCB3ZSBwb2x5ZmlsbCBtb2R1bGUuaWQsIHNpbmNlIHRoYXQnc1xuICAgKiBwYXJ0IG9mIEVTNiBtb2R1bGVzLiAgVGhpcyBmdW5jdGlvbiBkZXRlcm1pbmVzIHdoYXQgdGhlIG1vZHVsZS5pZCB3aWxsIGJlXG4gICAqIGZvciBlYWNoIGZpbGUuXG4gICAqL1xuICBmaWxlTmFtZVRvTW9kdWxlSWQoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdG8gY29udmVydCBDb21tb25KUyBtb2R1bGUgc3ludGF4IHRvIGBnb29nLm1vZHVsZWAgQ2xvc3VyZSBpbXBvcnRzLiAqL1xuICBnb29nbW9kdWxlPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIGVtaXQgdGFyZ2V0cyBFUzUgb3IgRVM2Ky4gKi9cbiAgZXM1TW9kZT86IGJvb2xlYW47XG4gIC8qKiBleHBhbmQgXCJpbXBvcnQgJ2Zvbyc7XCIgdG8gXCJpbXBvcnQgJ2Zvby9pbmRleCc7XCIgaWYgaXQgcG9pbnRzIHRvIGFuIGluZGV4IGZpbGUuICovXG4gIGNvbnZlcnRJbmRleEltcG9ydFNob3J0aGFuZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBbiBhZGRpdGlvbmFsIHByZWx1ZGUgdG8gaW5zZXJ0IGluIGZyb250IG9mIHRoZSBlbWl0dGVkIGNvZGUsIGUuZy4gdG8gaW1wb3J0IGEgc2hhcmVkIGxpYnJhcnkuXG4gICAqL1xuICBwcmVsdWRlPzogc3RyaW5nO1xuXG4gIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucztcbiAgaG9zdDogdHMuTW9kdWxlUmVzb2x1dGlvbkhvc3Q7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIG5hbWVzcGFjZSBwYXJ0IG9mIGEgZ29vZzogaW1wb3J0LCBvciByZXR1cm5zIG51bGwgaWYgdGhlIGdpdmVuXG4gKiBpbXBvcnQgaXMgbm90IGEgZ29vZzogaW1wb3J0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEdvb2dOYW1lc3BhY2VJbXBvcnQodHNJbXBvcnQ6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKHRzSW1wb3J0Lm1hdGNoKC9eZ29vZzovKSkgcmV0dXJuIHRzSW1wb3J0LnN1YnN0cmluZygnZ29vZzonLmxlbmd0aCk7XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENvbnZlcnQgZnJvbSBpbXBsaWNpdCBgaW1wb3J0IHt9IGZyb20gJ3BrZydgIHRvIGBpbXBvcnQge30gZnJvbSAncGtnL2luZGV4Jy5cbiAqIFR5cGVTY3JpcHQgc3VwcG9ydHMgdGhlIHNob3J0aGFuZCwgYnV0IG5vdCBhbGwgRVM2IG1vZHVsZSBsb2FkZXJzIGRvLlxuICogV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xMjU5N1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUluZGV4U2hvcnRoYW5kKFxuICAgIGhvc3Q6IHtvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGhvc3Q6IHRzLk1vZHVsZVJlc29sdXRpb25Ib3N0fSwgZmlsZU5hbWU6IHN0cmluZyxcbiAgICBpbXBvcnRlZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcmVzb2x2ZWQgPSB0cy5yZXNvbHZlTW9kdWxlTmFtZShpbXBvcnRlZCwgZmlsZU5hbWUsIGhvc3Qub3B0aW9ucywgaG9zdC5ob3N0KTtcbiAgaWYgKCFyZXNvbHZlZCB8fCAhcmVzb2x2ZWQucmVzb2x2ZWRNb2R1bGUpIHJldHVybiBpbXBvcnRlZDtcbiAgY29uc3QgcmVxdWVzdGVkTW9kdWxlID0gaW1wb3J0ZWQucmVwbGFjZShUU19FWFRFTlNJT05TLCAnJyk7XG4gIGNvbnN0IHJlc29sdmVkTW9kdWxlID0gcmVzb2x2ZWQucmVzb2x2ZWRNb2R1bGUucmVzb2x2ZWRGaWxlTmFtZS5yZXBsYWNlKFRTX0VYVEVOU0lPTlMsICcnKTtcbiAgaWYgKHJlc29sdmVkTW9kdWxlLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpID09PSAtMSAmJlxuICAgICAgcmVxdWVzdGVkTW9kdWxlLnN1YnN0cihyZXF1ZXN0ZWRNb2R1bGUubGFzdEluZGV4T2YoJy8nKSkgIT09XG4gICAgICAgICAgcmVzb2x2ZWRNb2R1bGUuc3Vic3RyKHJlc29sdmVkTW9kdWxlLmxhc3RJbmRleE9mKCcvJykpKSB7XG4gICAgaW1wb3J0ZWQgPSAnLi8nICsgcGF0aC5yZWxhdGl2ZShwYXRoLmRpcm5hbWUoZmlsZU5hbWUpLCByZXNvbHZlZE1vZHVsZSkucmVwbGFjZShwYXRoLnNlcCwgJy8nKTtcbiAgfVxuICByZXR1cm4gaW1wb3J0ZWQ7XG59XG5cbi8qKlxuICogRVM1UHJvY2Vzc29yIHBvc3Rwcm9jZXNzZXMgVHlwZVNjcmlwdCBjb21waWxhdGlvbiBvdXRwdXQgSlMsIHRvIHJld3JpdGUgY29tbW9uanMgcmVxdWlyZSgpcyBpbnRvXG4gKiBnb29nLnJlcXVpcmUoKS4gQ29udHJhcnkgdG8gaXRzIG5hbWUgaXQgaGFuZGxlcyBjb252ZXJ0aW5nIHRoZSBtb2R1bGVzIGluIGJvdGggRVM1IGFuZCBFUzZcbiAqIG91dHB1dHMuXG4gKi9cbmNsYXNzIEVTNVByb2Nlc3NvciBleHRlbmRzIFJld3JpdGVyIHtcbiAgLyoqXG4gICAqIG5hbWVzcGFjZUltcG9ydHMgY29sbGVjdHMgdGhlIHZhcmlhYmxlcyBmb3IgaW1wb3J0ZWQgZ29vZy5tb2R1bGVzLlxuICAgKiBJZiB0aGUgb3JpZ2luYWwgVFMgaW5wdXQgaXM6XG4gICAqICAgaW1wb3J0IGZvbyBmcm9tICdnb29nOmJhcic7XG4gICAqIHRoZW4gVFMgcHJvZHVjZXM6XG4gICAqICAgdmFyIGZvbyA9IHJlcXVpcmUoJ2dvb2c6YmFyJyk7XG4gICAqIGFuZCB0aGlzIGNsYXNzIHJld3JpdGVzIGl0IHRvOlxuICAgKiAgIHZhciBmb28gPSByZXF1aXJlKCdnb29nLmJhcicpO1xuICAgKiBBZnRlciB0aGlzIHN0ZXAsIG5hbWVzcGFjZUltcG9ydHNbJ2ZvbyddIGlzIHRydWUuXG4gICAqIChUaGlzIGlzIHVzZWQgdG8gcmV3cml0ZSAnZm9vLmRlZmF1bHQnIGludG8ganVzdCAnZm9vJy4pXG4gICAqL1xuICBuYW1lc3BhY2VJbXBvcnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIG1vZHVsZVZhcmlhYmxlcyBtYXBzIGZyb20gbW9kdWxlIG5hbWVzIHRvIHRoZSB2YXJpYWJsZXMgdGhleSdyZSBhc3NpZ25lZCB0by5cbiAgICogQ29udGludWluZyB0aGUgYWJvdmUgZXhhbXBsZSwgbW9kdWxlVmFyaWFibGVzWydnb29nLmJhciddID0gJ2ZvbycuXG4gICAqL1xuICBtb2R1bGVWYXJpYWJsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIC8qKiBzdHJpcHBlZFN0cmljdCBpcyB0cnVlIG9uY2Ugd2UndmUgc3RyaXBwZWQgYSBcInVzZSBzdHJpY3RcIjsgZnJvbSB0aGUgaW5wdXQuICovXG4gIHN0cmlwcGVkU3RyaWN0ID0gZmFsc2U7XG5cbiAgLyoqIHVudXNlZEluZGV4IGlzIHVzZWQgdG8gZ2VuZXJhdGUgZnJlc2ggc3ltYm9scyBmb3IgdW5uYW1lZCBpbXBvcnRzLiAqL1xuICB1bnVzZWRJbmRleCA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBFczVQcm9jZXNzb3JIb3N0LCBmaWxlOiB0cy5Tb3VyY2VGaWxlKSB7XG4gICAgc3VwZXIoZmlsZSk7XG4gIH1cblxuICBwcm9jZXNzKCk6IHtvdXRwdXQ6IHN0cmluZywgcmVmZXJlbmNlZE1vZHVsZXM6IHN0cmluZ1tdfSB7XG4gICAgdGhpcy5lbWl0RmlsZUNvbW1lbnQoKTtcblxuICAgIGNvbnN0IG1vZHVsZUlkID0gdGhpcy5ob3N0LmZpbGVOYW1lVG9Nb2R1bGVJZCh0aGlzLmZpbGUuZmlsZU5hbWUpO1xuICAgIGNvbnN0IG1vZHVsZU5hbWUgPSB0aGlzLmhvc3QucGF0aFRvTW9kdWxlTmFtZSgnJywgdGhpcy5maWxlLmZpbGVOYW1lKTtcbiAgICAvLyBOQjogTm8gbGluZWJyZWFrIGFmdGVyIG1vZHVsZSBjYWxsIHNvIHNvdXJjZW1hcHMgYXJlIG5vdCBvZmZzZXQuXG4gICAgdGhpcy5lbWl0KGBnb29nLm1vZHVsZSgnJHttb2R1bGVOYW1lfScpO2ApO1xuICAgIGlmICh0aGlzLmhvc3QucHJlbHVkZSkgdGhpcy5lbWl0KHRoaXMuaG9zdC5wcmVsdWRlKTtcbiAgICAvLyBBbGxvdyBjb2RlIHRvIHVzZSBgbW9kdWxlLmlkYCB0byBkaXNjb3ZlciBpdHMgbW9kdWxlIFVSTCwgZS5nLiB0byByZXNvbHZlXG4gICAgLy8gYSB0ZW1wbGF0ZSBVUkwgYWdhaW5zdC5cbiAgICAvLyBVc2VzICd2YXInLCBhcyB0aGlzIGNvZGUgaXMgaW5zZXJ0ZWQgaW4gRVM2IGFuZCBFUzUgbW9kZXMuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBwYXR0ZXJuIGVuc3VyZXMgY2xvc3VyZSBkb2Vzbid0IHRocm93IGFuIGVycm9yIGluIGFkdmFuY2VkXG4gICAgLy8gb3B0aW1pemF0aW9ucyBtb2RlLlxuICAgIGlmICh0aGlzLmhvc3QuZXM1TW9kZSkge1xuICAgICAgdGhpcy5lbWl0KGB2YXIgbW9kdWxlID0gbW9kdWxlIHx8IHtpZDogJyR7bW9kdWxlSWR9J307YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBgZXhwb3J0cyA9IHt9YCBzZXJ2ZXMgYXMgYSBkZWZhdWx0IGV4cG9ydCB0byBkaXNhYmxlIENsb3N1cmUgQ29tcGlsZXIncyBlcnJvciBjaGVja2luZ1xuICAgICAgLy8gZm9yIG11dGFibGUgZXhwb3J0cy4gVGhhdCdzIE9LIGJlY2F1c2UgVFMgY29tcGlsZXIgbWFrZXMgc3VyZSB0aGF0IGNvbnN1bWluZyBjb2RlIGFsd2F5c1xuICAgICAgLy8gYWNjZXNzZXMgZXhwb3J0cyB0aHJvdWdoIHRoZSBtb2R1bGUgb2JqZWN0LCBzbyBtdXRhYmxlIGV4cG9ydHMgd29yay5cbiAgICAgIC8vIEl0IGlzIG9ubHkgaW5zZXJ0ZWQgaW4gRVM2IGJlY2F1c2Ugd2Ugc3RyaXAgYC5kZWZhdWx0YCBhY2Nlc3NlcyBpbiBFUzUgbW9kZSwgd2hpY2ggYnJlYWtzXG4gICAgICAvLyB3aGVuIGFzc2lnbmluZyBhbiBgZXhwb3J0cyA9IHt9YCBvYmplY3QgYW5kIHRoZW4gbGF0ZXIgYWNjZXNzaW5nIGl0LlxuICAgICAgdGhpcy5lbWl0KGAgZXhwb3J0cyA9IHt9OyB2YXIgbW9kdWxlID0ge2lkOiAnJHttb2R1bGVJZH0nfTtgKTtcbiAgICB9XG5cbiAgICBsZXQgcG9zID0gMDtcbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgdGhpcy5maWxlLnN0YXRlbWVudHMpIHtcbiAgICAgIHRoaXMud3JpdGVSYW5nZSh0aGlzLmZpbGUsIHBvcywgc3RtdC5nZXRGdWxsU3RhcnQoKSk7XG4gICAgICB0aGlzLnZpc2l0VG9wTGV2ZWwoc3RtdCk7XG4gICAgICBwb3MgPSBzdG10LmdldEVuZCgpO1xuICAgIH1cbiAgICB0aGlzLndyaXRlUmFuZ2UodGhpcy5maWxlLCBwb3MsIHRoaXMuZmlsZS5nZXRFbmQoKSk7XG5cbiAgICBjb25zdCByZWZlcmVuY2VkTW9kdWxlcyA9IEFycmF5LmZyb20odGhpcy5tb2R1bGVWYXJpYWJsZXMua2V5cygpKTtcbiAgICAvLyBOb3RlOiBkb24ndCBzb3J0IHJlZmVyZW5jZWRNb2R1bGVzLCBhcyB0aGUga2V5cyBhcmUgaW4gdGhlIHNhbWUgb3JkZXJcbiAgICAvLyB0aGV5IG9jY3VyIGluIHRoZSBzb3VyY2UgZmlsZS5cbiAgICBjb25zdCB7b3V0cHV0fSA9IHRoaXMuZ2V0T3V0cHV0KCk7XG4gICAgcmV0dXJuIHtvdXRwdXQsIHJlZmVyZW5jZWRNb2R1bGVzfTtcbiAgfVxuXG4gIC8qKiBFbWl0cyBmaWxlIGNvbW1lbnRzIGZvciB0aGUgY3VycmVudCBzb3VyY2UgZmlsZSwgaWYgYW55LiAqL1xuICBwcml2YXRlIGVtaXRGaWxlQ29tbWVudCgpIHtcbiAgICBjb25zdCBsZWFkaW5nQ29tbWVudHMgPSB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlcyh0aGlzLmZpbGUuZ2V0RnVsbFRleHQoKSwgMCkgfHwgW107XG4gICAgY29uc3QgZmlsZUNvbW1lbnQgPSBsZWFkaW5nQ29tbWVudHMuZmluZChjID0+IHtcbiAgICAgIGlmIChjLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgY29tbWVudFRleHQgPSB0aGlzLmZpbGUuZ2V0RnVsbFRleHQoKS5zdWJzdHJpbmcoYy5wb3MsIGMuZW5kKTtcbiAgICAgIHJldHVybiBpc0Nsb3N1cmVGaWxlb3ZlcnZpZXdDb21tZW50KGNvbW1lbnRUZXh0KTtcbiAgICB9KTtcbiAgICBpZiAoIWZpbGVDb21tZW50KSByZXR1cm47XG4gICAgbGV0IGVuZCA9IGZpbGVDb21tZW50LmVuZDtcbiAgICBpZiAoZmlsZUNvbW1lbnQuaGFzVHJhaWxpbmdOZXdMaW5lKSBlbmQrKztcbiAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYSh0aGlzLmZpbGUsIGVuZCk7XG4gIH1cblxuICAvKipcbiAgICogdmlzaXRUb3BMZXZlbCBwcm9jZXNzZXMgYSB0b3AtbGV2ZWwgdHMuTm9kZSBhbmQgZW1pdHMgaXRzIGNvbnRlbnRzLlxuICAgKlxuICAgKiBJdCdzIHNlcGFyYXRlIGZyb20gdGhlIG5vcm1hbCBSZXdyaXRlciByZWN1cnNpdmUgdHJhdmVyc2FsXG4gICAqIGJlY2F1c2Ugc29tZSB0b3AtbGV2ZWwgc3RhdGVtZW50cyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAqL1xuICB2aXNpdFRvcExldmVsKG5vZGU6IHRzLk5vZGUpIHtcbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQ6XG4gICAgICAgIC8vIENoZWNrIGZvciBcInVzZSBzdHJpY3RcIiBhbmQgc2tpcCBpdCBpZiBuZWNlc3NhcnkuXG4gICAgICAgIGlmICghdGhpcy5zdHJpcHBlZFN0cmljdCAmJiB0aGlzLmlzVXNlU3RyaWN0KG5vZGUpKSB7XG4gICAgICAgICAgdGhpcy5lbWl0Q29tbWVudFdpdGhvdXRTdGF0ZW1lbnRCb2R5KG5vZGUpO1xuICAgICAgICAgIHRoaXMuc3RyaXBwZWRTdHJpY3QgPSB0cnVlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3I6XG4gICAgICAgIC8vIC0gXCJyZXF1aXJlKCdmb28nKTtcIiAoYSByZXF1aXJlIGZvciBpdHMgc2lkZSBlZmZlY3RzKVxuICAgICAgICAvLyAtIFwiX19leHBvcnQocmVxdWlyZSguLi4pKTtcIiAoYW4gXCJleHBvcnQgKiBmcm9tIC4uLlwiKVxuICAgICAgICBpZiAodGhpcy5lbWl0UmV3cml0dGVuUmVxdWlyZXMobm9kZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yXG4gICAgICAgIC8vICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCAuLi4pO1xuICAgICAgICBpZiAodGhpcy5pc0VzTW9kdWxlUHJvcGVydHkobm9kZSBhcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50KSkge1xuICAgICAgICAgIHRoaXMuZW1pdENvbW1lbnRXaXRob3V0U3RhdGVtZW50Qm9keShub2RlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGZhbGwgdGhyb3VnaCB0byBkZWZhdWx0IHByb2Nlc3NpbmcuXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50OlxuICAgICAgICAvLyBDaGVjayBmb3IgYSBcInZhciB4ID0gcmVxdWlyZSgnZm9vJyk7XCIuXG4gICAgICAgIGlmICh0aGlzLmVtaXRSZXdyaXR0ZW5SZXF1aXJlcyhub2RlKSkgcmV0dXJuO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLnZpc2l0KG5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBUeXBlU2NyaXB0IEFTVCBhdHRhY2hlcyBjb21tZW50cyB0byBzdGF0ZW1lbnQgbm9kZXMsIHNvIGV2ZW4gaWYgYSBub2RlXG4gICAqIGNvbnRhaW5zIGNvZGUgd2Ugd2FudCB0byBza2lwIGVtaXR0aW5nLCB3ZSBuZWVkIHRvIGVtaXQgdGhlIGF0dGFjaGVkXG4gICAqIGNvbW1lbnQocykuXG4gICAqL1xuICBlbWl0Q29tbWVudFdpdGhvdXRTdGF0ZW1lbnRCb2R5KG5vZGU6IHRzLk5vZGUpIHtcbiAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgfVxuXG4gIC8qKiBpc1VzZVN0cmljdCByZXR1cm5zIHRydWUgaWYgbm9kZSBpcyBhIFwidXNlIHN0cmljdFwiOyBzdGF0ZW1lbnQuICovXG4gIGlzVXNlU3RyaWN0KG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgICBpZiAobm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBleHByU3RtdCA9IG5vZGUgYXMgdHMuRXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICBjb25zdCBleHByID0gZXhwclN0bXQuZXhwcmVzc2lvbjtcbiAgICBpZiAoZXhwci5raW5kICE9PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBsaXRlcmFsID0gZXhwciBhcyB0cy5TdHJpbmdMaXRlcmFsO1xuICAgIHJldHVybiBsaXRlcmFsLnRleHQgPT09ICd1c2Ugc3RyaWN0JztcbiAgfVxuXG4gIC8qKlxuICAgKiBlbWl0UmV3cml0dGVuUmVxdWlyZXMgcmV3cml0ZXMgcmVxdWlyZSgpcyBpbnRvIGdvb2cucmVxdWlyZSgpIGVxdWl2YWxlbnRzLlxuICAgKlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5vZGUgd2FzIHJld3JpdHRlbiwgZmFsc2UgaWYgbmVlZHMgb3JkaW5hcnkgcHJvY2Vzc2luZy5cbiAgICovXG4gIGVtaXRSZXdyaXR0ZW5SZXF1aXJlcyhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgLy8gV2UncmUgbG9va2luZyBmb3IgcmVxdWlyZXMsIG9mIG9uZSBvZiB0aGUgZm9ybXM6XG4gICAgLy8gLSBcInZhciBpbXBvcnROYW1lID0gcmVxdWlyZSguLi4pO1wiLlxuICAgIC8vIC0gXCJyZXF1aXJlKC4uLik7XCIuXG4gICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCkge1xuICAgICAgLy8gSXQncyBwb3NzaWJseSBvZiB0aGUgZm9ybSBcInZhciB4ID0gcmVxdWlyZSguLi4pO1wiLlxuICAgICAgY29uc3QgdmFyU3RtdCA9IG5vZGUgYXMgdHMuVmFyaWFibGVTdGF0ZW1lbnQ7XG5cbiAgICAgIC8vIFZlcmlmeSBpdCdzIGEgc2luZ2xlIGRlY2wgKGFuZCBub3QgXCJ2YXIgeCA9IC4uLiwgeSA9IC4uLjtcIikuXG4gICAgICBpZiAodmFyU3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgZGVjbCA9IHZhclN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1swXTtcblxuICAgICAgLy8gR3JhYiB0aGUgdmFyaWFibGUgbmFtZSAoYXZvaWRpbmcgdGhpbmdzIGxpa2UgZGVzdHJ1Y3R1cmluZyBiaW5kcykuXG4gICAgICBpZiAoZGVjbC5uYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgdmFyTmFtZSA9IGdldElkZW50aWZpZXJUZXh0KGRlY2wubmFtZSBhcyB0cy5JZGVudGlmaWVyKTtcbiAgICAgIGlmICghZGVjbC5pbml0aWFsaXplciB8fCBkZWNsLmluaXRpYWxpemVyLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IGNhbGwgPSBkZWNsLmluaXRpYWxpemVyIGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuICAgICAgY29uc3QgcmVxdWlyZSA9IHRoaXMuZXh0cmFjdFJlcXVpcmUoY2FsbCk7XG4gICAgICBpZiAoIXJlcXVpcmUpIHJldHVybiBmYWxzZTtcbiAgICAgIHRoaXMud3JpdGVMZWFkaW5nVHJpdmlhKG5vZGUpO1xuICAgICAgdGhpcy5lbWl0R29vZ1JlcXVpcmUodmFyTmFtZSwgcmVxdWlyZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgICAvLyBJdCdzIHBvc3NpYmx5IG9mIHRoZSBmb3JtOlxuICAgICAgLy8gLSByZXF1aXJlKC4uLik7XG4gICAgICAvLyAtIF9fZXhwb3J0KHJlcXVpcmUoLi4uKSk7XG4gICAgICAvLyAtIHRzbGliXzEuX19leHBvcnRTdGFyKHJlcXVpcmUoLi4uKSk7XG4gICAgICAvLyBBbGwgYXJlIENhbGxFeHByZXNzaW9ucy5cbiAgICAgIGNvbnN0IGV4cHJTdG10ID0gbm9kZSBhcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50O1xuICAgICAgY29uc3QgZXhwciA9IGV4cHJTdG10LmV4cHJlc3Npb247XG4gICAgICBpZiAoZXhwci5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSByZXR1cm4gZmFsc2U7XG4gICAgICBsZXQgY2FsbCA9IGV4cHIgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG5cbiAgICAgIGxldCByZXF1aXJlID0gdGhpcy5leHRyYWN0UmVxdWlyZShjYWxsKTtcbiAgICAgIGxldCBpc0V4cG9ydCA9IGZhbHNlO1xuICAgICAgaWYgKCFyZXF1aXJlKSB7XG4gICAgICAgIC8vIElmIGl0J3MgYW4gX19leHBvcnQocmVxdWlyZSguLi4pKSwgd2UgZW1pdDpcbiAgICAgICAgLy8gICB2YXIgeCA9IHJlcXVpcmUoLi4uKTtcbiAgICAgICAgLy8gICBfX2V4cG9ydCh4KTtcbiAgICAgICAgLy8gVGhpcyBleHRyYSB2YXJpYWJsZSBpcyBuZWNlc3NhcnkgaW4gY2FzZSB0aGVyZSdzIGEgbGF0ZXIgaW1wb3J0IG9mIHRoZVxuICAgICAgICAvLyBzYW1lIG1vZHVsZSBuYW1lLlxuICAgICAgICBjb25zdCBpbm5lckNhbGwgPSB0aGlzLmlzRXhwb3J0UmVxdWlyZShjYWxsKTtcbiAgICAgICAgaWYgKCFpbm5lckNhbGwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaXNFeHBvcnQgPSB0cnVlO1xuICAgICAgICBjYWxsID0gaW5uZXJDYWxsOyAgLy8gVXBkYXRlIGNhbGwgdG8gcG9pbnQgYXQgdGhlIHJlcXVpcmUoKSBleHByZXNzaW9uLlxuICAgICAgICByZXF1aXJlID0gdGhpcy5leHRyYWN0UmVxdWlyZShjYWxsKTtcbiAgICAgIH1cbiAgICAgIGlmICghcmVxdWlyZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgICAgIGNvbnN0IHZhck5hbWUgPSB0aGlzLmVtaXRHb29nUmVxdWlyZShudWxsLCByZXF1aXJlKTtcblxuICAgICAgaWYgKGlzRXhwb3J0KSB7XG4gICAgICAgIC8vIG5vZGUgaXMgYSBzdGF0ZW1lbnQgY29udGFpbmluZyBhIHJlcXVpcmUoKSBpbiBpdCwgd2hpbGVcbiAgICAgICAgLy8gcmVxdWlyZUNhbGwgaXMgdGhhdCBjYWxsLiAgV2UgcmVwbGFjZSB0aGUgcmVxdWlyZSgpIGNhbGxcbiAgICAgICAgLy8gd2l0aCB0aGUgdmFyaWFibGUgd2UgZW1pdHRlZC5cbiAgICAgICAgY29uc3QgZnVsbFN0YXRlbWVudCA9IG5vZGUuZ2V0VGV4dCgpO1xuICAgICAgICBjb25zdCByZXF1aXJlQ2FsbCA9IGNhbGwuZ2V0VGV4dCgpO1xuICAgICAgICB0aGlzLmVtaXQoZnVsbFN0YXRlbWVudC5yZXBsYWNlKHJlcXVpcmVDYWxsLCB2YXJOYW1lKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSXQncyBzb21lIG90aGVyIHR5cGUgb2Ygc3RhdGVtZW50LlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIGdvb2cucmVxdWlyZSgpIHN0YXRlbWVudCBmb3IgYSBnaXZlbiB2YXJpYWJsZSBuYW1lIGFuZCBUeXBlU2NyaXB0IGltcG9ydC5cbiAgICpcbiAgICogRS5nLiBmcm9tOlxuICAgKiAgIHZhciB2YXJOYW1lID0gcmVxdWlyZSgndHNJbXBvcnQnKTtcbiAgICogcHJvZHVjZXM6XG4gICAqICAgdmFyIHZhck5hbWUgPSBnb29nLnJlcXVpcmUoJ2dvb2cubW9kdWxlLm5hbWUnKTtcbiAgICpcbiAgICogSWYgdGhlIGlucHV0IHZhck5hbWUgaXMgbnVsbCwgZ2VuZXJhdGVzIGEgbmV3IHZhcmlhYmxlIG5hbWUgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAcmV0dXJuIFRoZSB2YXJpYWJsZSBuYW1lIGZvciB0aGUgaW1wb3J0ZWQgbW9kdWxlLCByZXVzaW5nIGEgcHJldmlvdXMgaW1wb3J0IGlmIG9uZVxuICAgKiAgICBpcyBhdmFpbGFibGUuXG4gICAqL1xuICBlbWl0R29vZ1JlcXVpcmUodmFyTmFtZTogc3RyaW5nfG51bGwsIHRzSW1wb3J0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBtb2ROYW1lOiBzdHJpbmc7XG4gICAgbGV0IGlzTmFtZXNwYWNlSW1wb3J0ID0gZmFsc2U7XG4gICAgY29uc3QgbnNJbXBvcnQgPSBleHRyYWN0R29vZ05hbWVzcGFjZUltcG9ydCh0c0ltcG9ydCk7XG4gICAgaWYgKG5zSW1wb3J0ICE9PSBudWxsKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgbmFtZXNwYWNlIGltcG9ydCwgb2YgdGhlIGZvcm0gXCJnb29nOmZvby5iYXJcIi5cbiAgICAgIC8vIEZpeCBpdCB0byBqdXN0IFwiZm9vLmJhclwiLlxuICAgICAgbW9kTmFtZSA9IG5zSW1wb3J0O1xuICAgICAgaXNOYW1lc3BhY2VJbXBvcnQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5ob3N0LmNvbnZlcnRJbmRleEltcG9ydFNob3J0aGFuZCkge1xuICAgICAgICB0c0ltcG9ydCA9IHJlc29sdmVJbmRleFNob3J0aGFuZCh0aGlzLmhvc3QsIHRoaXMuZmlsZS5maWxlTmFtZSwgdHNJbXBvcnQpO1xuICAgICAgfVxuICAgICAgbW9kTmFtZSA9IHRoaXMuaG9zdC5wYXRoVG9Nb2R1bGVOYW1lKHRoaXMuZmlsZS5maWxlTmFtZSwgdHNJbXBvcnQpO1xuICAgIH1cblxuICAgIGlmICghdmFyTmFtZSkge1xuICAgICAgY29uc3QgbXYgPSB0aGlzLm1vZHVsZVZhcmlhYmxlcy5nZXQobW9kTmFtZSk7XG4gICAgICBpZiAobXYpIHtcbiAgICAgICAgLy8gQ2FsbGVyIGRpZG4ndCByZXF1ZXN0IGEgc3BlY2lmaWMgdmFyaWFibGUgbmFtZSBhbmQgd2UndmUgYWxyZWFkeVxuICAgICAgICAvLyBpbXBvcnRlZCB0aGUgbW9kdWxlLCBzbyBqdXN0IHJldHVybiB0aGUgbmFtZSB3ZSBhbHJlYWR5IGhhdmUgZm9yIHRoaXMgbW9kdWxlLlxuICAgICAgICByZXR1cm4gbXY7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdGU6IHdlIGFsd2F5cyBpbnRyb2R1Y2UgYSB2YXJpYWJsZSBmb3IgYW55IGltcG9ydCwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyXG4gICAgICAvLyB0aGUgY2FsbGVyIHJlcXVlc3RlZCBvbmUuICBUaGlzIGF2b2lkcyBhIENsb3N1cmUgZXJyb3IuXG4gICAgICB2YXJOYW1lID0gdGhpcy5nZW5lcmF0ZUZyZXNoVmFyaWFibGVOYW1lKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFtZXNwYWNlSW1wb3J0KSB0aGlzLm5hbWVzcGFjZUltcG9ydHMuYWRkKHZhck5hbWUpO1xuICAgIGlmICh0aGlzLm1vZHVsZVZhcmlhYmxlcy5oYXMobW9kTmFtZSkpIHtcbiAgICAgIHRoaXMuZW1pdChgdmFyICR7dmFyTmFtZX0gPSAke3RoaXMubW9kdWxlVmFyaWFibGVzLmdldChtb2ROYW1lKX07YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdChgdmFyICR7dmFyTmFtZX0gPSBnb29nLnJlcXVpcmUoJyR7bW9kTmFtZX0nKTtgKTtcbiAgICAgIHRoaXMubW9kdWxlVmFyaWFibGVzLnNldChtb2ROYW1lLCB2YXJOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhck5hbWU7XG4gIH1cbiAgLy8gd29ya2Fyb3VuZCBmb3Igc3ludGF4IGhpZ2hsaWdodGluZyBidWcgaW4gU3VibGltZTogYFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgYXJndW1lbnQgaWYgY2FsbCBpcyBvZiB0aGUgZm9ybVxuICAgKiAgIHJlcXVpcmUoJ2ZvbycpXG4gICAqL1xuICBleHRyYWN0UmVxdWlyZShjYWxsOiB0cy5DYWxsRXhwcmVzc2lvbik6IHN0cmluZ3xudWxsIHtcbiAgICAvLyBWZXJpZnkgdGhhdCB0aGUgY2FsbCBpcyBhIGNhbGwgdG8gcmVxdWlyZSguLi4pLlxuICAgIGlmIChjYWxsLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpZGVudCA9IGNhbGwuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyO1xuICAgIGlmIChnZXRJZGVudGlmaWVyVGV4dChpZGVudCkgIT09ICdyZXF1aXJlJykgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBWZXJpZnkgdGhlIGNhbGwgdGFrZXMgYSBzaW5nbGUgc3RyaW5nIGFyZ3VtZW50IGFuZCBncmFiIGl0LlxuICAgIGlmIChjYWxsLmFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGFyZyA9IGNhbGwuYXJndW1lbnRzWzBdO1xuICAgIGlmIChhcmcua2luZCAhPT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKGFyZyBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlcXVpcmUoKSBjYWxsIG5vZGUgaWYgdGhlIG91dGVyIGNhbGwgaXMgb2YgdGhlIGZvcm1zOlxuICAgKiAtIF9fZXhwb3J0KHJlcXVpcmUoJ2ZvbycpKVxuICAgKiAtIHRzbGliXzEuX19leHBvcnRTdGFyKHJlcXVpcmUoJ2ZvbycpLCBiYXIpXG4gICAqL1xuICBpc0V4cG9ydFJlcXVpcmUoY2FsbDogdHMuQ2FsbEV4cHJlc3Npb24pOiB0cy5DYWxsRXhwcmVzc2lvbnxudWxsIHtcbiAgICBzd2l0Y2ggKGNhbGwuZXhwcmVzc2lvbi5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgY29uc3QgaWRlbnQgPSBjYWxsLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcjtcbiAgICAgICAgLy8gVFNfMjRfQ09NUEFUOiBhY2NlcHQgdGhyZWUgbGVhZGluZyB1bmRlcnNjb3Jlc1xuICAgICAgICBpZiAoaWRlbnQudGV4dCAhPT0gJ19fZXhwb3J0JyAmJiBpZGVudC50ZXh0ICE9PSAnX19fZXhwb3J0Jykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgcHJvcEFjY2VzcyA9IGNhbGwuZXhwcmVzc2lvbiBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gICAgICAgIC8vIFRTXzI0X0NPTVBBVDogYWNjZXB0IHRocmVlIGxlYWRpbmcgdW5kZXJzY29yZXNcbiAgICAgICAgaWYgKHByb3BBY2Nlc3MubmFtZS50ZXh0ICE9PSAnX19leHBvcnRTdGFyJyAmJiBwcm9wQWNjZXNzLm5hbWUudGV4dCAhPT0gJ19fX2V4cG9ydFN0YXInKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgdGhlIGNhbGwgdGFrZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50IGFuZCBjaGVjayBpdC5cbiAgICBpZiAoY2FsbC5hcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgYXJnID0gY2FsbC5hcmd1bWVudHNbMF07XG4gICAgaWYgKGFyZy5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpbm5lckNhbGwgPSBhcmcgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgaWYgKCF0aGlzLmV4dHJhY3RSZXF1aXJlKGlubmVyQ2FsbCkpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBpbm5lckNhbGw7XG4gIH1cblxuICBpc0VzTW9kdWxlUHJvcGVydHkoZXhwcjogdHMuRXhwcmVzc2lvblN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICAgIC8vIFdlJ3JlIG1hdGNoaW5nIHRoZSBleHBsaWNpdCBzb3VyY2UgdGV4dCBnZW5lcmF0ZWQgYnkgdGhlIFRTIGNvbXBpbGVyLlxuICAgIHJldHVybiBleHByLmdldFRleHQoKSA9PT0gJ09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTsnO1xuICB9XG5cbiAgLyoqXG4gICAqIG1heWJlUHJvY2VzcyBpcyBjYWxsZWQgZHVyaW5nIHRoZSByZWN1cnNpdmUgdHJhdmVyc2FsIG9mIHRoZSBwcm9ncmFtJ3MgQVNULlxuICAgKlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5vZGUgd2FzIHByb2Nlc3NlZC9lbWl0dGVkLCBmYWxzZSBpZiBpdCBzaG91bGQgYmUgZW1pdHRlZCBhcyBpcy5cbiAgICovXG4gIHByb3RlY3RlZCBtYXliZVByb2Nlc3Mobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uOlxuICAgICAgICBjb25zdCBwcm9wQWNjZXNzID0gbm9kZSBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gICAgICAgIC8vIFdlJ3JlIGxvb2tpbmcgZm9yIGFuIGV4cHJlc3Npb24gb2YgdGhlIGZvcm06XG4gICAgICAgIC8vICAgbW9kdWxlX25hbWVfdmFyLmRlZmF1bHRcbiAgICAgICAgaWYgKGdldElkZW50aWZpZXJUZXh0KHByb3BBY2Nlc3MubmFtZSkgIT09ICdkZWZhdWx0JykgYnJlYWs7XG4gICAgICAgIGlmIChwcm9wQWNjZXNzLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSBicmVhaztcbiAgICAgICAgY29uc3QgbGhzID0gZ2V0SWRlbnRpZmllclRleHQocHJvcEFjY2Vzcy5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXIpO1xuICAgICAgICBpZiAoIXRoaXMubmFtZXNwYWNlSW1wb3J0cy5oYXMobGhzKSkgYnJlYWs7XG4gICAgICAgIC8vIEVtaXQgdGhlIHNhbWUgZXhwcmVzc2lvbiwgd2l0aCBzcGFjZXMgdG8gcmVwbGFjZSB0aGUgXCIuZGVmYXVsdFwiIHBhcnRcbiAgICAgICAgLy8gc28gdGhhdCBzb3VyY2UgbWFwcyBzdGlsbCBsaW5lIHVwLlxuICAgICAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgICAgICAgdGhpcy5lbWl0KGAke2xoc30gICAgICAgIGApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogR2VuZXJhdGVzIGEgbmV3IHZhcmlhYmxlIG5hbWUgaW5zaWRlIHRoZSB0c2lja2xlXyBuYW1lc3BhY2UuICovXG4gIGdlbmVyYXRlRnJlc2hWYXJpYWJsZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHRzaWNrbGVfbW9kdWxlXyR7dGhpcy51bnVzZWRJbmRleCsrfV9gO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgVHlwZVNjcmlwdCdzIEpTK0NvbW1vbkpTIG91dHB1dCB0byBDbG9zdXJlIGdvb2cubW9kdWxlIGV0Yy5cbiAqIEZvciB1c2UgYXMgYSBwb3N0cHJvY2Vzc2luZyBzdGVwICphZnRlciogVHlwZVNjcmlwdCBlbWl0cyBKYXZhU2NyaXB0LlxuICpcbiAqIEBwYXJhbSBmaWxlTmFtZSBUaGUgc291cmNlIGZpbGUgbmFtZS5cbiAqIEBwYXJhbSBtb2R1bGVJZCBUaGUgXCJtb2R1bGUgaWRcIiwgYSBtb2R1bGUtaWRlbnRpZnlpbmcgc3RyaW5nIHRoYXQgaXNcbiAqICAgICB0aGUgdmFsdWUgbW9kdWxlLmlkIGluIHRoZSBzY29wZSBvZiB0aGUgbW9kdWxlLlxuICogQHBhcmFtIHBhdGhUb01vZHVsZU5hbWUgQSBmdW5jdGlvbiB0aGF0IG1hcHMgYSBmaWxlc3lzdGVtIC50cyBwYXRoIHRvIGFcbiAqICAgICBDbG9zdXJlIG1vZHVsZSBuYW1lLCBhcyBmb3VuZCBpbiBhIGdvb2cucmVxdWlyZSgnLi4uJykgc3RhdGVtZW50LlxuICogICAgIFRoZSBjb250ZXh0IHBhcmFtZXRlciBpcyB0aGUgcmVmZXJlbmNpbmcgZmlsZSwgdXNlZCBmb3IgcmVzb2x2aW5nXG4gKiAgICAgaW1wb3J0cyB3aXRoIHJlbGF0aXZlIHBhdGhzIGxpa2UgXCJpbXBvcnQgKiBhcyBmb28gZnJvbSAnLi4vZm9vJztcIi5cbiAqIEBwYXJhbSBwcmVsdWRlIEFuIGFkZGl0aW9uYWwgcHJlbHVkZSB0byBpbnNlcnQgYWZ0ZXIgdGhlIGBnb29nLm1vZHVsZWAgY2FsbCxcbiAqICAgICBlLmcuIHdpdGggYWRkaXRpb25hbCBpbXBvcnRzIG9yIHJlcXVpcmVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0VTNShob3N0OiBFczVQcm9jZXNzb3JIb3N0LCBmaWxlTmFtZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOlxuICAgIHtvdXRwdXQ6IHN0cmluZywgcmVmZXJlbmNlZE1vZHVsZXM6IHN0cmluZ1tdfSB7XG4gIGNvbnN0IGZpbGUgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCBjb250ZW50LCB0cy5TY3JpcHRUYXJnZXQuRVM1LCB0cnVlKTtcbiAgcmV0dXJuIG5ldyBFUzVQcm9jZXNzb3IoaG9zdCwgZmlsZSkucHJvY2VzcygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydENvbW1vbkpzVG9Hb29nTW9kdWxlSWZOZWVkZWQoXG4gICAgaG9zdDogRXM1UHJvY2Vzc29ySG9zdCwgbW9kdWxlc01hbmlmZXN0OiBNb2R1bGVzTWFuaWZlc3QsIGZpbGVOYW1lOiBzdHJpbmcsXG4gICAgY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFob3N0Lmdvb2dtb2R1bGUgfHwgaXNEdHNGaWxlTmFtZShmaWxlTmFtZSkpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBjb25zdCB7b3V0cHV0LCByZWZlcmVuY2VkTW9kdWxlc30gPSBwcm9jZXNzRVM1KGhvc3QsIGZpbGVOYW1lLCBjb250ZW50KTtcblxuICBjb25zdCBtb2R1bGVOYW1lID0gaG9zdC5wYXRoVG9Nb2R1bGVOYW1lKCcnLCBmaWxlTmFtZSk7XG4gIG1vZHVsZXNNYW5pZmVzdC5hZGRNb2R1bGUoZmlsZU5hbWUsIG1vZHVsZU5hbWUpO1xuICBmb3IgKGNvbnN0IHJlZmVyZW5jZWQgb2YgcmVmZXJlbmNlZE1vZHVsZXMpIHtcbiAgICBtb2R1bGVzTWFuaWZlc3QuYWRkUmVmZXJlbmNlZE1vZHVsZShmaWxlTmFtZSwgcmVmZXJlbmNlZCk7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuIl19