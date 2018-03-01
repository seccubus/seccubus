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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/decorator-annotator", ["require", "exports", "tsickle/src/decorators", "tsickle/src/rewriter", "tsickle/src/type-translator", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var decorators_1 = require("tsickle/src/decorators");
    var rewriter_1 = require("tsickle/src/rewriter");
    var type_translator_1 = require("tsickle/src/type-translator");
    var ts = require("tsickle/src/typescript");
    function shouldLower(decorator, typeChecker) {
        try {
            for (var _a = __values(decorators_1.getDecoratorDeclarations(decorator, typeChecker)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var d = _b.value;
                // TODO(lucassloan):
                // Switch to the TS JSDoc parser in the future to avoid false positives here.
                // For example using '@Annotation' in a true comment.
                // However, a new TS API would be needed, track at
                // https://github.com/Microsoft/TypeScript/issues/7393.
                var commentNode = d;
                // Not handling PropertyAccess expressions here, because they are
                // filtered earlier.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclaration) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                // Go up one more level to VariableDeclarationStatement, where usually
                // the comment lives. If the declaration has an 'export', the
                // VDList.getFullText will not contain the comment.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclarationList) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                var range = ts.getLeadingCommentRanges(commentNode.getFullText(), 0);
                if (!range)
                    continue;
                try {
                    for (var range_1 = __values(range), range_1_1 = range_1.next(); !range_1_1.done; range_1_1 = range_1.next()) {
                        var _c = range_1_1.value, pos = _c.pos, end = _c.end;
                        var jsDocText = commentNode.getFullText().substring(pos, end);
                        if (jsDocText.includes('@Annotation'))
                            return true;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (range_1_1 && !range_1_1.done && (_d = range_1.return)) _d.call(range_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return false;
        var e_2, _e, e_1, _d;
    }
    exports.shouldLower = shouldLower;
    // DecoratorClassVisitor rewrites a single "class Foo {...}" declaration.
    // It's its own object because we collect decorators on the class and the ctor
    // separately for each class we encounter.
    var DecoratorClassVisitor = /** @class */ (function () {
        function DecoratorClassVisitor(typeChecker, rewriter, classDecl, importedNames) {
            this.typeChecker = typeChecker;
            this.rewriter = rewriter;
            this.classDecl = classDecl;
            this.importedNames = importedNames;
            if (classDecl.decorators) {
                var toLower = this.decoratorsToLower(classDecl);
                if (toLower.length > 0)
                    this.decorators = toLower;
            }
        }
        /**
         * Determines whether the given decorator should be re-written as an annotation.
         */
        DecoratorClassVisitor.prototype.decoratorsToLower = function (n) {
            var _this = this;
            if (n.decorators) {
                return n.decorators.filter(function (d) { return shouldLower(d, _this.typeChecker); });
            }
            return [];
        };
        /**
         * gatherConstructor grabs the parameter list and decorators off the class
         * constructor, and emits nothing.
         */
        DecoratorClassVisitor.prototype.gatherConstructor = function (ctor) {
            var ctorParameters = [];
            var hasDecoratedParam = false;
            try {
                for (var _a = __values(ctor.parameters), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var param = _b.value;
                    var ctorParam = { type: null, decorators: null };
                    if (param.decorators) {
                        ctorParam.decorators = this.decoratorsToLower(param);
                        hasDecoratedParam = hasDecoratedParam || ctorParam.decorators.length > 0;
                    }
                    if (param.type) {
                        // param has a type provided, e.g. "foo: Bar".
                        // Verify that "Bar" is a value (e.g. a constructor) and not just a type.
                        var sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol();
                        if (sym && (sym.flags & ts.SymbolFlags.Value)) {
                            ctorParam.type = param.type;
                        }
                    }
                    ctorParameters.push(ctorParam);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // Use the ctor parameter metadata only if the class or the ctor was decorated.
            if (this.decorators || hasDecoratedParam) {
                this.ctorParameters = ctorParameters;
            }
            var e_3, _c;
        };
        /**
         * gatherMethod grabs the decorators off a class method and emits nothing.
         */
        DecoratorClassVisitor.prototype.gatherMethodOrProperty = function (method) {
            if (!method.decorators)
                return;
            if (!method.name || method.name.kind !== ts.SyntaxKind.Identifier) {
                // Method has a weird name, e.g.
                //   [Symbol.foo]() {...}
                this.rewriter.error(method, 'cannot process decorators on strangely named method');
                return;
            }
            var name = method.name.text;
            var decorators = this.decoratorsToLower(method);
            if (decorators.length === 0)
                return;
            if (!this.propDecorators)
                this.propDecorators = new Map();
            this.propDecorators.set(name, decorators);
        };
        /**
         * For lowering decorators, we need to refer to constructor types.
         * So we start with the identifiers that represent these types.
         * However, TypeScript does not allow us to emit them in a value position
         * as it associated different symbol information with it.
         *
         * This method looks for the place where the value that is associated to
         * the type is defined and returns that identifier instead.
         *
         * This might be simplified when https://github.com/Microsoft/TypeScript/issues/17516 is solved.
         */
        DecoratorClassVisitor.prototype.getValueIdentifierForType = function (typeSymbol, typeNode) {
            var valueDeclaration = typeSymbol.valueDeclaration;
            if (!valueDeclaration)
                return null;
            var valueName = valueDeclaration.name;
            if (!valueName || valueName.kind !== ts.SyntaxKind.Identifier) {
                return null;
            }
            if (valueName.getSourceFile() === this.rewriter.file) {
                return valueName;
            }
            // Need to look at the first identifier only
            // to ignore generics.
            var firstIdentifierInType = firstIdentifierInSubtree(typeNode);
            if (firstIdentifierInType) {
                try {
                    for (var _a = __values(this.importedNames), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var _c = _b.value, name_1 = _c.name, declarationNames = _c.declarationNames;
                        if (firstIdentifierInType.text === name_1.text &&
                            declarationNames.some(function (d) { return d === valueName; })) {
                            return name_1;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            return null;
            var e_4, _d;
        };
        DecoratorClassVisitor.prototype.beforeProcessNode = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.Constructor:
                    this.gatherConstructor(node);
                    break;
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.SetAccessor:
                case ts.SyntaxKind.GetAccessor:
                case ts.SyntaxKind.MethodDeclaration:
                    this.gatherMethodOrProperty(node);
                    break;
                default:
            }
        };
        /**
         * Checks if the decorator is on a class, as opposed to a field or an
         * argument.
         */
        DecoratorClassVisitor.prototype.isClassDecorator = function (decorator) {
            return decorator.parent !== undefined &&
                decorator.parent.kind === ts.SyntaxKind.ClassDeclaration;
        };
        DecoratorClassVisitor.prototype.maybeProcessDecorator = function (node, start) {
            // Only strip field and argument decorators, the class decoration
            // downlevel transformer will strip class decorations
            if (shouldLower(node, this.typeChecker) && !this.isClassDecorator(node)) {
                // Return true to signal that this node should not be emitted,
                // but still emit the whitespace *before* the node.
                if (!start) {
                    start = node.getFullStart();
                }
                this.rewriter.writeRange(node, start, node.getStart());
                return true;
            }
            return false;
        };
        DecoratorClassVisitor.prototype.foundDecorators = function () {
            return !!(this.decorators || this.ctorParameters || this.propDecorators);
        };
        /**
         * emits the types for the various gathered metadata to be used
         * in the tsickle type annotations helper.
         */
        DecoratorClassVisitor.prototype.emitMetadataTypeAnnotationsHelpers = function () {
            if (!this.classDecl.name)
                return;
            var className = rewriter_1.getIdentifierText(this.classDecl.name);
            if (this.decorators) {
                this.rewriter.emit("/** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */\n");
                this.rewriter.emit(className + ".decorators;\n");
            }
            if (this.decorators || this.ctorParameters) {
                this.rewriter.emit("/**\n");
                this.rewriter.emit(" * @nocollapse\n");
                this.rewriter.emit(" * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}\n");
                this.rewriter.emit(" */\n");
                this.rewriter.emit(className + ".ctorParameters;\n");
            }
            if (this.propDecorators) {
                this.rewriter.emit("/** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */\n");
                this.rewriter.emit(className + ".propDecorators;\n");
            }
        };
        /**
         * emitMetadata emits the various gathered metadata, as static fields.
         */
        DecoratorClassVisitor.prototype.emitMetadataAsStaticProperties = function () {
            var decoratorInvocations = '{type: Function, args?: any[]}[]';
            if (this.decorators || this.ctorParameters) {
                this.rewriter.emit("/** @nocollapse */\n");
                // ctorParameters may contain forward references in the type: field, so wrap in a function
                // closure
                this.rewriter.emit("static ctorParameters: () => ({type: any, decorators?: " + decoratorInvocations +
                    "}|null)[] = () => [\n");
                try {
                    for (var _a = __values(this.ctorParameters || []), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var param = _b.value;
                        if (!param.type && !param.decorators) {
                            this.rewriter.emit('null,\n');
                            continue;
                        }
                        this.rewriter.emit("{type: ");
                        if (!param.type) {
                            this.rewriter.emit("undefined");
                        }
                        else {
                            // For transformer mode, tsickle must emit not only the string referring to the type,
                            // but also create a source mapping, so that TypeScript can later recognize that the
                            // symbol is used in a value position, so that TypeScript emits an import for the
                            // symbol.
                            // The code below and in getValueIdentifierForType finds the value node corresponding to
                            // the type and emits that symbol if possible. This causes a source mapping to the value,
                            // which then allows later transformers in the pipeline to do the correct module
                            // rewriting. Note that we cannot use param.type as the emit node directly (not even just
                            // for mapping), because that is marked as a type use of the node, not a value use, so it
                            // doesn't get updated as an export.
                            var sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol();
                            var emitNode = this.getValueIdentifierForType(sym, param.type);
                            if (emitNode) {
                                this.rewriter.writeRange(emitNode, emitNode.getStart(), emitNode.getEnd());
                            }
                            else {
                                var typeStr = new type_translator_1.TypeTranslator(this.typeChecker, param.type)
                                    .symbolToString(sym, /* useFqn */ true);
                                this.rewriter.emit(typeStr);
                            }
                        }
                        this.rewriter.emit(", ");
                        if (param.decorators) {
                            this.rewriter.emit('decorators: [');
                            try {
                                for (var _c = __values(param.decorators), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var decorator = _d.value;
                                    this.emitDecorator(decorator);
                                    this.rewriter.emit(', ');
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                            this.rewriter.emit(']');
                        }
                        this.rewriter.emit('},\n');
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                this.rewriter.emit("];\n");
            }
            if (this.propDecorators) {
                this.rewriter.emit("static propDecorators: {[key: string]: " + decoratorInvocations + "} = {\n");
                try {
                    for (var _g = __values(this.propDecorators.keys()), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var name_2 = _h.value;
                        this.rewriter.emit("\"" + name_2 + "\": [");
                        try {
                            for (var _j = __values(this.propDecorators.get(name_2)), _k = _j.next(); !_k.done; _k = _j.next()) {
                                var decorator = _k.value;
                                this.emitDecorator(decorator);
                                this.rewriter.emit(',');
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_k && !_k.done && (_l = _j.return)) _l.call(_j);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        this.rewriter.emit('],\n');
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_m = _g.return)) _m.call(_g);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                this.rewriter.emit('};\n');
            }
            var e_6, _f, e_5, _e, e_8, _m, e_7, _l;
        };
        DecoratorClassVisitor.prototype.emitDecorator = function (decorator) {
            this.rewriter.emit('{ type: ');
            var expr = decorator.expression;
            switch (expr.kind) {
                case ts.SyntaxKind.Identifier:
                    // The decorator was a plain @Foo.
                    this.rewriter.visit(expr);
                    break;
                case ts.SyntaxKind.CallExpression:
                    // The decorator was a call, like @Foo(bar).
                    var call = expr;
                    this.rewriter.visit(call.expression);
                    if (call.arguments.length) {
                        this.rewriter.emit(', args: [');
                        try {
                            for (var _a = __values(call.arguments), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var arg = _b.value;
                                this.rewriter.writeNodeFrom(arg, arg.getStart());
                                this.rewriter.emit(', ');
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        this.rewriter.emit(']');
                    }
                    break;
                default:
                    this.rewriter.errorUnimplementedKind(expr, 'gathering metadata');
                    this.rewriter.emit('undefined');
            }
            this.rewriter.emit(' }');
            var e_9, _c;
        };
        return DecoratorClassVisitor;
    }());
    exports.DecoratorClassVisitor = DecoratorClassVisitor;
    var DecoratorRewriter = /** @class */ (function (_super) {
        __extends(DecoratorRewriter, _super);
        function DecoratorRewriter(typeChecker, sourceFile, sourceMapper) {
            var _this = _super.call(this, sourceFile, sourceMapper) || this;
            _this.typeChecker = typeChecker;
            _this.importedNames = [];
            return _this;
        }
        DecoratorRewriter.prototype.process = function () {
            this.visit(this.file);
            return this.getOutput();
        };
        DecoratorRewriter.prototype.maybeProcess = function (node) {
            if (this.currentDecoratorConverter) {
                this.currentDecoratorConverter.beforeProcessNode(node);
            }
            switch (node.kind) {
                case ts.SyntaxKind.ImportDeclaration:
                    (_a = this.importedNames).push.apply(_a, __spread(collectImportedNames(this.typeChecker, node)));
                    return false;
                case ts.SyntaxKind.Decorator:
                    return this.currentDecoratorConverter &&
                        this.currentDecoratorConverter.maybeProcessDecorator(node);
                case ts.SyntaxKind.ClassDeclaration:
                    var oldDecoratorConverter = this.currentDecoratorConverter;
                    this.currentDecoratorConverter = new DecoratorClassVisitor(this.typeChecker, this, node, this.importedNames);
                    this.writeLeadingTrivia(node);
                    visitClassContentIncludingDecorators(node, this, this.currentDecoratorConverter);
                    this.currentDecoratorConverter = oldDecoratorConverter;
                    return true;
                default:
                    return false;
            }
            var _a;
        };
        return DecoratorRewriter;
    }(rewriter_1.Rewriter));
    /**
     * Returns the first identifier in the node tree starting at node
     * in a depth first order.
     *
     * @param node The node to start with
     * @return The first identifier if one was found.
     */
    function firstIdentifierInSubtree(node) {
        if (node.kind === ts.SyntaxKind.Identifier) {
            return node;
        }
        return ts.forEachChild(node, firstIdentifierInSubtree);
    }
    /**
     * Collect the Identifiers used as named bindings in the given import declaration
     * with their Symbol.
     * This is needed later on to find an identifier that represents the value
     * of an imported type identifier.
     */
    function collectImportedNames(typeChecker, decl) {
        var importedNames = [];
        var importClause = decl.importClause;
        if (!importClause) {
            return importedNames;
        }
        var names = [];
        if (importClause.name) {
            names.push(importClause.name);
        }
        if (importClause.namedBindings &&
            importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
            var namedImports = importClause.namedBindings;
            names.push.apply(names, __spread(namedImports.elements.map(function (e) { return e.name; })));
        }
        try {
            for (var names_1 = __values(names), names_1_1 = names_1.next(); !names_1_1.done; names_1_1 = names_1.next()) {
                var name_3 = names_1_1.value;
                var symbol = typeChecker.getSymbolAtLocation(name_3);
                if (symbol.flags & ts.SymbolFlags.Alias) {
                    symbol = typeChecker.getAliasedSymbol(symbol);
                }
                var declarationNames = [];
                if (symbol.declarations) {
                    try {
                        for (var _a = __values(symbol.declarations), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var d = _b.value;
                            var decl_1 = d;
                            if (decl_1.name && decl_1.name.kind === ts.SyntaxKind.Identifier) {
                                declarationNames.push(decl_1.name);
                            }
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                }
                if (symbol.declarations) {
                    importedNames.push({ name: name_3, declarationNames: declarationNames });
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (names_1_1 && !names_1_1.done && (_d = names_1.return)) _d.call(names_1);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return importedNames;
        var e_11, _d, e_10, _c;
    }
    exports.collectImportedNames = collectImportedNames;
    function visitClassContentIncludingDecorators(classDecl, rewriter, decoratorVisitor) {
        if (rewriter.file.text[classDecl.getEnd() - 1] !== '}') {
            rewriter.error(classDecl, 'unexpected class terminator');
            return;
        }
        rewriter.writeNodeFrom(classDecl, classDecl.getStart(), classDecl.getEnd() - 1);
        // At this point, we've emitted up through the final child of the class, so all that
        // remains is the trailing whitespace and closing curly brace.
        // The final character owned by the class node should always be a '}',
        // or we somehow got the AST wrong and should report an error.
        // (Any whitespace or semicolon following the '}' will be part of the next Node.)
        if (decoratorVisitor) {
            decoratorVisitor.emitMetadataAsStaticProperties();
        }
        rewriter.writeRange(classDecl, classDecl.getEnd() - 1, classDecl.getEnd());
    }
    exports.visitClassContentIncludingDecorators = visitClassContentIncludingDecorators;
    function convertDecorators(typeChecker, sourceFile, sourceMapper) {
        return new DecoratorRewriter(typeChecker, sourceFile, sourceMapper).process();
    }
    exports.convertDecorators = convertDecorators;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9yLWFubm90YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kZWNvcmF0b3ItYW5ub3RhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUlILHFEQUFzRDtJQUN0RCxpREFBdUQ7SUFFdkQsK0RBQWlEO0lBQ2pELDJDQUFtQztJQWdCbkMscUJBQTRCLFNBQXVCLEVBQUUsV0FBMkI7O1lBQzlFLEdBQUcsQ0FBQyxDQUFZLElBQUEsS0FBQSxTQUFBLHFDQUF3QixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQSxnQkFBQTtnQkFBM0QsSUFBTSxDQUFDLFdBQUE7Z0JBQ1Ysb0JBQW9CO2dCQUNwQiw2RUFBNkU7Z0JBQzdFLHFEQUFxRDtnQkFDckQsa0RBQWtEO2dCQUNsRCx1REFBdUQ7Z0JBQ3ZELElBQUksV0FBVyxHQUFZLENBQUMsQ0FBQztnQkFDN0IsaUVBQWlFO2dCQUNqRSxvQkFBb0I7Z0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7b0JBQzNELEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQzt3QkFBQyxRQUFRLENBQUM7b0JBQ2xDLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO2dCQUNuQyxDQUFDO2dCQUNELHNFQUFzRTtnQkFDdEUsNkRBQTZEO2dCQUM3RCxtREFBbUQ7Z0JBQ25ELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQzt3QkFBQyxRQUFRLENBQUM7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Q0FBQyxhQUFhLENBQUM7O0lBQ3ZCLENBQUM7SUFuQ0Qsb0RBbUNDO0lBR0QsOENBQ0ksU0FBOEIsRUFBRSxRQUFrQixFQUFFLGdCQUF3QztRQUM5RixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN2RCxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQztRQUNULENBQUM7UUFDRCxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLG9GQUFvRjtRQUNwRiw4REFBOEQ7UUFDOUQsc0VBQXNFO1FBQ3RFLDhEQUE4RDtRQUM5RCxpRkFBaUY7UUFDakYsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLGdCQUFnQixDQUFDLDhCQUE4QixFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUNELFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQWhCRCxvRkFnQkM7SUFHRCwyQkFDSSxXQUEyQixFQUFFLFVBQXlCLEVBQ3RELFlBQTBCO1FBQzVCLE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDaEYsQ0FBQztJQUpELDhDQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NvdXJjZU1hcEdlbmVyYXRvcn0gZnJvbSAnc291cmNlLW1hcCc7XG5cbmltcG9ydCB7Z2V0RGVjb3JhdG9yRGVjbGFyYXRpb25zfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuaW1wb3J0IHtnZXRJZGVudGlmaWVyVGV4dCwgUmV3cml0ZXJ9IGZyb20gJy4vcmV3cml0ZXInO1xuaW1wb3J0IHtTb3VyY2VNYXBwZXJ9IGZyb20gJy4vc291cmNlX21hcF91dGlscyc7XG5pbXBvcnQge1R5cGVUcmFuc2xhdG9yfSBmcm9tICcuL3R5cGUtdHJhbnNsYXRvcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yUGFyYW1ldGVycyBhcmUgZ2F0aGVyZWQgZnJvbSBjb25zdHJ1Y3RvcnMsIHNvIHRoYXQgdGhlaXIgdHlwZSBpbmZvcm1hdGlvbiBhbmRcbiAqIGRlY29yYXRvcnMgY2FuIGxhdGVyIGJlIGVtaXR0ZWQgYXMgYW4gYW5ub3RhdGlvbi5cbiAqL1xuaW50ZXJmYWNlIENvbnN0cnVjdG9yUGFyYW1ldGVyIHtcbiAgLyoqXG4gICAqIFRoZSB0eXBlIGRlY2xhcmF0aW9uIGZvciB0aGUgcGFyYW1ldGVyLiBPbmx5IHNldCBpZiB0aGUgdHlwZSBpcyBhIHZhbHVlIChlLmcuIGEgY2xhc3MsIG5vdCBhblxuICAgKiBpbnRlcmZhY2UpLlxuICAgKi9cbiAgdHlwZTogdHMuVHlwZU5vZGV8bnVsbDtcbiAgLyoqIFRoZSBsaXN0IG9mIGRlY29yYXRvcnMgZm91bmQgb24gdGhlIHBhcmFtZXRlciwgbnVsbCBpZiBub25lLiAqL1xuICBkZWNvcmF0b3JzOiB0cy5EZWNvcmF0b3JbXXxudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkTG93ZXIoZGVjb3JhdG9yOiB0cy5EZWNvcmF0b3IsIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcikge1xuICBmb3IgKGNvbnN0IGQgb2YgZ2V0RGVjb3JhdG9yRGVjbGFyYXRpb25zKGRlY29yYXRvciwgdHlwZUNoZWNrZXIpKSB7XG4gICAgLy8gVE9ETyhsdWNhc3Nsb2FuKTpcbiAgICAvLyBTd2l0Y2ggdG8gdGhlIFRTIEpTRG9jIHBhcnNlciBpbiB0aGUgZnV0dXJlIHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcyBoZXJlLlxuICAgIC8vIEZvciBleGFtcGxlIHVzaW5nICdAQW5ub3RhdGlvbicgaW4gYSB0cnVlIGNvbW1lbnQuXG4gICAgLy8gSG93ZXZlciwgYSBuZXcgVFMgQVBJIHdvdWxkIGJlIG5lZWRlZCwgdHJhY2sgYXRcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzczOTMuXG4gICAgbGV0IGNvbW1lbnROb2RlOiB0cy5Ob2RlID0gZDtcbiAgICAvLyBOb3QgaGFuZGxpbmcgUHJvcGVydHlBY2Nlc3MgZXhwcmVzc2lvbnMgaGVyZSwgYmVjYXVzZSB0aGV5IGFyZVxuICAgIC8vIGZpbHRlcmVkIGVhcmxpZXIuXG4gICAgaWYgKGNvbW1lbnROb2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbikge1xuICAgICAgaWYgKCFjb21tZW50Tm9kZS5wYXJlbnQpIGNvbnRpbnVlO1xuICAgICAgY29tbWVudE5vZGUgPSBjb21tZW50Tm9kZS5wYXJlbnQ7XG4gICAgfVxuICAgIC8vIEdvIHVwIG9uZSBtb3JlIGxldmVsIHRvIFZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIHdoZXJlIHVzdWFsbHlcbiAgICAvLyB0aGUgY29tbWVudCBsaXZlcy4gSWYgdGhlIGRlY2xhcmF0aW9uIGhhcyBhbiAnZXhwb3J0JywgdGhlXG4gICAgLy8gVkRMaXN0LmdldEZ1bGxUZXh0IHdpbGwgbm90IGNvbnRhaW4gdGhlIGNvbW1lbnQuXG4gICAgaWYgKGNvbW1lbnROb2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QpIHtcbiAgICAgIGlmICghY29tbWVudE5vZGUucGFyZW50KSBjb250aW51ZTtcbiAgICAgIGNvbW1lbnROb2RlID0gY29tbWVudE5vZGUucGFyZW50O1xuICAgIH1cbiAgICBjb25zdCByYW5nZSA9IHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKGNvbW1lbnROb2RlLmdldEZ1bGxUZXh0KCksIDApO1xuICAgIGlmICghcmFuZ2UpIGNvbnRpbnVlO1xuICAgIGZvciAoY29uc3Qge3BvcywgZW5kfSBvZiByYW5nZSkge1xuICAgICAgY29uc3QganNEb2NUZXh0ID0gY29tbWVudE5vZGUuZ2V0RnVsbFRleHQoKS5zdWJzdHJpbmcocG9zLCBlbmQpO1xuICAgICAgaWYgKGpzRG9jVGV4dC5pbmNsdWRlcygnQEFubm90YXRpb24nKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLy8gRGVjb3JhdG9yQ2xhc3NWaXNpdG9yIHJld3JpdGVzIGEgc2luZ2xlIFwiY2xhc3MgRm9vIHsuLi59XCIgZGVjbGFyYXRpb24uXG4vLyBJdCdzIGl0cyBvd24gb2JqZWN0IGJlY2F1c2Ugd2UgY29sbGVjdCBkZWNvcmF0b3JzIG9uIHRoZSBjbGFzcyBhbmQgdGhlIGN0b3Jcbi8vIHNlcGFyYXRlbHkgZm9yIGVhY2ggY2xhc3Mgd2UgZW5jb3VudGVyLlxuZXhwb3J0IGNsYXNzIERlY29yYXRvckNsYXNzVmlzaXRvciB7XG4gIC8qKiBEZWNvcmF0b3JzIG9uIHRoZSBjbGFzcyBpdHNlbGYuICovXG4gIGRlY29yYXRvcnM6IHRzLkRlY29yYXRvcltdO1xuICAvKiogVGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBsaXN0IGFuZCBkZWNvcmF0b3JzIG9uIGVhY2ggcGFyYW0uICovXG4gIHByaXZhdGUgY3RvclBhcmFtZXRlcnM6IENvbnN0cnVjdG9yUGFyYW1ldGVyW107XG4gIC8qKiBQZXItbWV0aG9kIGRlY29yYXRvcnMuICovXG4gIHByb3BEZWNvcmF0b3JzOiBNYXA8c3RyaW5nLCB0cy5EZWNvcmF0b3JbXT47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgcHJpdmF0ZSByZXdyaXRlcjogUmV3cml0ZXIsXG4gICAgICBwcml2YXRlIGNsYXNzRGVjbDogdHMuQ2xhc3NEZWNsYXJhdGlvbixcbiAgICAgIHByaXZhdGUgaW1wb3J0ZWROYW1lczogQXJyYXk8e25hbWU6IHRzLklkZW50aWZpZXIsIGRlY2xhcmF0aW9uTmFtZXM6IHRzLklkZW50aWZpZXJbXX0+KSB7XG4gICAgaWYgKGNsYXNzRGVjbC5kZWNvcmF0b3JzKSB7XG4gICAgICBjb25zdCB0b0xvd2VyID0gdGhpcy5kZWNvcmF0b3JzVG9Mb3dlcihjbGFzc0RlY2wpO1xuICAgICAgaWYgKHRvTG93ZXIubGVuZ3RoID4gMCkgdGhpcy5kZWNvcmF0b3JzID0gdG9Mb3dlcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBnaXZlbiBkZWNvcmF0b3Igc2hvdWxkIGJlIHJlLXdyaXR0ZW4gYXMgYW4gYW5ub3RhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgZGVjb3JhdG9yc1RvTG93ZXIobjogdHMuTm9kZSk6IHRzLkRlY29yYXRvcltdIHtcbiAgICBpZiAobi5kZWNvcmF0b3JzKSB7XG4gICAgICByZXR1cm4gbi5kZWNvcmF0b3JzLmZpbHRlcigoZCkgPT4gc2hvdWxkTG93ZXIoZCwgdGhpcy50eXBlQ2hlY2tlcikpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogZ2F0aGVyQ29uc3RydWN0b3IgZ3JhYnMgdGhlIHBhcmFtZXRlciBsaXN0IGFuZCBkZWNvcmF0b3JzIG9mZiB0aGUgY2xhc3NcbiAgICogY29uc3RydWN0b3IsIGFuZCBlbWl0cyBub3RoaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBnYXRoZXJDb25zdHJ1Y3RvcihjdG9yOiB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKSB7XG4gICAgY29uc3QgY3RvclBhcmFtZXRlcnM6IENvbnN0cnVjdG9yUGFyYW1ldGVyW10gPSBbXTtcbiAgICBsZXQgaGFzRGVjb3JhdGVkUGFyYW0gPSBmYWxzZTtcbiAgICBmb3IgKGNvbnN0IHBhcmFtIG9mIGN0b3IucGFyYW1ldGVycykge1xuICAgICAgY29uc3QgY3RvclBhcmFtOiBDb25zdHJ1Y3RvclBhcmFtZXRlciA9IHt0eXBlOiBudWxsLCBkZWNvcmF0b3JzOiBudWxsfTtcbiAgICAgIGlmIChwYXJhbS5kZWNvcmF0b3JzKSB7XG4gICAgICAgIGN0b3JQYXJhbS5kZWNvcmF0b3JzID0gdGhpcy5kZWNvcmF0b3JzVG9Mb3dlcihwYXJhbSk7XG4gICAgICAgIGhhc0RlY29yYXRlZFBhcmFtID0gaGFzRGVjb3JhdGVkUGFyYW0gfHwgY3RvclBhcmFtLmRlY29yYXRvcnMubGVuZ3RoID4gMDtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJhbS50eXBlKSB7XG4gICAgICAgIC8vIHBhcmFtIGhhcyBhIHR5cGUgcHJvdmlkZWQsIGUuZy4gXCJmb286IEJhclwiLlxuICAgICAgICAvLyBWZXJpZnkgdGhhdCBcIkJhclwiIGlzIGEgdmFsdWUgKGUuZy4gYSBjb25zdHJ1Y3RvcikgYW5kIG5vdCBqdXN0IGEgdHlwZS5cbiAgICAgICAgY29uc3Qgc3ltID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihwYXJhbS50eXBlKS5nZXRTeW1ib2woKTtcbiAgICAgICAgaWYgKHN5bSAmJiAoc3ltLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVmFsdWUpKSB7XG4gICAgICAgICAgY3RvclBhcmFtLnR5cGUgPSBwYXJhbS50eXBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjdG9yUGFyYW1ldGVycy5wdXNoKGN0b3JQYXJhbSk7XG4gICAgfVxuXG4gICAgLy8gVXNlIHRoZSBjdG9yIHBhcmFtZXRlciBtZXRhZGF0YSBvbmx5IGlmIHRoZSBjbGFzcyBvciB0aGUgY3RvciB3YXMgZGVjb3JhdGVkLlxuICAgIGlmICh0aGlzLmRlY29yYXRvcnMgfHwgaGFzRGVjb3JhdGVkUGFyYW0pIHtcbiAgICAgIHRoaXMuY3RvclBhcmFtZXRlcnMgPSBjdG9yUGFyYW1ldGVycztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogZ2F0aGVyTWV0aG9kIGdyYWJzIHRoZSBkZWNvcmF0b3JzIG9mZiBhIGNsYXNzIG1ldGhvZCBhbmQgZW1pdHMgbm90aGluZy5cbiAgICovXG4gIHByaXZhdGUgZ2F0aGVyTWV0aG9kT3JQcm9wZXJ0eShtZXRob2Q6IHRzLk5hbWVkRGVjbGFyYXRpb24pIHtcbiAgICBpZiAoIW1ldGhvZC5kZWNvcmF0b3JzKSByZXR1cm47XG4gICAgaWYgKCFtZXRob2QubmFtZSB8fCBtZXRob2QubmFtZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgIC8vIE1ldGhvZCBoYXMgYSB3ZWlyZCBuYW1lLCBlLmcuXG4gICAgICAvLyAgIFtTeW1ib2wuZm9vXSgpIHsuLi59XG4gICAgICB0aGlzLnJld3JpdGVyLmVycm9yKG1ldGhvZCwgJ2Nhbm5vdCBwcm9jZXNzIGRlY29yYXRvcnMgb24gc3RyYW5nZWx5IG5hbWVkIG1ldGhvZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5hbWUgPSAobWV0aG9kLm5hbWUgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICBjb25zdCBkZWNvcmF0b3JzOiB0cy5EZWNvcmF0b3JbXSA9IHRoaXMuZGVjb3JhdG9yc1RvTG93ZXIobWV0aG9kKTtcbiAgICBpZiAoZGVjb3JhdG9ycy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICBpZiAoIXRoaXMucHJvcERlY29yYXRvcnMpIHRoaXMucHJvcERlY29yYXRvcnMgPSBuZXcgTWFwPHN0cmluZywgdHMuRGVjb3JhdG9yW10+KCk7XG4gICAgdGhpcy5wcm9wRGVjb3JhdG9ycy5zZXQobmFtZSwgZGVjb3JhdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIGxvd2VyaW5nIGRlY29yYXRvcnMsIHdlIG5lZWQgdG8gcmVmZXIgdG8gY29uc3RydWN0b3IgdHlwZXMuXG4gICAqIFNvIHdlIHN0YXJ0IHdpdGggdGhlIGlkZW50aWZpZXJzIHRoYXQgcmVwcmVzZW50IHRoZXNlIHR5cGVzLlxuICAgKiBIb3dldmVyLCBUeXBlU2NyaXB0IGRvZXMgbm90IGFsbG93IHVzIHRvIGVtaXQgdGhlbSBpbiBhIHZhbHVlIHBvc2l0aW9uXG4gICAqIGFzIGl0IGFzc29jaWF0ZWQgZGlmZmVyZW50IHN5bWJvbCBpbmZvcm1hdGlvbiB3aXRoIGl0LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBsb29rcyBmb3IgdGhlIHBsYWNlIHdoZXJlIHRoZSB2YWx1ZSB0aGF0IGlzIGFzc29jaWF0ZWQgdG9cbiAgICogdGhlIHR5cGUgaXMgZGVmaW5lZCBhbmQgcmV0dXJucyB0aGF0IGlkZW50aWZpZXIgaW5zdGVhZC5cbiAgICpcbiAgICogVGhpcyBtaWdodCBiZSBzaW1wbGlmaWVkIHdoZW4gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzUxNiBpcyBzb2x2ZWQuXG4gICAqL1xuICBwcml2YXRlIGdldFZhbHVlSWRlbnRpZmllckZvclR5cGUodHlwZVN5bWJvbDogdHMuU3ltYm9sLCB0eXBlTm9kZTogdHMuVHlwZU5vZGUpOiB0cy5JZGVudGlmaWVyXG4gICAgICB8bnVsbCB7XG4gICAgY29uc3QgdmFsdWVEZWNsYXJhdGlvbiA9IHR5cGVTeW1ib2wudmFsdWVEZWNsYXJhdGlvbiBhcyB0cy5OYW1lZERlY2xhcmF0aW9uO1xuICAgIGlmICghdmFsdWVEZWNsYXJhdGlvbikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdmFsdWVOYW1lID0gdmFsdWVEZWNsYXJhdGlvbi5uYW1lO1xuICAgIGlmICghdmFsdWVOYW1lIHx8IHZhbHVlTmFtZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodmFsdWVOYW1lLmdldFNvdXJjZUZpbGUoKSA9PT0gdGhpcy5yZXdyaXRlci5maWxlKSB7XG4gICAgICByZXR1cm4gdmFsdWVOYW1lO1xuICAgIH1cbiAgICAvLyBOZWVkIHRvIGxvb2sgYXQgdGhlIGZpcnN0IGlkZW50aWZpZXIgb25seVxuICAgIC8vIHRvIGlnbm9yZSBnZW5lcmljcy5cbiAgICBjb25zdCBmaXJzdElkZW50aWZpZXJJblR5cGUgPSBmaXJzdElkZW50aWZpZXJJblN1YnRyZWUodHlwZU5vZGUpO1xuICAgIGlmIChmaXJzdElkZW50aWZpZXJJblR5cGUpIHtcbiAgICAgIGZvciAoY29uc3Qge25hbWUsIGRlY2xhcmF0aW9uTmFtZXN9IG9mIHRoaXMuaW1wb3J0ZWROYW1lcykge1xuICAgICAgICBpZiAoZmlyc3RJZGVudGlmaWVySW5UeXBlLnRleHQgPT09IG5hbWUudGV4dCAmJlxuICAgICAgICAgICAgZGVjbGFyYXRpb25OYW1lcy5zb21lKGQgPT4gZCA9PT0gdmFsdWVOYW1lKSkge1xuICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYmVmb3JlUHJvY2Vzc05vZGUobm9kZTogdHMuTm9kZSkge1xuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3I6XG4gICAgICAgIHRoaXMuZ2F0aGVyQ29uc3RydWN0b3Iobm9kZSBhcyB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbjpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TZXRBY2Nlc3NvcjpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HZXRBY2Nlc3NvcjpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5NZXRob2REZWNsYXJhdGlvbjpcbiAgICAgICAgdGhpcy5nYXRoZXJNZXRob2RPclByb3BlcnR5KG5vZGUgYXMgdHMuRGVjbGFyYXRpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZGVjb3JhdG9yIGlzIG9uIGEgY2xhc3MsIGFzIG9wcG9zZWQgdG8gYSBmaWVsZCBvciBhblxuICAgKiBhcmd1bWVudC5cbiAgICovXG4gIHByaXZhdGUgaXNDbGFzc0RlY29yYXRvcihkZWNvcmF0b3I6IHRzLkRlY29yYXRvcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkZWNvcmF0b3IucGFyZW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgZGVjb3JhdG9yLnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb247XG4gIH1cblxuICBtYXliZVByb2Nlc3NEZWNvcmF0b3Iobm9kZTogdHMuRGVjb3JhdG9yLCBzdGFydD86IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIC8vIE9ubHkgc3RyaXAgZmllbGQgYW5kIGFyZ3VtZW50IGRlY29yYXRvcnMsIHRoZSBjbGFzcyBkZWNvcmF0aW9uXG4gICAgLy8gZG93bmxldmVsIHRyYW5zZm9ybWVyIHdpbGwgc3RyaXAgY2xhc3MgZGVjb3JhdGlvbnNcbiAgICBpZiAoc2hvdWxkTG93ZXIobm9kZSwgdGhpcy50eXBlQ2hlY2tlcikgJiYgIXRoaXMuaXNDbGFzc0RlY29yYXRvcihub2RlKSkge1xuICAgICAgLy8gUmV0dXJuIHRydWUgdG8gc2lnbmFsIHRoYXQgdGhpcyBub2RlIHNob3VsZCBub3QgYmUgZW1pdHRlZCxcbiAgICAgIC8vIGJ1dCBzdGlsbCBlbWl0IHRoZSB3aGl0ZXNwYWNlICpiZWZvcmUqIHRoZSBub2RlLlxuICAgICAgaWYgKCFzdGFydCkge1xuICAgICAgICBzdGFydCA9IG5vZGUuZ2V0RnVsbFN0YXJ0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLnJld3JpdGVyLndyaXRlUmFuZ2Uobm9kZSwgc3RhcnQsIG5vZGUuZ2V0U3RhcnQoKSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm91bmREZWNvcmF0b3JzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhISh0aGlzLmRlY29yYXRvcnMgfHwgdGhpcy5jdG9yUGFyYW1ldGVycyB8fCB0aGlzLnByb3BEZWNvcmF0b3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBlbWl0cyB0aGUgdHlwZXMgZm9yIHRoZSB2YXJpb3VzIGdhdGhlcmVkIG1ldGFkYXRhIHRvIGJlIHVzZWRcbiAgICogaW4gdGhlIHRzaWNrbGUgdHlwZSBhbm5vdGF0aW9ucyBoZWxwZXIuXG4gICAqL1xuICBlbWl0TWV0YWRhdGFUeXBlQW5ub3RhdGlvbnNIZWxwZXJzKCkge1xuICAgIGlmICghdGhpcy5jbGFzc0RlY2wubmFtZSkgcmV0dXJuO1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGdldElkZW50aWZpZXJUZXh0KHRoaXMuY2xhc3NEZWNsLm5hbWUpO1xuICAgIGlmICh0aGlzLmRlY29yYXRvcnMpIHtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChgLyoqIEB0eXBlIHshQXJyYXk8e3R5cGU6ICFGdW5jdGlvbiwgYXJnczogKHVuZGVmaW5lZHwhQXJyYXk8Pz4pfT59ICovXFxuYCk7XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYCR7Y2xhc3NOYW1lfS5kZWNvcmF0b3JzO1xcbmApO1xuICAgIH1cbiAgICBpZiAodGhpcy5kZWNvcmF0b3JzIHx8IHRoaXMuY3RvclBhcmFtZXRlcnMpIHtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChgLyoqXFxuYCk7XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYCAqIEBub2NvbGxhcHNlXFxuYCk7XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoXG4gICAgICAgICAgYCAqIEB0eXBlIHtmdW5jdGlvbigpOiAhQXJyYXk8KG51bGx8e3R5cGU6ID8sIGRlY29yYXRvcnM6ICh1bmRlZmluZWR8IUFycmF5PHt0eXBlOiAhRnVuY3Rpb24sIGFyZ3M6ICh1bmRlZmluZWR8IUFycmF5PD8+KX0+KX0pPn1cXG5gKTtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChgICovXFxuYCk7XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYCR7Y2xhc3NOYW1lfS5jdG9yUGFyYW1ldGVycztcXG5gKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcERlY29yYXRvcnMpIHtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChcbiAgICAgICAgICBgLyoqIEB0eXBlIHshT2JqZWN0PHN0cmluZywhQXJyYXk8e3R5cGU6ICFGdW5jdGlvbiwgYXJnczogKHVuZGVmaW5lZHwhQXJyYXk8Pz4pfT4+fSAqL1xcbmApO1xuICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGAke2NsYXNzTmFtZX0ucHJvcERlY29yYXRvcnM7XFxuYCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGVtaXRNZXRhZGF0YSBlbWl0cyB0aGUgdmFyaW91cyBnYXRoZXJlZCBtZXRhZGF0YSwgYXMgc3RhdGljIGZpZWxkcy5cbiAgICovXG4gIGVtaXRNZXRhZGF0YUFzU3RhdGljUHJvcGVydGllcygpIHtcbiAgICBjb25zdCBkZWNvcmF0b3JJbnZvY2F0aW9ucyA9ICd7dHlwZTogRnVuY3Rpb24sIGFyZ3M/OiBhbnlbXX1bXSc7XG4gICAgaWYgKHRoaXMuZGVjb3JhdG9ycyB8fCB0aGlzLmN0b3JQYXJhbWV0ZXJzKSB7XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYC8qKiBAbm9jb2xsYXBzZSAqL1xcbmApO1xuICAgICAgLy8gY3RvclBhcmFtZXRlcnMgbWF5IGNvbnRhaW4gZm9yd2FyZCByZWZlcmVuY2VzIGluIHRoZSB0eXBlOiBmaWVsZCwgc28gd3JhcCBpbiBhIGZ1bmN0aW9uXG4gICAgICAvLyBjbG9zdXJlXG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoXG4gICAgICAgICAgYHN0YXRpYyBjdG9yUGFyYW1ldGVyczogKCkgPT4gKHt0eXBlOiBhbnksIGRlY29yYXRvcnM/OiBgICsgZGVjb3JhdG9ySW52b2NhdGlvbnMgK1xuICAgICAgICAgIGB9fG51bGwpW10gPSAoKSA9PiBbXFxuYCk7XG4gICAgICBmb3IgKGNvbnN0IHBhcmFtIG9mIHRoaXMuY3RvclBhcmFtZXRlcnMgfHwgW10pIHtcbiAgICAgICAgaWYgKCFwYXJhbS50eXBlICYmICFwYXJhbS5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KCdudWxsLFxcbicpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChge3R5cGU6IGApO1xuICAgICAgICBpZiAoIXBhcmFtLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYHVuZGVmaW5lZGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZvciB0cmFuc2Zvcm1lciBtb2RlLCB0c2lja2xlIG11c3QgZW1pdCBub3Qgb25seSB0aGUgc3RyaW5nIHJlZmVycmluZyB0byB0aGUgdHlwZSxcbiAgICAgICAgICAvLyBidXQgYWxzbyBjcmVhdGUgYSBzb3VyY2UgbWFwcGluZywgc28gdGhhdCBUeXBlU2NyaXB0IGNhbiBsYXRlciByZWNvZ25pemUgdGhhdCB0aGVcbiAgICAgICAgICAvLyBzeW1ib2wgaXMgdXNlZCBpbiBhIHZhbHVlIHBvc2l0aW9uLCBzbyB0aGF0IFR5cGVTY3JpcHQgZW1pdHMgYW4gaW1wb3J0IGZvciB0aGVcbiAgICAgICAgICAvLyBzeW1ib2wuXG4gICAgICAgICAgLy8gVGhlIGNvZGUgYmVsb3cgYW5kIGluIGdldFZhbHVlSWRlbnRpZmllckZvclR5cGUgZmluZHMgdGhlIHZhbHVlIG5vZGUgY29ycmVzcG9uZGluZyB0b1xuICAgICAgICAgIC8vIHRoZSB0eXBlIGFuZCBlbWl0cyB0aGF0IHN5bWJvbCBpZiBwb3NzaWJsZS4gVGhpcyBjYXVzZXMgYSBzb3VyY2UgbWFwcGluZyB0byB0aGUgdmFsdWUsXG4gICAgICAgICAgLy8gd2hpY2ggdGhlbiBhbGxvd3MgbGF0ZXIgdHJhbnNmb3JtZXJzIGluIHRoZSBwaXBlbGluZSB0byBkbyB0aGUgY29ycmVjdCBtb2R1bGVcbiAgICAgICAgICAvLyByZXdyaXRpbmcuIE5vdGUgdGhhdCB3ZSBjYW5ub3QgdXNlIHBhcmFtLnR5cGUgYXMgdGhlIGVtaXQgbm9kZSBkaXJlY3RseSAobm90IGV2ZW4ganVzdFxuICAgICAgICAgIC8vIGZvciBtYXBwaW5nKSwgYmVjYXVzZSB0aGF0IGlzIG1hcmtlZCBhcyBhIHR5cGUgdXNlIG9mIHRoZSBub2RlLCBub3QgYSB2YWx1ZSB1c2UsIHNvIGl0XG4gICAgICAgICAgLy8gZG9lc24ndCBnZXQgdXBkYXRlZCBhcyBhbiBleHBvcnQuXG4gICAgICAgICAgY29uc3Qgc3ltID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihwYXJhbS50eXBlKS5nZXRTeW1ib2woKSE7XG4gICAgICAgICAgY29uc3QgZW1pdE5vZGUgPSB0aGlzLmdldFZhbHVlSWRlbnRpZmllckZvclR5cGUoc3ltLCBwYXJhbS50eXBlKTtcbiAgICAgICAgICBpZiAoZW1pdE5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIud3JpdGVSYW5nZShlbWl0Tm9kZSwgZW1pdE5vZGUuZ2V0U3RhcnQoKSwgZW1pdE5vZGUuZ2V0RW5kKCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlU3RyID0gbmV3IFR5cGVUcmFuc2xhdG9yKHRoaXMudHlwZUNoZWNrZXIsIHBhcmFtLnR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zeW1ib2xUb1N0cmluZyhzeW0sIC8qIHVzZUZxbiAqLyB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCh0eXBlU3RyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGAsIGApO1xuICAgICAgICBpZiAocGFyYW0uZGVjb3JhdG9ycykge1xuICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnZGVjb3JhdG9yczogWycpO1xuICAgICAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIHBhcmFtLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdERlY29yYXRvcihkZWNvcmF0b3IpO1xuICAgICAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KCcsICcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ10nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ30sXFxuJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYF07XFxuYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcERlY29yYXRvcnMpIHtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChcbiAgICAgICAgICBgc3RhdGljIHByb3BEZWNvcmF0b3JzOiB7W2tleTogc3RyaW5nXTogYCArIGRlY29yYXRvckludm9jYXRpb25zICsgYH0gPSB7XFxuYCk7XG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5wcm9wRGVjb3JhdG9ycy5rZXlzKCkpIHtcbiAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGBcIiR7bmFtZX1cIjogW2ApO1xuXG4gICAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIHRoaXMucHJvcERlY29yYXRvcnMuZ2V0KG5hbWUpISkge1xuICAgICAgICAgIHRoaXMuZW1pdERlY29yYXRvcihkZWNvcmF0b3IpO1xuICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnLCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnXSxcXG4nKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnfTtcXG4nKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGVtaXREZWNvcmF0b3IoZGVjb3JhdG9yOiB0cy5EZWNvcmF0b3IpIHtcbiAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ3sgdHlwZTogJyk7XG4gICAgY29uc3QgZXhwciA9IGRlY29yYXRvci5leHByZXNzaW9uO1xuICAgIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgLy8gVGhlIGRlY29yYXRvciB3YXMgYSBwbGFpbiBARm9vLlxuICAgICAgICB0aGlzLnJld3JpdGVyLnZpc2l0KGV4cHIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgLy8gVGhlIGRlY29yYXRvciB3YXMgYSBjYWxsLCBsaWtlIEBGb28oYmFyKS5cbiAgICAgICAgY29uc3QgY2FsbCA9IGV4cHIgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgICAgIHRoaXMucmV3cml0ZXIudmlzaXQoY2FsbC5leHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnLCBhcmdzOiBbJyk7XG4gICAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgY2FsbC5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIud3JpdGVOb2RlRnJvbShhcmcsIGFyZy5nZXRTdGFydCgpKTtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnLCAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KCddJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLnJld3JpdGVyLmVycm9yVW5pbXBsZW1lbnRlZEtpbmQoZXhwciwgJ2dhdGhlcmluZyBtZXRhZGF0YScpO1xuICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ3VuZGVmaW5lZCcpO1xuICAgIH1cbiAgICB0aGlzLnJld3JpdGVyLmVtaXQoJyB9Jyk7XG4gIH1cbn1cblxuY2xhc3MgRGVjb3JhdG9yUmV3cml0ZXIgZXh0ZW5kcyBSZXdyaXRlciB7XG4gIHByaXZhdGUgY3VycmVudERlY29yYXRvckNvbnZlcnRlcjogRGVjb3JhdG9yQ2xhc3NWaXNpdG9yO1xuICBwcml2YXRlIGltcG9ydGVkTmFtZXM6IEFycmF5PHtuYW1lOiB0cy5JZGVudGlmaWVyLCBkZWNsYXJhdGlvbk5hbWVzOiB0cy5JZGVudGlmaWVyW119PiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHNvdXJjZU1hcHBlcjogU291cmNlTWFwcGVyKSB7XG4gICAgc3VwZXIoc291cmNlRmlsZSwgc291cmNlTWFwcGVyKTtcbiAgfVxuXG4gIHByb2Nlc3MoKToge291dHB1dDogc3RyaW5nLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gICAgdGhpcy52aXNpdCh0aGlzLmZpbGUpO1xuICAgIHJldHVybiB0aGlzLmdldE91dHB1dCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG1heWJlUHJvY2Vzcyhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuY3VycmVudERlY29yYXRvckNvbnZlcnRlcikge1xuICAgICAgdGhpcy5jdXJyZW50RGVjb3JhdG9yQ29udmVydGVyLmJlZm9yZVByb2Nlc3NOb2RlKG5vZGUpO1xuICAgIH1cbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uOlxuICAgICAgICB0aGlzLmltcG9ydGVkTmFtZXMucHVzaChcbiAgICAgICAgICAgIC4uLmNvbGxlY3RJbXBvcnRlZE5hbWVzKHRoaXMudHlwZUNoZWNrZXIsIG5vZGUgYXMgdHMuSW1wb3J0RGVjbGFyYXRpb24pKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRlY29yYXRvcjpcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudERlY29yYXRvckNvbnZlcnRlciAmJlxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGVjb3JhdG9yQ29udmVydGVyLm1heWJlUHJvY2Vzc0RlY29yYXRvcihub2RlIGFzIHRzLkRlY29yYXRvcik7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgY29uc3Qgb2xkRGVjb3JhdG9yQ29udmVydGVyID0gdGhpcy5jdXJyZW50RGVjb3JhdG9yQ29udmVydGVyO1xuICAgICAgICB0aGlzLmN1cnJlbnREZWNvcmF0b3JDb252ZXJ0ZXIgPSBuZXcgRGVjb3JhdG9yQ2xhc3NWaXNpdG9yKFxuICAgICAgICAgICAgdGhpcy50eXBlQ2hlY2tlciwgdGhpcywgbm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uLCB0aGlzLmltcG9ydGVkTmFtZXMpO1xuICAgICAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgICAgICAgdmlzaXRDbGFzc0NvbnRlbnRJbmNsdWRpbmdEZWNvcmF0b3JzKFxuICAgICAgICAgICAgbm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uLCB0aGlzLCB0aGlzLmN1cnJlbnREZWNvcmF0b3JDb252ZXJ0ZXIpO1xuICAgICAgICB0aGlzLmN1cnJlbnREZWNvcmF0b3JDb252ZXJ0ZXIgPSBvbGREZWNvcmF0b3JDb252ZXJ0ZXI7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IGlkZW50aWZpZXIgaW4gdGhlIG5vZGUgdHJlZSBzdGFydGluZyBhdCBub2RlXG4gKiBpbiBhIGRlcHRoIGZpcnN0IG9yZGVyLlxuICpcbiAqIEBwYXJhbSBub2RlIFRoZSBub2RlIHRvIHN0YXJ0IHdpdGhcbiAqIEByZXR1cm4gVGhlIGZpcnN0IGlkZW50aWZpZXIgaWYgb25lIHdhcyBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gZmlyc3RJZGVudGlmaWVySW5TdWJ0cmVlKG5vZGU6IHRzLk5vZGUpOiB0cy5JZGVudGlmaWVyfHVuZGVmaW5lZCB7XG4gIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgIHJldHVybiBub2RlIGFzIHRzLklkZW50aWZpZXI7XG4gIH1cbiAgcmV0dXJuIHRzLmZvckVhY2hDaGlsZChub2RlLCBmaXJzdElkZW50aWZpZXJJblN1YnRyZWUpO1xufVxuXG4vKipcbiAqIENvbGxlY3QgdGhlIElkZW50aWZpZXJzIHVzZWQgYXMgbmFtZWQgYmluZGluZ3MgaW4gdGhlIGdpdmVuIGltcG9ydCBkZWNsYXJhdGlvblxuICogd2l0aCB0aGVpciBTeW1ib2wuXG4gKiBUaGlzIGlzIG5lZWRlZCBsYXRlciBvbiB0byBmaW5kIGFuIGlkZW50aWZpZXIgdGhhdCByZXByZXNlbnRzIHRoZSB2YWx1ZVxuICogb2YgYW4gaW1wb3J0ZWQgdHlwZSBpZGVudGlmaWVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdEltcG9ydGVkTmFtZXModHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBkZWNsOiB0cy5JbXBvcnREZWNsYXJhdGlvbik6XG4gICAgQXJyYXk8e25hbWU6IHRzLklkZW50aWZpZXIsIGRlY2xhcmF0aW9uTmFtZXM6IHRzLklkZW50aWZpZXJbXX0+IHtcbiAgY29uc3QgaW1wb3J0ZWROYW1lczogQXJyYXk8e25hbWU6IHRzLklkZW50aWZpZXIsIGRlY2xhcmF0aW9uTmFtZXM6IHRzLklkZW50aWZpZXJbXX0+ID0gW107XG4gIGNvbnN0IGltcG9ydENsYXVzZSA9IGRlY2wuaW1wb3J0Q2xhdXNlO1xuICBpZiAoIWltcG9ydENsYXVzZSkge1xuICAgIHJldHVybiBpbXBvcnRlZE5hbWVzO1xuICB9XG4gIGNvbnN0IG5hbWVzOiB0cy5JZGVudGlmaWVyW10gPSBbXTtcbiAgaWYgKGltcG9ydENsYXVzZS5uYW1lKSB7XG4gICAgbmFtZXMucHVzaChpbXBvcnRDbGF1c2UubmFtZSk7XG4gIH1cbiAgaWYgKGltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzICYmXG4gICAgICBpbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncy5raW5kID09PSB0cy5TeW50YXhLaW5kLk5hbWVkSW1wb3J0cykge1xuICAgIGNvbnN0IG5hbWVkSW1wb3J0cyA9IGltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzIGFzIHRzLk5hbWVkSW1wb3J0cztcbiAgICBuYW1lcy5wdXNoKC4uLm5hbWVkSW1wb3J0cy5lbGVtZW50cy5tYXAoZSA9PiBlLm5hbWUpKTtcbiAgfVxuICBmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcbiAgICBsZXQgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihuYW1lKSE7XG4gICAgaWYgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bWJvbCk7XG4gICAgfVxuICAgIGNvbnN0IGRlY2xhcmF0aW9uTmFtZXM6IHRzLklkZW50aWZpZXJbXSA9IFtdO1xuICAgIGlmIChzeW1ib2wuZGVjbGFyYXRpb25zKSB7XG4gICAgICBmb3IgKGNvbnN0IGQgb2Ygc3ltYm9sLmRlY2xhcmF0aW9ucykge1xuICAgICAgICBjb25zdCBkZWNsID0gZCBhcyB0cy5OYW1lZERlY2xhcmF0aW9uO1xuICAgICAgICBpZiAoZGVjbC5uYW1lICYmIGRlY2wubmFtZS5raW5kID09PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICBkZWNsYXJhdGlvbk5hbWVzLnB1c2goZGVjbC5uYW1lIGFzIHRzLklkZW50aWZpZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzeW1ib2wuZGVjbGFyYXRpb25zKSB7XG4gICAgICBpbXBvcnRlZE5hbWVzLnB1c2goe25hbWUsIGRlY2xhcmF0aW9uTmFtZXN9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGltcG9ydGVkTmFtZXM7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0Q2xhc3NDb250ZW50SW5jbHVkaW5nRGVjb3JhdG9ycyhcbiAgICBjbGFzc0RlY2w6IHRzLkNsYXNzRGVjbGFyYXRpb24sIHJld3JpdGVyOiBSZXdyaXRlciwgZGVjb3JhdG9yVmlzaXRvcj86IERlY29yYXRvckNsYXNzVmlzaXRvcikge1xuICBpZiAocmV3cml0ZXIuZmlsZS50ZXh0W2NsYXNzRGVjbC5nZXRFbmQoKSAtIDFdICE9PSAnfScpIHtcbiAgICByZXdyaXRlci5lcnJvcihjbGFzc0RlY2wsICd1bmV4cGVjdGVkIGNsYXNzIHRlcm1pbmF0b3InKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV3cml0ZXIud3JpdGVOb2RlRnJvbShjbGFzc0RlY2wsIGNsYXNzRGVjbC5nZXRTdGFydCgpLCBjbGFzc0RlY2wuZ2V0RW5kKCkgLSAxKTtcbiAgLy8gQXQgdGhpcyBwb2ludCwgd2UndmUgZW1pdHRlZCB1cCB0aHJvdWdoIHRoZSBmaW5hbCBjaGlsZCBvZiB0aGUgY2xhc3MsIHNvIGFsbCB0aGF0XG4gIC8vIHJlbWFpbnMgaXMgdGhlIHRyYWlsaW5nIHdoaXRlc3BhY2UgYW5kIGNsb3NpbmcgY3VybHkgYnJhY2UuXG4gIC8vIFRoZSBmaW5hbCBjaGFyYWN0ZXIgb3duZWQgYnkgdGhlIGNsYXNzIG5vZGUgc2hvdWxkIGFsd2F5cyBiZSBhICd9JyxcbiAgLy8gb3Igd2Ugc29tZWhvdyBnb3QgdGhlIEFTVCB3cm9uZyBhbmQgc2hvdWxkIHJlcG9ydCBhbiBlcnJvci5cbiAgLy8gKEFueSB3aGl0ZXNwYWNlIG9yIHNlbWljb2xvbiBmb2xsb3dpbmcgdGhlICd9JyB3aWxsIGJlIHBhcnQgb2YgdGhlIG5leHQgTm9kZS4pXG4gIGlmIChkZWNvcmF0b3JWaXNpdG9yKSB7XG4gICAgZGVjb3JhdG9yVmlzaXRvci5lbWl0TWV0YWRhdGFBc1N0YXRpY1Byb3BlcnRpZXMoKTtcbiAgfVxuICByZXdyaXRlci53cml0ZVJhbmdlKGNsYXNzRGVjbCwgY2xhc3NEZWNsLmdldEVuZCgpIC0gMSwgY2xhc3NEZWNsLmdldEVuZCgpKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydERlY29yYXRvcnMoXG4gICAgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLFxuICAgIHNvdXJjZU1hcHBlcjogU291cmNlTWFwcGVyKToge291dHB1dDogc3RyaW5nLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gIHJldHVybiBuZXcgRGVjb3JhdG9yUmV3cml0ZXIodHlwZUNoZWNrZXIsIHNvdXJjZUZpbGUsIHNvdXJjZU1hcHBlcikucHJvY2VzcygpO1xufVxuIl19