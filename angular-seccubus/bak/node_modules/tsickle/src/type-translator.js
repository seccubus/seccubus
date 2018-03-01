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
        define("tsickle/src/type-translator", ["require", "exports", "path", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var ts = require("typescript");
    /**
     * Determines if fileName refers to a builtin lib.d.ts file.
     * This is a terrible hack but it mirrors a similar thing done in Clutz.
     */
    function isBuiltinLibDTS(fileName) {
        return fileName.match(/\blib\.(?:[^/]+\.)?d\.ts$/) != null;
    }
    exports.isBuiltinLibDTS = isBuiltinLibDTS;
    /**
     * @return True if the named type is considered compatible with the Closure-defined
     *     type of the same name, e.g. "Array".  Note that we don't actually enforce
     *     that the types are actually compatible, but mostly just hope that they are due
     *     to being derived from the same HTML specs.
     */
    function isClosureProvidedType(symbol) {
        return symbol.declarations != null &&
            symbol.declarations.some(function (n) { return isBuiltinLibDTS(n.getSourceFile().fileName); });
    }
    function typeToDebugString(type) {
        var debugString = "flags:0x" + type.flags.toString(16);
        if (type.aliasSymbol) {
            debugString += " alias:" + symbolToDebugString(type.aliasSymbol);
        }
        if (type.aliasTypeArguments) {
            debugString += " aliasArgs:<" + type.aliasTypeArguments.map(typeToDebugString).join(',') + ">";
        }
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var basicTypes = [
            ts.TypeFlags.Any, ts.TypeFlags.String, ts.TypeFlags.Number,
            ts.TypeFlags.Boolean, ts.TypeFlags.Enum, ts.TypeFlags.StringLiteral,
            ts.TypeFlags.NumberLiteral, ts.TypeFlags.BooleanLiteral, ts.TypeFlags.EnumLiteral,
            ts.TypeFlags.ESSymbol, ts.TypeFlags.Void, ts.TypeFlags.Undefined,
            ts.TypeFlags.Null, ts.TypeFlags.Never, ts.TypeFlags.TypeParameter,
            ts.TypeFlags.Object, ts.TypeFlags.Union, ts.TypeFlags.Intersection,
            ts.TypeFlags.Index, ts.TypeFlags.IndexedAccess, ts.TypeFlags.NonPrimitive,
        ];
        try {
            for (var basicTypes_1 = __values(basicTypes), basicTypes_1_1 = basicTypes_1.next(); !basicTypes_1_1.done; basicTypes_1_1 = basicTypes_1.next()) {
                var flag = basicTypes_1_1.value;
                if ((type.flags & flag) !== 0) {
                    debugString += " " + ts.TypeFlags[flag];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (basicTypes_1_1 && !basicTypes_1_1.done && (_a = basicTypes_1.return)) _a.call(basicTypes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (type.flags === ts.TypeFlags.Object) {
            var objType = type;
            // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
            var objectFlags = [
                ts.ObjectFlags.Class,
                ts.ObjectFlags.Interface,
                ts.ObjectFlags.Reference,
                ts.ObjectFlags.Tuple,
                ts.ObjectFlags.Anonymous,
                ts.ObjectFlags.Mapped,
                ts.ObjectFlags.Instantiated,
                ts.ObjectFlags.ObjectLiteral,
                ts.ObjectFlags.EvolvingArray,
                ts.ObjectFlags.ObjectLiteralPatternWithComputedProperties,
            ];
            try {
                for (var objectFlags_1 = __values(objectFlags), objectFlags_1_1 = objectFlags_1.next(); !objectFlags_1_1.done; objectFlags_1_1 = objectFlags_1.next()) {
                    var flag = objectFlags_1_1.value;
                    if ((objType.objectFlags & flag) !== 0) {
                        debugString += " object:" + ts.ObjectFlags[flag];
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (objectFlags_1_1 && !objectFlags_1_1.done && (_b = objectFlags_1.return)) _b.call(objectFlags_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        if (type.symbol && type.symbol.name !== '__type') {
            debugString += " symbol.name:" + JSON.stringify(type.symbol.name);
        }
        if (type.pattern) {
            debugString += " destructuring:true";
        }
        return "{type " + debugString + "}";
        var e_1, _a, e_2, _b;
    }
    exports.typeToDebugString = typeToDebugString;
    function symbolToDebugString(sym) {
        var debugString = JSON.stringify(sym.name) + " flags:0x" + sym.flags.toString(16);
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var symbolFlags = [
            ts.SymbolFlags.FunctionScopedVariable,
            ts.SymbolFlags.BlockScopedVariable,
            ts.SymbolFlags.Property,
            ts.SymbolFlags.EnumMember,
            ts.SymbolFlags.Function,
            ts.SymbolFlags.Class,
            ts.SymbolFlags.Interface,
            ts.SymbolFlags.ConstEnum,
            ts.SymbolFlags.RegularEnum,
            ts.SymbolFlags.ValueModule,
            ts.SymbolFlags.NamespaceModule,
            ts.SymbolFlags.TypeLiteral,
            ts.SymbolFlags.ObjectLiteral,
            ts.SymbolFlags.Method,
            ts.SymbolFlags.Constructor,
            ts.SymbolFlags.GetAccessor,
            ts.SymbolFlags.SetAccessor,
            ts.SymbolFlags.Signature,
            ts.SymbolFlags.TypeParameter,
            ts.SymbolFlags.TypeAlias,
            ts.SymbolFlags.ExportValue,
            ts.SymbolFlags.Alias,
            ts.SymbolFlags.Prototype,
            ts.SymbolFlags.ExportStar,
            ts.SymbolFlags.Optional,
            ts.SymbolFlags.Transient,
        ];
        try {
            for (var symbolFlags_1 = __values(symbolFlags), symbolFlags_1_1 = symbolFlags_1.next(); !symbolFlags_1_1.done; symbolFlags_1_1 = symbolFlags_1.next()) {
                var flag = symbolFlags_1_1.value;
                if ((sym.flags & flag) !== 0) {
                    debugString += " " + ts.SymbolFlags[flag];
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (symbolFlags_1_1 && !symbolFlags_1_1.done && (_a = symbolFlags_1.return)) _a.call(symbolFlags_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return debugString;
        var e_3, _a;
    }
    exports.symbolToDebugString = symbolToDebugString;
    /** TypeTranslator translates TypeScript types to Closure types. */
    var TypeTranslator = /** @class */ (function () {
        /**
         * @param node is the source AST ts.Node the type comes from.  This is used
         *     in some cases (e.g. anonymous types) for looking up field names.
         * @param pathBlackList is a set of paths that should never get typed;
         *     any reference to symbols defined in these paths should by typed
         *     as {?}.
         * @param symbolsToAliasedNames a mapping from symbols (`Foo`) to a name in scope they should be
         *     emitted as (e.g. `tsickle_forward_declare_1.Foo`). Can be augmented during type
         *     translation, e.g. to blacklist a symbol.
         */
        function TypeTranslator(typeChecker, node, pathBlackList, symbolsToAliasedNames, ensureSymbolDeclared) {
            if (symbolsToAliasedNames === void 0) { symbolsToAliasedNames = new Map(); }
            if (ensureSymbolDeclared === void 0) { ensureSymbolDeclared = function () { }; }
            this.typeChecker = typeChecker;
            this.node = node;
            this.pathBlackList = pathBlackList;
            this.symbolsToAliasedNames = symbolsToAliasedNames;
            this.ensureSymbolDeclared = ensureSymbolDeclared;
            /**
             * A list of type literals we've encountered while emitting; used to avoid getting stuck in
             * recursive types.
             */
            this.seenTypeLiterals = new Set();
            /**
             * Whether to write types suitable for an \@externs file. Externs types must not refer to
             * non-externs types (i.e. non ambient types) and need to use fully qualified names.
             */
            this.isForExterns = false;
            // Normalize paths to not break checks on Windows.
            if (this.pathBlackList != null) {
                this.pathBlackList =
                    new Set(Array.from(this.pathBlackList.values()).map(function (p) { return path.normalize(p); }));
            }
        }
        /**
         * Converts a ts.Symbol to a string.
         * Other approaches that don't work:
         * - TypeChecker.typeToString translates Array as T[].
         * - TypeChecker.symbolToString emits types without their namespace,
         *   and doesn't let you pass the flag to control that.
         * @param useFqn whether to scope the name using its fully qualified name. Closure's template
         *     arguments are always scoped to the class containing them, where TypeScript's template args
         *     would be fully qualified. I.e. this flag is false for generic types.
         */
        TypeTranslator.prototype.symbolToString = function (sym, useFqn) {
            if (useFqn && this.isForExterns) {
                // For regular type emit, we can use TypeScript's naming rules, as they match Closure's name
                // scoping rules. However when emitting externs files for ambients, naming rules change. As
                // Closure doesn't support externs modules, all names must be global and use global fully
                // qualified names. The code below uses TypeScript to convert a symbol to a full qualified
                // name and then emits that.
                var fqn = this.typeChecker.getFullyQualifiedName(sym);
                if (fqn.startsWith("\"") || fqn.startsWith("'")) {
                    // Quoted FQNs mean the name is from a module, e.g. `'path/to/module'.some.qualified.Name`.
                    // tsickle generally re-scopes names in modules that are moved to externs into the global
                    // namespace. That does not quite match TS' semantics where ambient types from modules are
                    // local. However value declarations that are local to modules but not defined do not make
                    // sense if not global, e.g. "declare class X {}; new X();" cannot work unless `X` is
                    // actually a global.
                    // So this code strips the module path from the type and uses the FQN as a global.
                    fqn = fqn.replace(/^["'][^"']+['"]\./, '');
                }
                // Declarations in module can re-open global types using "declare global { ... }". The fqn
                // then contains the prefix "global." here. As we're mapping to global types, just strip the
                // prefix.
                var isInGlobal = (sym.declarations || []).some(function (d) {
                    var current = d;
                    while (current) {
                        if (current.flags & ts.NodeFlags.GlobalAugmentation)
                            return true;
                        current = current.parent;
                    }
                    return false;
                });
                if (isInGlobal) {
                    fqn = fqn.replace(/^global\./, '');
                }
                return this.stripClutzNamespace(fqn);
            }
            // TypeScript resolves e.g. union types to their members, which can include symbols not declared
            // in the current scope. Ensure that all symbols found this way are actually declared.
            // This must happen before the alias check below, it might introduce a new alias for the symbol.
            if ((sym.flags & ts.SymbolFlags.TypeParameter) === 0)
                this.ensureSymbolDeclared(sym);
            var symAlias = sym;
            if (symAlias.flags & ts.SymbolFlags.Alias) {
                symAlias = this.typeChecker.getAliasedSymbol(symAlias);
            }
            var alias = this.symbolsToAliasedNames.get(symAlias);
            if (alias)
                return alias;
            // This follows getSingleLineStringWriter in the TypeScript compiler.
            var str = '';
            var writeText = function (text) { return str += text; };
            var doNothing = function () {
                return;
            };
            var builder = this.typeChecker.getSymbolDisplayBuilder();
            var writer = {
                writeKeyword: writeText,
                writeOperator: writeText,
                writePunctuation: writeText,
                writeSpace: writeText,
                writeStringLiteral: writeText,
                writeParameter: writeText,
                writeProperty: writeText,
                writeSymbol: writeText,
                writeLine: doNothing,
                increaseIndent: doNothing,
                decreaseIndent: doNothing,
                clear: doNothing,
                trackSymbol: function (symbol, enclosingDeclaration, meaning) {
                    return;
                },
                reportInaccessibleThisError: doNothing,
                reportPrivateInBaseOfClassExpression: doNothing,
            };
            builder.buildSymbolDisplay(sym, writer, this.node);
            return this.stripClutzNamespace(str);
        };
        // Clutz (https://github.com/angular/clutz) emits global type symbols hidden in a special
        // ಠ_ಠ.clutz namespace. While most code seen by Tsickle will only ever see local aliases, Clutz
        // symbols can be written by users directly in code, and they can appear by dereferencing
        // TypeAliases. The code below simply strips the prefix, the remaining type name then matches
        // Closure's type.
        TypeTranslator.prototype.stripClutzNamespace = function (name) {
            if (name.startsWith('ಠ_ಠ.clutz.'))
                return name.substring('ಠ_ಠ.clutz.'.length);
            return name;
        };
        TypeTranslator.prototype.translate = function (type, resolveAlias) {
            // NOTE: Though type.flags has the name "flags", it usually can only be one
            // of the enum options at a time (except for unions of literal types, e.g. unions of boolean
            // values, string values, enum values). This switch handles all the cases in the ts.TypeFlags
            // enum in the order they occur.
            if (resolveAlias === void 0) { resolveAlias = false; }
            // NOTE: Some TypeFlags are marked "internal" in the d.ts but still show up in the value of
            // type.flags. This mask limits the flag checks to the ones in the public API. "lastFlag" here
            // is the last flag handled in this switch statement, and should be kept in sync with
            // typescript.d.ts.
            // NonPrimitive occurs on its own on the lower case "object" type. Special case to "!Object".
            if (type.flags === ts.TypeFlags.NonPrimitive)
                return '!Object';
            // Avoid infinite loops on recursive type literals.
            // It would be nice to just emit the name of the recursive type here (in type.aliasSymbol
            // below), but Closure Compiler does not allow recursive type definitions.
            if (this.seenTypeLiterals.has(type))
                return '?';
            // If type is an alias, e.g. from type X = A|B, then always emit the alias, not the underlying
            // union type, as the alias is the user visible, imported symbol.
            if (!resolveAlias && type.aliasSymbol) {
                return this.symbolToString(type.aliasSymbol, /* useFqn */ true);
            }
            var isAmbient = false;
            var isNamespace = false;
            var isModule = false;
            if (type.symbol) {
                try {
                    for (var _a = __values(type.symbol.declarations || []), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var decl = _b.value;
                        if (ts.isExternalModule(decl.getSourceFile()))
                            isModule = true;
                        var current = decl;
                        while (current) {
                            if (ts.getCombinedModifierFlags(current) & ts.ModifierFlags.Ambient)
                                isAmbient = true;
                            if (current.kind === ts.SyntaxKind.ModuleDeclaration)
                                isNamespace = true;
                            current = current.parent;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            // tsickle cannot generate types for non-ambient namespaces.
            if (isNamespace && !isAmbient)
                return '?';
            // Types in externs cannot reference types from external modules.
            // However ambient types in modules get moved to externs, too, so type references work and we
            // can emit a precise type.
            if (this.isForExterns && isModule && !isAmbient)
                return '?';
            var lastFlag = ts.TypeFlags.IndexedAccess;
            var mask = (lastFlag << 1) - 1;
            switch (type.flags & mask) {
                case ts.TypeFlags.Any:
                    return '?';
                case ts.TypeFlags.String:
                case ts.TypeFlags.StringLiteral:
                    return 'string';
                case ts.TypeFlags.Number:
                case ts.TypeFlags.NumberLiteral:
                    return 'number';
                case ts.TypeFlags.Boolean:
                case ts.TypeFlags.BooleanLiteral:
                    // See the note in translateUnion about booleans.
                    return 'boolean';
                case ts.TypeFlags.Enum:
                    if (!type.symbol) {
                        this.warn("EnumType without a symbol");
                        return '?';
                    }
                    return this.symbolToString(type.symbol, true);
                case ts.TypeFlags.ESSymbol:
                    // NOTE: currently this is just a typedef for {?}, shrug.
                    // https://github.com/google/closure-compiler/blob/55cf43ee31e80d89d7087af65b5542aa63987874/externs/es3.js#L34
                    return 'symbol';
                case ts.TypeFlags.Void:
                    return 'void';
                case ts.TypeFlags.Undefined:
                    return 'undefined';
                case ts.TypeFlags.Null:
                    return 'null';
                case ts.TypeFlags.Never:
                    this.warn("should not emit a 'never' type");
                    return '?';
                case ts.TypeFlags.TypeParameter:
                    // This is e.g. the T in a type like Foo<T>.
                    if (!type.symbol) {
                        this.warn("TypeParameter without a symbol"); // should not happen (tm)
                        return '?';
                    }
                    // In Closure Compiler, type parameters *are* scoped to their containing class.
                    var useFqn = false;
                    return this.symbolToString(type.symbol, useFqn);
                case ts.TypeFlags.Object:
                    return this.translateObject(type);
                case ts.TypeFlags.Union:
                    return this.translateUnion(type);
                case ts.TypeFlags.Intersection:
                case ts.TypeFlags.Index:
                case ts.TypeFlags.IndexedAccess:
                    // TODO(ts2.1): handle these special types.
                    this.warn("unhandled type flags: " + ts.TypeFlags[type.flags]);
                    return '?';
                default:
                    // Handle cases where multiple flags are set.
                    // Types with literal members are represented as
                    //   ts.TypeFlags.Union | [literal member]
                    // E.g. an enum typed value is a union type with the enum's members as its members. A
                    // boolean type is a union type with 'true' and 'false' as its members.
                    // Note also that in a more complex union, e.g. boolean|number, then it's a union of three
                    // things (true|false|number) and ts.TypeFlags.Boolean doesn't show up at all.
                    if (type.flags & ts.TypeFlags.Union) {
                        return this.translateUnion(type);
                    }
                    if (type.flags & ts.TypeFlags.EnumLiteral) {
                        return this.translateEnumLiteral(type);
                    }
                    // The switch statement should have been exhaustive.
                    throw new Error("unknown type flags " + type.flags + " on " + typeToDebugString(type));
            }
            var e_4, _c;
        };
        TypeTranslator.prototype.translateUnion = function (type) {
            var _this = this;
            var parts = type.types.map(function (t) { return _this.translate(t); });
            // Union types that include literals (e.g. boolean, enum) can end up repeating the same Closure
            // type. For example: true | boolean will be translated to boolean | boolean.
            // Remove duplicates to produce types that read better.
            parts = parts.filter(function (el, idx) { return parts.indexOf(el) === idx; });
            return parts.length === 1 ? parts[0] : "(" + parts.join('|') + ")";
        };
        TypeTranslator.prototype.translateEnumLiteral = function (type) {
            // Suppose you had:
            //   enum EnumType { MEMBER }
            // then the type of "EnumType.MEMBER" is an enum literal (the thing passed to this function)
            // and it has type flags that include
            //   ts.TypeFlags.NumberLiteral | ts.TypeFlags.EnumLiteral
            //
            // Closure Compiler doesn't support literals in types, so this code must not emit
            // "EnumType.MEMBER", but rather "EnumType".
            var enumLiteralBaseType = this.typeChecker.getBaseTypeOfLiteralType(type);
            if (!enumLiteralBaseType.symbol) {
                this.warn("EnumLiteralType without a symbol");
                return '?';
            }
            return this.symbolToString(enumLiteralBaseType.symbol, true);
        };
        // translateObject translates a ts.ObjectType, which is the type of all
        // object-like things in TS, such as classes and interfaces.
        TypeTranslator.prototype.translateObject = function (type) {
            var _this = this;
            if (type.symbol && this.isBlackListed(type.symbol))
                return '?';
            // NOTE: objectFlags is an enum, but a given type can have multiple flags.
            // Array<string> is both ts.ObjectFlags.Reference and ts.ObjectFlags.Interface.
            if (type.objectFlags & ts.ObjectFlags.Class) {
                if (!type.symbol) {
                    this.warn('class has no symbol');
                    return '?';
                }
                return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
            }
            else if (type.objectFlags & ts.ObjectFlags.Interface) {
                // Note: ts.InterfaceType has a typeParameters field, but that
                // specifies the parameters that the interface type *expects*
                // when it's used, and should not be transformed to the output.
                // E.g. a type like Array<number> is a TypeReference to the
                // InterfaceType "Array", but the "number" type parameter is
                // part of the outer TypeReference, not a typeParameter on
                // the InterfaceType.
                if (!type.symbol) {
                    this.warn('interface has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.Value) {
                    // The symbol is both a type and a value.
                    // For user-defined types in this state, we don't have a Closure name
                    // for the type.  See the type_and_value test.
                    if (!isClosureProvidedType(type.symbol)) {
                        this.warn("type/symbol conflict for " + type.symbol.name + ", using {?} for now");
                        return '?';
                    }
                }
                return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
            }
            else if (type.objectFlags & ts.ObjectFlags.Reference) {
                // A reference to another type, e.g. Array<number> refers to Array.
                // Emit the referenced type and any type arguments.
                var referenceType = type;
                // A tuple is a ReferenceType where the target is flagged Tuple and the
                // typeArguments are the tuple arguments.  Just treat it as a mystery
                // array, because Closure doesn't understand tuples.
                if (referenceType.target.objectFlags & ts.ObjectFlags.Tuple) {
                    return '!Array<?>';
                }
                var typeStr = '';
                if (referenceType.target === referenceType) {
                    // We get into an infinite loop here if the inner reference is
                    // the same as the outer; this can occur when this function
                    // fails to translate a more specific type before getting to
                    // this point.
                    throw new Error("reference loop in " + typeToDebugString(referenceType) + " " + referenceType.flags);
                }
                typeStr += this.translate(referenceType.target);
                // Translate can return '?' for a number of situations, e.g. type/value conflicts.
                // `?<?>` is illegal syntax in Closure Compiler, so just return `?` here.
                if (typeStr === '?')
                    return '?';
                if (referenceType.typeArguments) {
                    var params = referenceType.typeArguments.map(function (t) { return _this.translate(t); });
                    typeStr += "<" + params.join(', ') + ">";
                }
                return typeStr;
            }
            else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
                if (!type.symbol) {
                    // This comes up when generating code for an arrow function as passed
                    // to a generic function.  The passed-in type is tagged as anonymous
                    // and has no properties so it's hard to figure out what to generate.
                    // Just avoid it for now so we don't crash.
                    this.warn('anonymous type has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.TypeLiteral) {
                    return this.translateTypeLiteral(type);
                }
                else if (type.symbol.flags & ts.SymbolFlags.Function ||
                    type.symbol.flags & ts.SymbolFlags.Method) {
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                }
                this.warn('unhandled anonymous type');
                return '?';
            }
            /*
            TODO(ts2.1): more unhandled object type flags:
              Tuple
              Mapped
              Instantiated
              ObjectLiteral
              EvolvingArray
              ObjectLiteralPatternWithComputedProperties
            */
            this.warn("unhandled type " + typeToDebugString(type));
            return '?';
        };
        /**
         * translateTypeLiteral translates a ts.SymbolFlags.TypeLiteral type, which
         * is the anonymous type encountered in e.g.
         *   let x: {a: number};
         */
        TypeTranslator.prototype.translateTypeLiteral = function (type) {
            this.seenTypeLiterals.add(type);
            // Gather up all the named fields and whether the object is also callable.
            var callable = false;
            var indexable = false;
            var fields = [];
            if (!type.symbol || !type.symbol.members) {
                this.warn('type literal has no symbol');
                return '?';
            }
            // special-case construct signatures.
            var ctors = type.getConstructSignatures();
            if (ctors.length) {
                // TODO(martinprobst): this does not support additional properties defined on constructors
                // (not expressible in Closure), nor multiple constructors (same).
                var params = this.convertParams(ctors[0], ctors[0].declaration.parameters);
                var paramsStr = params.length ? (', ' + params.join(', ')) : '';
                var constructedType = this.translate(ctors[0].getReturnType());
                // In the specific case of the "new" in a function, it appears that
                //   function(new: !Bar)
                // fails to parse, while
                //   function(new: (!Bar))
                // parses in the way you'd expect.
                // It appears from testing that Closure ignores the ! anyway and just
                // assumes the result will be non-null in either case.  (To be pedantic,
                // it's possible to return null from a ctor it seems like a bad idea.)
                return "function(new: (" + constructedType + ")" + paramsStr + "): ?";
            }
            try {
                // members is an ES6 map, but the .d.ts defining it defined their own map
                // type, so typescript doesn't believe that .keys() is iterable
                // tslint:disable-next-line:no-any
                for (var _a = __values(type.symbol.members.keys()), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var field = _b.value;
                    switch (field) {
                        case '__call':
                            callable = true;
                            break;
                        case '__index':
                            indexable = true;
                            break;
                        default:
                            var member = type.symbol.members.get(field);
                            // optional members are handled by the type including |undefined in a union type.
                            var memberType = this.translate(this.typeChecker.getTypeOfSymbolAtLocation(member, this.node));
                            fields.push(field + ": " + memberType);
                            break;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_5) throw e_5.error; }
            }
            // Try to special-case plain key-value objects and functions.
            if (fields.length === 0) {
                if (callable && !indexable) {
                    // A function type.
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                }
                else if (indexable && !callable) {
                    // A plain key-value map type.
                    var keyType = 'string';
                    var valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.String);
                    if (!valType) {
                        keyType = 'number';
                        valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.Number);
                    }
                    if (!valType) {
                        this.warn('unknown index key type');
                        return "!Object<?,?>";
                    }
                    return "!Object<" + keyType + "," + this.translate(valType) + ">";
                }
                else if (!callable && !indexable) {
                    // Special-case the empty object {} because Closure doesn't like it.
                    // TODO(evanm): revisit this if it is a problem.
                    return '!Object';
                }
            }
            if (!callable && !indexable) {
                // Not callable, not indexable; implies a plain object with fields in it.
                return "{" + fields.join(', ') + "}";
            }
            this.warn('unhandled type literal');
            return '?';
            var e_5, _c;
        };
        /** Converts a ts.Signature (function signature) to a Closure function type. */
        TypeTranslator.prototype.signatureToClosure = function (sig) {
            // TODO(martinprobst): Consider harmonizing some overlap with emitFunctionType in tsickle.ts.
            this.blacklistTypeParameters(this.symbolsToAliasedNames, sig.declaration.typeParameters);
            var typeStr = "function(";
            var paramDecls = sig.declaration.parameters;
            var maybeThisParam = paramDecls[0];
            // Oddly, the this type shows up in paramDecls, but not in the type's parameters.
            // Handle it here and then pass paramDecls down without its first element.
            if (maybeThisParam && maybeThisParam.name.getText() === 'this') {
                if (maybeThisParam.type) {
                    var thisType = this.typeChecker.getTypeAtLocation(maybeThisParam.type);
                    typeStr += "this: (" + this.translate(thisType) + "), ";
                }
                else {
                    this.warn('this type without type');
                }
                paramDecls = paramDecls.slice(1);
            }
            var params = this.convertParams(sig, paramDecls);
            typeStr += params.join(', ') + ")";
            var retType = this.translate(this.typeChecker.getReturnTypeOfSignature(sig));
            if (retType) {
                typeStr += ": " + retType;
            }
            return typeStr;
        };
        /**
         * Converts parameters for the given signature. Takes parameter declarations as those might not
         * match the signature parameters (e.g. there might be an additional this parameter). This
         * difference is handled by the caller, as is converting the "this" parameter.
         */
        TypeTranslator.prototype.convertParams = function (sig, paramDecls) {
            var paramTypes = [];
            // The Signature itself does not include information on optional and var arg parameters.
            // Use its declaration to recover that information.
            var decl = sig.declaration;
            for (var i = 0; i < sig.parameters.length; i++) {
                var param = sig.parameters[i];
                var paramDecl = paramDecls[i];
                var optional = !!paramDecl.questionToken;
                var varArgs = !!paramDecl.dotDotDotToken;
                var paramType = this.typeChecker.getTypeOfSymbolAtLocation(param, this.node);
                if (varArgs) {
                    var typeRef = paramType;
                    paramType = typeRef.typeArguments[0];
                }
                var typeStr = this.translate(paramType);
                if (varArgs)
                    typeStr = '...' + typeStr;
                if (optional)
                    typeStr = typeStr + '=';
                paramTypes.push(typeStr);
            }
            return paramTypes;
        };
        TypeTranslator.prototype.warn = function (msg) {
            // By default, warn() does nothing.  The caller will overwrite this
            // if it wants different behavior.
        };
        /** @return true if sym should always have type {?}. */
        TypeTranslator.prototype.isBlackListed = function (symbol) {
            if (this.pathBlackList === undefined)
                return false;
            var pathBlackList = this.pathBlackList;
            // Some builtin types, such as {}, get represented by a symbol that has no declarations.
            if (symbol.declarations === undefined)
                return false;
            return symbol.declarations.every(function (n) {
                var fileName = path.normalize(n.getSourceFile().fileName);
                return pathBlackList.has(fileName);
            });
        };
        /**
         * Closure doesn not support type parameters for function types, i.e. generic function types.
         * Blacklist the symbols declared by them and emit a ? for the types.
         *
         * This mutates the given blacklist map. The map's scope is one file, and symbols are
         * unique objects, so this should neither lead to excessive memory consumption nor introduce
         * errors.
         *
         * @param blacklist a map to store the blacklisted symbols in, with a value of '?'. In practice,
         *     this is always === this.symbolsToAliasedNames, but we're passing it explicitly to make it
         *    clear that the map is mutated (in particular when used from outside the class).
         * @param decls the declarations whose symbols should be blacklisted.
         */
        TypeTranslator.prototype.blacklistTypeParameters = function (blacklist, decls) {
            if (!decls || !decls.length)
                return;
            try {
                for (var decls_1 = __values(decls), decls_1_1 = decls_1.next(); !decls_1_1.done; decls_1_1 = decls_1.next()) {
                    var tpd = decls_1_1.value;
                    var sym = this.typeChecker.getSymbolAtLocation(tpd.name);
                    if (!sym) {
                        this.warn("type parameter with no symbol");
                        continue;
                    }
                    this.symbolsToAliasedNames.set(sym, '?');
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (decls_1_1 && !decls_1_1.done && (_a = decls_1.return)) _a.call(decls_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            var e_6, _a;
        };
        return TypeTranslator;
    }());
    exports.TypeTranslator = TypeTranslator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS10cmFuc2xhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3R5cGUtdHJhbnNsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBR2pDOzs7T0FHRztJQUNILHlCQUFnQyxRQUFnQjtRQUM5QyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUM3RCxDQUFDO0lBRkQsMENBRUM7SUFFRDs7Ozs7T0FLRztJQUNILCtCQUErQixNQUFpQjtRQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxJQUFJO1lBQzlCLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCwyQkFBa0MsSUFBYTtRQUM3QyxJQUFJLFdBQVcsR0FBRyxhQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDO1FBRXZELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLFdBQVcsSUFBSSxZQUFVLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUcsQ0FBQztRQUNuRSxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM1QixXQUFXLElBQUksaUJBQWUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRyxDQUFDO1FBQzVGLENBQUM7UUFFRCw0RUFBNEU7UUFD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M0MsUUFBUSxDQUFDO29CQUNYLENBQUM7b0JBQ0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzFDOzs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUNILHFCQUFDO0lBQUQsQ0FBQyxBQXhrQkQsSUF3a0JDO0lBeGtCWSx3Q0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtnZXRJZGVudGlmaWVyVGV4dH0gZnJvbSAnLi9yZXdyaXRlcic7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBmaWxlTmFtZSByZWZlcnMgdG8gYSBidWlsdGluIGxpYi5kLnRzIGZpbGUuXG4gKiBUaGlzIGlzIGEgdGVycmlibGUgaGFjayBidXQgaXQgbWlycm9ycyBhIHNpbWlsYXIgdGhpbmcgZG9uZSBpbiBDbHV0ei5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnVpbHRpbkxpYkRUUyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBmaWxlTmFtZS5tYXRjaCgvXFxibGliXFwuKD86W14vXStcXC4pP2RcXC50cyQvKSAhPSBudWxsO1xufVxuXG4vKipcbiAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgbmFtZWQgdHlwZSBpcyBjb25zaWRlcmVkIGNvbXBhdGlibGUgd2l0aCB0aGUgQ2xvc3VyZS1kZWZpbmVkXG4gKiAgICAgdHlwZSBvZiB0aGUgc2FtZSBuYW1lLCBlLmcuIFwiQXJyYXlcIi4gIE5vdGUgdGhhdCB3ZSBkb24ndCBhY3R1YWxseSBlbmZvcmNlXG4gKiAgICAgdGhhdCB0aGUgdHlwZXMgYXJlIGFjdHVhbGx5IGNvbXBhdGlibGUsIGJ1dCBtb3N0bHkganVzdCBob3BlIHRoYXQgdGhleSBhcmUgZHVlXG4gKiAgICAgdG8gYmVpbmcgZGVyaXZlZCBmcm9tIHRoZSBzYW1lIEhUTUwgc3BlY3MuXG4gKi9cbmZ1bmN0aW9uIGlzQ2xvc3VyZVByb3ZpZGVkVHlwZShzeW1ib2w6IHRzLlN5bWJvbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3ltYm9sLmRlY2xhcmF0aW9ucyAhPSBudWxsICYmXG4gICAgICBzeW1ib2wuZGVjbGFyYXRpb25zLnNvbWUobiA9PiBpc0J1aWx0aW5MaWJEVFMobi5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVUb0RlYnVnU3RyaW5nKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICBsZXQgZGVidWdTdHJpbmcgPSBgZmxhZ3M6MHgke3R5cGUuZmxhZ3MudG9TdHJpbmcoMTYpfWA7XG5cbiAgaWYgKHR5cGUuYWxpYXNTeW1ib2wpIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIGFsaWFzOiR7c3ltYm9sVG9EZWJ1Z1N0cmluZyh0eXBlLmFsaWFzU3ltYm9sKX1gO1xuICB9XG4gIGlmICh0eXBlLmFsaWFzVHlwZUFyZ3VtZW50cykge1xuICAgIGRlYnVnU3RyaW5nICs9IGAgYWxpYXNBcmdzOjwke3R5cGUuYWxpYXNUeXBlQXJndW1lbnRzLm1hcCh0eXBlVG9EZWJ1Z1N0cmluZykuam9pbignLCcpfT5gO1xuICB9XG5cbiAgLy8gSnVzdCB0aGUgdW5pcXVlIGZsYWdzIChwb3dlcnMgb2YgdHdvKS4gRGVjbGFyZWQgaW4gc3JjL2NvbXBpbGVyL3R5cGVzLnRzLlxuICBjb25zdCBiYXNpY1R5cGVzOiB0cy5UeXBlRmxhZ3NbXSA9IFtcbiAgICB0cy5UeXBlRmxhZ3MuQW55LCAgICAgICAgICAgdHMuVHlwZUZsYWdzLlN0cmluZywgICAgICAgICB0cy5UeXBlRmxhZ3MuTnVtYmVyLFxuICAgIHRzLlR5cGVGbGFncy5Cb29sZWFuLCAgICAgICB0cy5UeXBlRmxhZ3MuRW51bSwgICAgICAgICAgIHRzLlR5cGVGbGFncy5TdHJpbmdMaXRlcmFsLFxuICAgIHRzLlR5cGVGbGFncy5OdW1iZXJMaXRlcmFsLCB0cy5UeXBlRmxhZ3MuQm9vbGVhbkxpdGVyYWwsIHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbCxcbiAgICB0cy5UeXBlRmxhZ3MuRVNTeW1ib2wsICAgICAgdHMuVHlwZUZsYWdzLlZvaWQsICAgICAgICAgICB0cy5UeXBlRmxhZ3MuVW5kZWZpbmVkLFxuICAgIHRzLlR5cGVGbGFncy5OdWxsLCAgICAgICAgICB0cy5UeXBlRmxhZ3MuTmV2ZXIsICAgICAgICAgIHRzLlR5cGVGbGFncy5UeXBlUGFyYW1ldGVyLFxuICAgIHRzLlR5cGVGbGFncy5PYmplY3QsICAgICAgICB0cy5UeXBlRmxhZ3MuVW5pb24sICAgICAgICAgIHRzLlR5cGVGbGFncy5JbnRlcnNlY3Rpb24sXG4gICAgdHMuVHlwZUZsYWdzLkluZGV4LCAgICAgICAgIHRzLlR5cGVGbGFncy5JbmRleGVkQWNjZXNzLCAgdHMuVHlwZUZsYWdzLk5vblByaW1pdGl2ZSxcbiAgXTtcbiAgZm9yIChjb25zdCBmbGFnIG9mIGJhc2ljVHlwZXMpIHtcbiAgICBpZiAoKHR5cGUuZmxhZ3MgJiBmbGFnKSAhPT0gMCkge1xuICAgICAgZGVidWdTdHJpbmcgKz0gYCAke3RzLlR5cGVGbGFnc1tmbGFnXX1gO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlLmZsYWdzID09PSB0cy5UeXBlRmxhZ3MuT2JqZWN0KSB7XG4gICAgY29uc3Qgb2JqVHlwZSA9IHR5cGUgYXMgdHMuT2JqZWN0VHlwZTtcbiAgICAvLyBKdXN0IHRoZSB1bmlxdWUgZmxhZ3MgKHBvd2VycyBvZiB0d28pLiBEZWNsYXJlZCBpbiBzcmMvY29tcGlsZXIvdHlwZXMudHMuXG4gICAgY29uc3Qgb2JqZWN0RmxhZ3M6IHRzLk9iamVjdEZsYWdzW10gPSBbXG4gICAgICB0cy5PYmplY3RGbGFncy5DbGFzcyxcbiAgICAgIHRzLk9iamVjdEZsYWdzLkludGVyZmFjZSxcbiAgICAgIHRzLk9iamVjdEZsYWdzLlJlZmVyZW5jZSxcbiAgICAgIHRzLk9iamVjdEZsYWdzLlR1cGxlLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuQW5vbnltb3VzLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuTWFwcGVkLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuSW5zdGFudGlhdGVkLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuT2JqZWN0TGl0ZXJhbCxcbiAgICAgIHRzLk9iamVjdEZsYWdzLkV2b2x2aW5nQXJyYXksXG4gICAgICB0cy5PYmplY3RGbGFncy5PYmplY3RMaXRlcmFsUGF0dGVybldpdGhDb21wdXRlZFByb3BlcnRpZXMsXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGZsYWcgb2Ygb2JqZWN0RmxhZ3MpIHtcbiAgICAgIGlmICgob2JqVHlwZS5vYmplY3RGbGFncyAmIGZsYWcpICE9PSAwKSB7XG4gICAgICAgIGRlYnVnU3RyaW5nICs9IGAgb2JqZWN0OiR7dHMuT2JqZWN0RmxhZ3NbZmxhZ119YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodHlwZS5zeW1ib2wgJiYgdHlwZS5zeW1ib2wubmFtZSAhPT0gJ19fdHlwZScpIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIHN5bWJvbC5uYW1lOiR7SlNPTi5zdHJpbmdpZnkodHlwZS5zeW1ib2wubmFtZSl9YDtcbiAgfVxuXG4gIGlmICh0eXBlLnBhdHRlcm4pIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIGRlc3RydWN0dXJpbmc6dHJ1ZWA7XG4gIH1cblxuICByZXR1cm4gYHt0eXBlICR7ZGVidWdTdHJpbmd9fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW1ib2xUb0RlYnVnU3RyaW5nKHN5bTogdHMuU3ltYm9sKTogc3RyaW5nIHtcbiAgbGV0IGRlYnVnU3RyaW5nID0gYCR7SlNPTi5zdHJpbmdpZnkoc3ltLm5hbWUpfSBmbGFnczoweCR7c3ltLmZsYWdzLnRvU3RyaW5nKDE2KX1gO1xuXG4gIC8vIEp1c3QgdGhlIHVuaXF1ZSBmbGFncyAocG93ZXJzIG9mIHR3bykuIERlY2xhcmVkIGluIHNyYy9jb21waWxlci90eXBlcy50cy5cbiAgY29uc3Qgc3ltYm9sRmxhZ3MgPSBbXG4gICAgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb25TY29wZWRWYXJpYWJsZSxcbiAgICB0cy5TeW1ib2xGbGFncy5CbG9ja1Njb3BlZFZhcmlhYmxlLFxuICAgIHRzLlN5bWJvbEZsYWdzLlByb3BlcnR5LFxuICAgIHRzLlN5bWJvbEZsYWdzLkVudW1NZW1iZXIsXG4gICAgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb24sXG4gICAgdHMuU3ltYm9sRmxhZ3MuQ2xhc3MsXG4gICAgdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkNvbnN0RW51bSxcbiAgICB0cy5TeW1ib2xGbGFncy5SZWd1bGFyRW51bSxcbiAgICB0cy5TeW1ib2xGbGFncy5WYWx1ZU1vZHVsZSxcbiAgICB0cy5TeW1ib2xGbGFncy5OYW1lc3BhY2VNb2R1bGUsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHlwZUxpdGVyYWwsXG4gICAgdHMuU3ltYm9sRmxhZ3MuT2JqZWN0TGl0ZXJhbCxcbiAgICB0cy5TeW1ib2xGbGFncy5NZXRob2QsXG4gICAgdHMuU3ltYm9sRmxhZ3MuQ29uc3RydWN0b3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuR2V0QWNjZXNzb3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuU2V0QWNjZXNzb3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuU2lnbmF0dXJlLFxuICAgIHRzLlN5bWJvbEZsYWdzLlR5cGVQYXJhbWV0ZXIsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHlwZUFsaWFzLFxuICAgIHRzLlN5bWJvbEZsYWdzLkV4cG9ydFZhbHVlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkFsaWFzLFxuICAgIHRzLlN5bWJvbEZsYWdzLlByb3RvdHlwZSxcbiAgICB0cy5TeW1ib2xGbGFncy5FeHBvcnRTdGFyLFxuICAgIHRzLlN5bWJvbEZsYWdzLk9wdGlvbmFsLFxuICAgIHRzLlN5bWJvbEZsYWdzLlRyYW5zaWVudCxcbiAgXTtcbiAgZm9yIChjb25zdCBmbGFnIG9mIHN5bWJvbEZsYWdzKSB7XG4gICAgaWYgKChzeW0uZmxhZ3MgJiBmbGFnKSAhPT0gMCkge1xuICAgICAgZGVidWdTdHJpbmcgKz0gYCAke3RzLlN5bWJvbEZsYWdzW2ZsYWddfWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlYnVnU3RyaW5nO1xufVxuXG4vKiogVHlwZVRyYW5zbGF0b3IgdHJhbnNsYXRlcyBUeXBlU2NyaXB0IHR5cGVzIHRvIENsb3N1cmUgdHlwZXMuICovXG5leHBvcnQgY2xhc3MgVHlwZVRyYW5zbGF0b3Ige1xuICAvKipcbiAgICogQSBsaXN0IG9mIHR5cGUgbGl0ZXJhbHMgd2UndmUgZW5jb3VudGVyZWQgd2hpbGUgZW1pdHRpbmc7IHVzZWQgdG8gYXZvaWQgZ2V0dGluZyBzdHVjayBpblxuICAgKiByZWN1cnNpdmUgdHlwZXMuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHNlZW5UeXBlTGl0ZXJhbHMgPSBuZXcgU2V0PHRzLlR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gd3JpdGUgdHlwZXMgc3VpdGFibGUgZm9yIGFuIFxcQGV4dGVybnMgZmlsZS4gRXh0ZXJucyB0eXBlcyBtdXN0IG5vdCByZWZlciB0b1xuICAgKiBub24tZXh0ZXJucyB0eXBlcyAoaS5lLiBub24gYW1iaWVudCB0eXBlcykgYW5kIG5lZWQgdG8gdXNlIGZ1bGx5IHF1YWxpZmllZCBuYW1lcy5cbiAgICovXG4gIGlzRm9yRXh0ZXJucyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbm9kZSBpcyB0aGUgc291cmNlIEFTVCB0cy5Ob2RlIHRoZSB0eXBlIGNvbWVzIGZyb20uICBUaGlzIGlzIHVzZWRcbiAgICogICAgIGluIHNvbWUgY2FzZXMgKGUuZy4gYW5vbnltb3VzIHR5cGVzKSBmb3IgbG9va2luZyB1cCBmaWVsZCBuYW1lcy5cbiAgICogQHBhcmFtIHBhdGhCbGFja0xpc3QgaXMgYSBzZXQgb2YgcGF0aHMgdGhhdCBzaG91bGQgbmV2ZXIgZ2V0IHR5cGVkO1xuICAgKiAgICAgYW55IHJlZmVyZW5jZSB0byBzeW1ib2xzIGRlZmluZWQgaW4gdGhlc2UgcGF0aHMgc2hvdWxkIGJ5IHR5cGVkXG4gICAqICAgICBhcyB7P30uXG4gICAqIEBwYXJhbSBzeW1ib2xzVG9BbGlhc2VkTmFtZXMgYSBtYXBwaW5nIGZyb20gc3ltYm9scyAoYEZvb2ApIHRvIGEgbmFtZSBpbiBzY29wZSB0aGV5IHNob3VsZCBiZVxuICAgKiAgICAgZW1pdHRlZCBhcyAoZS5nLiBgdHNpY2tsZV9mb3J3YXJkX2RlY2xhcmVfMS5Gb29gKS4gQ2FuIGJlIGF1Z21lbnRlZCBkdXJpbmcgdHlwZVxuICAgKiAgICAgdHJhbnNsYXRpb24sIGUuZy4gdG8gYmxhY2tsaXN0IGEgc3ltYm9sLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgcHJpdmF0ZSByZWFkb25seSBub2RlOiB0cy5Ob2RlLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBwYXRoQmxhY2tMaXN0PzogU2V0PHN0cmluZz4sXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IHN5bWJvbHNUb0FsaWFzZWROYW1lcyA9IG5ldyBNYXA8dHMuU3ltYm9sLCBzdHJpbmc+KCksXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGVuc3VyZVN5bWJvbERlY2xhcmVkOiAoc3ltOiB0cy5TeW1ib2wpID0+IHZvaWQgPSAoKSA9PiB7fSkge1xuICAgIC8vIE5vcm1hbGl6ZSBwYXRocyB0byBub3QgYnJlYWsgY2hlY2tzIG9uIFdpbmRvd3MuXG4gICAgaWYgKHRoaXMucGF0aEJsYWNrTGlzdCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnBhdGhCbGFja0xpc3QgPVxuICAgICAgICAgIG5ldyBTZXQ8c3RyaW5nPihBcnJheS5mcm9tKHRoaXMucGF0aEJsYWNrTGlzdC52YWx1ZXMoKSkubWFwKHAgPT4gcGF0aC5ub3JtYWxpemUocCkpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSB0cy5TeW1ib2wgdG8gYSBzdHJpbmcuXG4gICAqIE90aGVyIGFwcHJvYWNoZXMgdGhhdCBkb24ndCB3b3JrOlxuICAgKiAtIFR5cGVDaGVja2VyLnR5cGVUb1N0cmluZyB0cmFuc2xhdGVzIEFycmF5IGFzIFRbXS5cbiAgICogLSBUeXBlQ2hlY2tlci5zeW1ib2xUb1N0cmluZyBlbWl0cyB0eXBlcyB3aXRob3V0IHRoZWlyIG5hbWVzcGFjZSxcbiAgICogICBhbmQgZG9lc24ndCBsZXQgeW91IHBhc3MgdGhlIGZsYWcgdG8gY29udHJvbCB0aGF0LlxuICAgKiBAcGFyYW0gdXNlRnFuIHdoZXRoZXIgdG8gc2NvcGUgdGhlIG5hbWUgdXNpbmcgaXRzIGZ1bGx5IHF1YWxpZmllZCBuYW1lLiBDbG9zdXJlJ3MgdGVtcGxhdGVcbiAgICogICAgIGFyZ3VtZW50cyBhcmUgYWx3YXlzIHNjb3BlZCB0byB0aGUgY2xhc3MgY29udGFpbmluZyB0aGVtLCB3aGVyZSBUeXBlU2NyaXB0J3MgdGVtcGxhdGUgYXJnc1xuICAgKiAgICAgd291bGQgYmUgZnVsbHkgcXVhbGlmaWVkLiBJLmUuIHRoaXMgZmxhZyBpcyBmYWxzZSBmb3IgZ2VuZXJpYyB0eXBlcy5cbiAgICovXG4gIHB1YmxpYyBzeW1ib2xUb1N0cmluZyhzeW06IHRzLlN5bWJvbCwgdXNlRnFuOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBpZiAodXNlRnFuICYmIHRoaXMuaXNGb3JFeHRlcm5zKSB7XG4gICAgICAvLyBGb3IgcmVndWxhciB0eXBlIGVtaXQsIHdlIGNhbiB1c2UgVHlwZVNjcmlwdCdzIG5hbWluZyBydWxlcywgYXMgdGhleSBtYXRjaCBDbG9zdXJlJ3MgbmFtZVxuICAgICAgLy8gc2NvcGluZyBydWxlcy4gSG93ZXZlciB3aGVuIGVtaXR0aW5nIGV4dGVybnMgZmlsZXMgZm9yIGFtYmllbnRzLCBuYW1pbmcgcnVsZXMgY2hhbmdlLiBBc1xuICAgICAgLy8gQ2xvc3VyZSBkb2Vzbid0IHN1cHBvcnQgZXh0ZXJucyBtb2R1bGVzLCBhbGwgbmFtZXMgbXVzdCBiZSBnbG9iYWwgYW5kIHVzZSBnbG9iYWwgZnVsbHlcbiAgICAgIC8vIHF1YWxpZmllZCBuYW1lcy4gVGhlIGNvZGUgYmVsb3cgdXNlcyBUeXBlU2NyaXB0IHRvIGNvbnZlcnQgYSBzeW1ib2wgdG8gYSBmdWxsIHF1YWxpZmllZFxuICAgICAgLy8gbmFtZSBhbmQgdGhlbiBlbWl0cyB0aGF0LlxuICAgICAgbGV0IGZxbiA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0RnVsbHlRdWFsaWZpZWROYW1lKHN5bSk7XG4gICAgICBpZiAoZnFuLnN0YXJ0c1dpdGgoYFwiYCkgfHwgZnFuLnN0YXJ0c1dpdGgoYCdgKSkge1xuICAgICAgICAvLyBRdW90ZWQgRlFOcyBtZWFuIHRoZSBuYW1lIGlzIGZyb20gYSBtb2R1bGUsIGUuZy4gYCdwYXRoL3RvL21vZHVsZScuc29tZS5xdWFsaWZpZWQuTmFtZWAuXG4gICAgICAgIC8vIHRzaWNrbGUgZ2VuZXJhbGx5IHJlLXNjb3BlcyBuYW1lcyBpbiBtb2R1bGVzIHRoYXQgYXJlIG1vdmVkIHRvIGV4dGVybnMgaW50byB0aGUgZ2xvYmFsXG4gICAgICAgIC8vIG5hbWVzcGFjZS4gVGhhdCBkb2VzIG5vdCBxdWl0ZSBtYXRjaCBUUycgc2VtYW50aWNzIHdoZXJlIGFtYmllbnQgdHlwZXMgZnJvbSBtb2R1bGVzIGFyZVxuICAgICAgICAvLyBsb2NhbC4gSG93ZXZlciB2YWx1ZSBkZWNsYXJhdGlvbnMgdGhhdCBhcmUgbG9jYWwgdG8gbW9kdWxlcyBidXQgbm90IGRlZmluZWQgZG8gbm90IG1ha2VcbiAgICAgICAgLy8gc2Vuc2UgaWYgbm90IGdsb2JhbCwgZS5nLiBcImRlY2xhcmUgY2xhc3MgWCB7fTsgbmV3IFgoKTtcIiBjYW5ub3Qgd29yayB1bmxlc3MgYFhgIGlzXG4gICAgICAgIC8vIGFjdHVhbGx5IGEgZ2xvYmFsLlxuICAgICAgICAvLyBTbyB0aGlzIGNvZGUgc3RyaXBzIHRoZSBtb2R1bGUgcGF0aCBmcm9tIHRoZSB0eXBlIGFuZCB1c2VzIHRoZSBGUU4gYXMgYSBnbG9iYWwuXG4gICAgICAgIGZxbiA9IGZxbi5yZXBsYWNlKC9eW1wiJ11bXlwiJ10rWydcIl1cXC4vLCAnJyk7XG4gICAgICB9XG4gICAgICAvLyBEZWNsYXJhdGlvbnMgaW4gbW9kdWxlIGNhbiByZS1vcGVuIGdsb2JhbCB0eXBlcyB1c2luZyBcImRlY2xhcmUgZ2xvYmFsIHsgLi4uIH1cIi4gVGhlIGZxblxuICAgICAgLy8gdGhlbiBjb250YWlucyB0aGUgcHJlZml4IFwiZ2xvYmFsLlwiIGhlcmUuIEFzIHdlJ3JlIG1hcHBpbmcgdG8gZ2xvYmFsIHR5cGVzLCBqdXN0IHN0cmlwIHRoZVxuICAgICAgLy8gcHJlZml4LlxuICAgICAgY29uc3QgaXNJbkdsb2JhbCA9IChzeW0uZGVjbGFyYXRpb25zIHx8IFtdKS5zb21lKGQgPT4ge1xuICAgICAgICBsZXQgY3VycmVudDogdHMuTm9kZXx1bmRlZmluZWQgPSBkO1xuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgIGlmIChjdXJyZW50LmZsYWdzICYgdHMuTm9kZUZsYWdzLkdsb2JhbEF1Z21lbnRhdGlvbikgcmV0dXJuIHRydWU7XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGlzSW5HbG9iYWwpIHtcbiAgICAgICAgZnFuID0gZnFuLnJlcGxhY2UoL15nbG9iYWxcXC4vLCAnJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zdHJpcENsdXR6TmFtZXNwYWNlKGZxbik7XG4gICAgfVxuICAgIC8vIFR5cGVTY3JpcHQgcmVzb2x2ZXMgZS5nLiB1bmlvbiB0eXBlcyB0byB0aGVpciBtZW1iZXJzLCB3aGljaCBjYW4gaW5jbHVkZSBzeW1ib2xzIG5vdCBkZWNsYXJlZFxuICAgIC8vIGluIHRoZSBjdXJyZW50IHNjb3BlLiBFbnN1cmUgdGhhdCBhbGwgc3ltYm9scyBmb3VuZCB0aGlzIHdheSBhcmUgYWN0dWFsbHkgZGVjbGFyZWQuXG4gICAgLy8gVGhpcyBtdXN0IGhhcHBlbiBiZWZvcmUgdGhlIGFsaWFzIGNoZWNrIGJlbG93LCBpdCBtaWdodCBpbnRyb2R1Y2UgYSBuZXcgYWxpYXMgZm9yIHRoZSBzeW1ib2wuXG4gICAgaWYgKChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5UeXBlUGFyYW1ldGVyKSA9PT0gMCkgdGhpcy5lbnN1cmVTeW1ib2xEZWNsYXJlZChzeW0pO1xuXG4gICAgbGV0IHN5bUFsaWFzID0gc3ltO1xuICAgIGlmIChzeW1BbGlhcy5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICBzeW1BbGlhcyA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW1BbGlhcyk7XG4gICAgfVxuICAgIGNvbnN0IGFsaWFzID0gdGhpcy5zeW1ib2xzVG9BbGlhc2VkTmFtZXMuZ2V0KHN5bUFsaWFzKTtcbiAgICBpZiAoYWxpYXMpIHJldHVybiBhbGlhcztcblxuICAgIC8vIFRoaXMgZm9sbG93cyBnZXRTaW5nbGVMaW5lU3RyaW5nV3JpdGVyIGluIHRoZSBUeXBlU2NyaXB0IGNvbXBpbGVyLlxuICAgIGxldCBzdHIgPSAnJztcbiAgICBjb25zdCB3cml0ZVRleHQgPSAodGV4dDogc3RyaW5nKSA9PiBzdHIgKz0gdGV4dDtcbiAgICBjb25zdCBkb05vdGhpbmcgPSAoKSA9PiB7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgIGNvbnN0IGJ1aWxkZXIgPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbERpc3BsYXlCdWlsZGVyKCk7XG4gICAgY29uc3Qgd3JpdGVyOiB0cy5TeW1ib2xXcml0ZXIgPSB7XG4gICAgICB3cml0ZUtleXdvcmQ6IHdyaXRlVGV4dCxcbiAgICAgIHdyaXRlT3BlcmF0b3I6IHdyaXRlVGV4dCxcbiAgICAgIHdyaXRlUHVuY3R1YXRpb246IHdyaXRlVGV4dCxcbiAgICAgIHdyaXRlU3BhY2U6IHdyaXRlVGV4dCxcbiAgICAgIHdyaXRlU3RyaW5nTGl0ZXJhbDogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVQYXJhbWV0ZXI6IHdyaXRlVGV4dCxcbiAgICAgIHdyaXRlUHJvcGVydHk6IHdyaXRlVGV4dCxcbiAgICAgIHdyaXRlU3ltYm9sOiB3cml0ZVRleHQsXG4gICAgICB3cml0ZUxpbmU6IGRvTm90aGluZyxcbiAgICAgIGluY3JlYXNlSW5kZW50OiBkb05vdGhpbmcsXG4gICAgICBkZWNyZWFzZUluZGVudDogZG9Ob3RoaW5nLFxuICAgICAgY2xlYXI6IGRvTm90aGluZyxcbiAgICAgIHRyYWNrU3ltYm9sKHN5bWJvbDogdHMuU3ltYm9sLCBlbmNsb3NpbmdEZWNsYXJhdGlvbj86IHRzLk5vZGUsIG1lYW5pbmc/OiB0cy5TeW1ib2xGbGFncykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9LFxuICAgICAgcmVwb3J0SW5hY2Nlc3NpYmxlVGhpc0Vycm9yOiBkb05vdGhpbmcsXG4gICAgICByZXBvcnRQcml2YXRlSW5CYXNlT2ZDbGFzc0V4cHJlc3Npb246IGRvTm90aGluZyxcbiAgICB9O1xuICAgIGJ1aWxkZXIuYnVpbGRTeW1ib2xEaXNwbGF5KHN5bSwgd3JpdGVyLCB0aGlzLm5vZGUpO1xuICAgIHJldHVybiB0aGlzLnN0cmlwQ2x1dHpOYW1lc3BhY2Uoc3RyKTtcbiAgfVxuXG4gIC8vIENsdXR6IChodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jbHV0eikgZW1pdHMgZ2xvYmFsIHR5cGUgc3ltYm9scyBoaWRkZW4gaW4gYSBzcGVjaWFsXG4gIC8vIOCyoF/gsqAuY2x1dHogbmFtZXNwYWNlLiBXaGlsZSBtb3N0IGNvZGUgc2VlbiBieSBUc2lja2xlIHdpbGwgb25seSBldmVyIHNlZSBsb2NhbCBhbGlhc2VzLCBDbHV0elxuICAvLyBzeW1ib2xzIGNhbiBiZSB3cml0dGVuIGJ5IHVzZXJzIGRpcmVjdGx5IGluIGNvZGUsIGFuZCB0aGV5IGNhbiBhcHBlYXIgYnkgZGVyZWZlcmVuY2luZ1xuICAvLyBUeXBlQWxpYXNlcy4gVGhlIGNvZGUgYmVsb3cgc2ltcGx5IHN0cmlwcyB0aGUgcHJlZml4LCB0aGUgcmVtYWluaW5nIHR5cGUgbmFtZSB0aGVuIG1hdGNoZXNcbiAgLy8gQ2xvc3VyZSdzIHR5cGUuXG4gIHByaXZhdGUgc3RyaXBDbHV0ek5hbWVzcGFjZShuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAobmFtZS5zdGFydHNXaXRoKCfgsqBf4LKgLmNsdXR6LicpKSByZXR1cm4gbmFtZS5zdWJzdHJpbmcoJ+CyoF/gsqAuY2x1dHouJy5sZW5ndGgpO1xuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgdHJhbnNsYXRlKHR5cGU6IHRzLlR5cGUsIHJlc29sdmVBbGlhcyA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICAvLyBOT1RFOiBUaG91Z2ggdHlwZS5mbGFncyBoYXMgdGhlIG5hbWUgXCJmbGFnc1wiLCBpdCB1c3VhbGx5IGNhbiBvbmx5IGJlIG9uZVxuICAgIC8vIG9mIHRoZSBlbnVtIG9wdGlvbnMgYXQgYSB0aW1lIChleGNlcHQgZm9yIHVuaW9ucyBvZiBsaXRlcmFsIHR5cGVzLCBlLmcuIHVuaW9ucyBvZiBib29sZWFuXG4gICAgLy8gdmFsdWVzLCBzdHJpbmcgdmFsdWVzLCBlbnVtIHZhbHVlcykuIFRoaXMgc3dpdGNoIGhhbmRsZXMgYWxsIHRoZSBjYXNlcyBpbiB0aGUgdHMuVHlwZUZsYWdzXG4gICAgLy8gZW51bSBpbiB0aGUgb3JkZXIgdGhleSBvY2N1ci5cblxuICAgIC8vIE5PVEU6IFNvbWUgVHlwZUZsYWdzIGFyZSBtYXJrZWQgXCJpbnRlcm5hbFwiIGluIHRoZSBkLnRzIGJ1dCBzdGlsbCBzaG93IHVwIGluIHRoZSB2YWx1ZSBvZlxuICAgIC8vIHR5cGUuZmxhZ3MuIFRoaXMgbWFzayBsaW1pdHMgdGhlIGZsYWcgY2hlY2tzIHRvIHRoZSBvbmVzIGluIHRoZSBwdWJsaWMgQVBJLiBcImxhc3RGbGFnXCIgaGVyZVxuICAgIC8vIGlzIHRoZSBsYXN0IGZsYWcgaGFuZGxlZCBpbiB0aGlzIHN3aXRjaCBzdGF0ZW1lbnQsIGFuZCBzaG91bGQgYmUga2VwdCBpbiBzeW5jIHdpdGhcbiAgICAvLyB0eXBlc2NyaXB0LmQudHMuXG5cbiAgICAvLyBOb25QcmltaXRpdmUgb2NjdXJzIG9uIGl0cyBvd24gb24gdGhlIGxvd2VyIGNhc2UgXCJvYmplY3RcIiB0eXBlLiBTcGVjaWFsIGNhc2UgdG8gXCIhT2JqZWN0XCIuXG4gICAgaWYgKHR5cGUuZmxhZ3MgPT09IHRzLlR5cGVGbGFncy5Ob25QcmltaXRpdmUpIHJldHVybiAnIU9iamVjdCc7XG5cbiAgICAvLyBBdm9pZCBpbmZpbml0ZSBsb29wcyBvbiByZWN1cnNpdmUgdHlwZSBsaXRlcmFscy5cbiAgICAvLyBJdCB3b3VsZCBiZSBuaWNlIHRvIGp1c3QgZW1pdCB0aGUgbmFtZSBvZiB0aGUgcmVjdXJzaXZlIHR5cGUgaGVyZSAoaW4gdHlwZS5hbGlhc1N5bWJvbFxuICAgIC8vIGJlbG93KSwgYnV0IENsb3N1cmUgQ29tcGlsZXIgZG9lcyBub3QgYWxsb3cgcmVjdXJzaXZlIHR5cGUgZGVmaW5pdGlvbnMuXG4gICAgaWYgKHRoaXMuc2VlblR5cGVMaXRlcmFscy5oYXModHlwZSkpIHJldHVybiAnPyc7XG5cbiAgICAvLyBJZiB0eXBlIGlzIGFuIGFsaWFzLCBlLmcuIGZyb20gdHlwZSBYID0gQXxCLCB0aGVuIGFsd2F5cyBlbWl0IHRoZSBhbGlhcywgbm90IHRoZSB1bmRlcmx5aW5nXG4gICAgLy8gdW5pb24gdHlwZSwgYXMgdGhlIGFsaWFzIGlzIHRoZSB1c2VyIHZpc2libGUsIGltcG9ydGVkIHN5bWJvbC5cbiAgICBpZiAoIXJlc29sdmVBbGlhcyAmJiB0eXBlLmFsaWFzU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5zeW1ib2xUb1N0cmluZyh0eXBlLmFsaWFzU3ltYm9sLCAvKiB1c2VGcW4gKi8gdHJ1ZSk7XG4gICAgfVxuXG4gICAgbGV0IGlzQW1iaWVudCA9IGZhbHNlO1xuICAgIGxldCBpc05hbWVzcGFjZSA9IGZhbHNlO1xuICAgIGxldCBpc01vZHVsZSA9IGZhbHNlO1xuICAgIGlmICh0eXBlLnN5bWJvbCkge1xuICAgICAgZm9yIChjb25zdCBkZWNsIG9mIHR5cGUuc3ltYm9sLmRlY2xhcmF0aW9ucyB8fCBbXSkge1xuICAgICAgICBpZiAodHMuaXNFeHRlcm5hbE1vZHVsZShkZWNsLmdldFNvdXJjZUZpbGUoKSkpIGlzTW9kdWxlID0gdHJ1ZTtcbiAgICAgICAgbGV0IGN1cnJlbnQ6IHRzLk5vZGV8dW5kZWZpbmVkID0gZGVjbDtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICBpZiAodHMuZ2V0Q29tYmluZWRNb2RpZmllckZsYWdzKGN1cnJlbnQpICYgdHMuTW9kaWZpZXJGbGFncy5BbWJpZW50KSBpc0FtYmllbnQgPSB0cnVlO1xuICAgICAgICAgIGlmIChjdXJyZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTW9kdWxlRGVjbGFyYXRpb24pIGlzTmFtZXNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB0c2lja2xlIGNhbm5vdCBnZW5lcmF0ZSB0eXBlcyBmb3Igbm9uLWFtYmllbnQgbmFtZXNwYWNlcy5cbiAgICBpZiAoaXNOYW1lc3BhY2UgJiYgIWlzQW1iaWVudCkgcmV0dXJuICc/JztcblxuICAgIC8vIFR5cGVzIGluIGV4dGVybnMgY2Fubm90IHJlZmVyZW5jZSB0eXBlcyBmcm9tIGV4dGVybmFsIG1vZHVsZXMuXG4gICAgLy8gSG93ZXZlciBhbWJpZW50IHR5cGVzIGluIG1vZHVsZXMgZ2V0IG1vdmVkIHRvIGV4dGVybnMsIHRvbywgc28gdHlwZSByZWZlcmVuY2VzIHdvcmsgYW5kIHdlXG4gICAgLy8gY2FuIGVtaXQgYSBwcmVjaXNlIHR5cGUuXG4gICAgaWYgKHRoaXMuaXNGb3JFeHRlcm5zICYmIGlzTW9kdWxlICYmICFpc0FtYmllbnQpIHJldHVybiAnPyc7XG5cbiAgICBjb25zdCBsYXN0RmxhZyA9IHRzLlR5cGVGbGFncy5JbmRleGVkQWNjZXNzO1xuICAgIGNvbnN0IG1hc2sgPSAobGFzdEZsYWcgPDwgMSkgLSAxO1xuICAgIHN3aXRjaCAodHlwZS5mbGFncyAmIG1hc2spIHtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkFueTpcbiAgICAgICAgcmV0dXJuICc/JztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlN0cmluZzpcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk51bWJlcjpcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk51bWJlckxpdGVyYWw6XG4gICAgICAgIHJldHVybiAnbnVtYmVyJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkJvb2xlYW46XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Cb29sZWFuTGl0ZXJhbDpcbiAgICAgICAgLy8gU2VlIHRoZSBub3RlIGluIHRyYW5zbGF0ZVVuaW9uIGFib3V0IGJvb2xlYW5zLlxuICAgICAgICByZXR1cm4gJ2Jvb2xlYW4nO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuRW51bTpcbiAgICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICAgIHRoaXMud2FybihgRW51bVR5cGUgd2l0aG91dCBhIHN5bWJvbGApO1xuICAgICAgICAgIHJldHVybiAnPyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sVG9TdHJpbmcodHlwZS5zeW1ib2wsIHRydWUpO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuRVNTeW1ib2w6XG4gICAgICAgIC8vIE5PVEU6IGN1cnJlbnRseSB0aGlzIGlzIGp1c3QgYSB0eXBlZGVmIGZvciB7P30sIHNocnVnLlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2Nsb3N1cmUtY29tcGlsZXIvYmxvYi81NWNmNDNlZTMxZTgwZDg5ZDcwODdhZjY1YjU1NDJhYTYzOTg3ODc0L2V4dGVybnMvZXMzLmpzI0wzNFxuICAgICAgICByZXR1cm4gJ3N5bWJvbCc7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Wb2lkOlxuICAgICAgICByZXR1cm4gJ3ZvaWQnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuVW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5OdWxsOlxuICAgICAgICByZXR1cm4gJ251bGwnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuTmV2ZXI6XG4gICAgICAgIHRoaXMud2Fybihgc2hvdWxkIG5vdCBlbWl0IGEgJ25ldmVyJyB0eXBlYCk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5UeXBlUGFyYW1ldGVyOlxuICAgICAgICAvLyBUaGlzIGlzIGUuZy4gdGhlIFQgaW4gYSB0eXBlIGxpa2UgRm9vPFQ+LlxuICAgICAgICBpZiAoIXR5cGUuc3ltYm9sKSB7XG4gICAgICAgICAgdGhpcy53YXJuKGBUeXBlUGFyYW1ldGVyIHdpdGhvdXQgYSBzeW1ib2xgKTsgIC8vIHNob3VsZCBub3QgaGFwcGVuICh0bSlcbiAgICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgICB9XG4gICAgICAgIC8vIEluIENsb3N1cmUgQ29tcGlsZXIsIHR5cGUgcGFyYW1ldGVycyAqYXJlKiBzY29wZWQgdG8gdGhlaXIgY29udGFpbmluZyBjbGFzcy5cbiAgICAgICAgY29uc3QgdXNlRnFuID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbFRvU3RyaW5nKHR5cGUuc3ltYm9sLCB1c2VGcW4pO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuT2JqZWN0OlxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVPYmplY3QodHlwZSBhcyB0cy5PYmplY3RUeXBlKTtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlVuaW9uOlxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVVbmlvbih0eXBlIGFzIHRzLlVuaW9uVHlwZSk7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5JbnRlcnNlY3Rpb246XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5JbmRleDpcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkluZGV4ZWRBY2Nlc3M6XG4gICAgICAgIC8vIFRPRE8odHMyLjEpOiBoYW5kbGUgdGhlc2Ugc3BlY2lhbCB0eXBlcy5cbiAgICAgICAgdGhpcy53YXJuKGB1bmhhbmRsZWQgdHlwZSBmbGFnczogJHt0cy5UeXBlRmxhZ3NbdHlwZS5mbGFnc119YCk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBIYW5kbGUgY2FzZXMgd2hlcmUgbXVsdGlwbGUgZmxhZ3MgYXJlIHNldC5cblxuICAgICAgICAvLyBUeXBlcyB3aXRoIGxpdGVyYWwgbWVtYmVycyBhcmUgcmVwcmVzZW50ZWQgYXNcbiAgICAgICAgLy8gICB0cy5UeXBlRmxhZ3MuVW5pb24gfCBbbGl0ZXJhbCBtZW1iZXJdXG4gICAgICAgIC8vIEUuZy4gYW4gZW51bSB0eXBlZCB2YWx1ZSBpcyBhIHVuaW9uIHR5cGUgd2l0aCB0aGUgZW51bSdzIG1lbWJlcnMgYXMgaXRzIG1lbWJlcnMuIEFcbiAgICAgICAgLy8gYm9vbGVhbiB0eXBlIGlzIGEgdW5pb24gdHlwZSB3aXRoICd0cnVlJyBhbmQgJ2ZhbHNlJyBhcyBpdHMgbWVtYmVycy5cbiAgICAgICAgLy8gTm90ZSBhbHNvIHRoYXQgaW4gYSBtb3JlIGNvbXBsZXggdW5pb24sIGUuZy4gYm9vbGVhbnxudW1iZXIsIHRoZW4gaXQncyBhIHVuaW9uIG9mIHRocmVlXG4gICAgICAgIC8vIHRoaW5ncyAodHJ1ZXxmYWxzZXxudW1iZXIpIGFuZCB0cy5UeXBlRmxhZ3MuQm9vbGVhbiBkb2Vzbid0IHNob3cgdXAgYXQgYWxsLlxuICAgICAgICBpZiAodHlwZS5mbGFncyAmIHRzLlR5cGVGbGFncy5Vbmlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZVVuaW9uKHR5cGUgYXMgdHMuVW5pb25UeXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlLmZsYWdzICYgdHMuVHlwZUZsYWdzLkVudW1MaXRlcmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlRW51bUxpdGVyYWwodHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgc3dpdGNoIHN0YXRlbWVudCBzaG91bGQgaGF2ZSBiZWVuIGV4aGF1c3RpdmUuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5rbm93biB0eXBlIGZsYWdzICR7dHlwZS5mbGFnc30gb24gJHt0eXBlVG9EZWJ1Z1N0cmluZyh0eXBlKX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHRyYW5zbGF0ZVVuaW9uKHR5cGU6IHRzLlVuaW9uVHlwZSk6IHN0cmluZyB7XG4gICAgbGV0IHBhcnRzID0gdHlwZS50eXBlcy5tYXAodCA9PiB0aGlzLnRyYW5zbGF0ZSh0KSk7XG4gICAgLy8gVW5pb24gdHlwZXMgdGhhdCBpbmNsdWRlIGxpdGVyYWxzIChlLmcuIGJvb2xlYW4sIGVudW0pIGNhbiBlbmQgdXAgcmVwZWF0aW5nIHRoZSBzYW1lIENsb3N1cmVcbiAgICAvLyB0eXBlLiBGb3IgZXhhbXBsZTogdHJ1ZSB8IGJvb2xlYW4gd2lsbCBiZSB0cmFuc2xhdGVkIHRvIGJvb2xlYW4gfCBib29sZWFuLlxuICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIHRvIHByb2R1Y2UgdHlwZXMgdGhhdCByZWFkIGJldHRlci5cbiAgICBwYXJ0cyA9IHBhcnRzLmZpbHRlcigoZWwsIGlkeCkgPT4gcGFydHMuaW5kZXhPZihlbCkgPT09IGlkeCk7XG4gICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogYCgke3BhcnRzLmpvaW4oJ3wnKX0pYDtcbiAgfVxuXG4gIHByaXZhdGUgdHJhbnNsYXRlRW51bUxpdGVyYWwodHlwZTogdHMuVHlwZSk6IHN0cmluZyB7XG4gICAgLy8gU3VwcG9zZSB5b3UgaGFkOlxuICAgIC8vICAgZW51bSBFbnVtVHlwZSB7IE1FTUJFUiB9XG4gICAgLy8gdGhlbiB0aGUgdHlwZSBvZiBcIkVudW1UeXBlLk1FTUJFUlwiIGlzIGFuIGVudW0gbGl0ZXJhbCAodGhlIHRoaW5nIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uKVxuICAgIC8vIGFuZCBpdCBoYXMgdHlwZSBmbGFncyB0aGF0IGluY2x1ZGVcbiAgICAvLyAgIHRzLlR5cGVGbGFncy5OdW1iZXJMaXRlcmFsIHwgdHMuVHlwZUZsYWdzLkVudW1MaXRlcmFsXG4gICAgLy9cbiAgICAvLyBDbG9zdXJlIENvbXBpbGVyIGRvZXNuJ3Qgc3VwcG9ydCBsaXRlcmFscyBpbiB0eXBlcywgc28gdGhpcyBjb2RlIG11c3Qgbm90IGVtaXRcbiAgICAvLyBcIkVudW1UeXBlLk1FTUJFUlwiLCBidXQgcmF0aGVyIFwiRW51bVR5cGVcIi5cblxuICAgIGNvbnN0IGVudW1MaXRlcmFsQmFzZVR5cGUgPSB0aGlzLnR5cGVDaGVja2VyLmdldEJhc2VUeXBlT2ZMaXRlcmFsVHlwZSh0eXBlKTtcbiAgICBpZiAoIWVudW1MaXRlcmFsQmFzZVR5cGUuc3ltYm9sKSB7XG4gICAgICB0aGlzLndhcm4oYEVudW1MaXRlcmFsVHlwZSB3aXRob3V0IGEgc3ltYm9sYCk7XG4gICAgICByZXR1cm4gJz8nO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zeW1ib2xUb1N0cmluZyhlbnVtTGl0ZXJhbEJhc2VUeXBlLnN5bWJvbCwgdHJ1ZSk7XG4gIH1cblxuICAvLyB0cmFuc2xhdGVPYmplY3QgdHJhbnNsYXRlcyBhIHRzLk9iamVjdFR5cGUsIHdoaWNoIGlzIHRoZSB0eXBlIG9mIGFsbFxuICAvLyBvYmplY3QtbGlrZSB0aGluZ3MgaW4gVFMsIHN1Y2ggYXMgY2xhc3NlcyBhbmQgaW50ZXJmYWNlcy5cbiAgcHJpdmF0ZSB0cmFuc2xhdGVPYmplY3QodHlwZTogdHMuT2JqZWN0VHlwZSk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGUuc3ltYm9sICYmIHRoaXMuaXNCbGFja0xpc3RlZCh0eXBlLnN5bWJvbCkpIHJldHVybiAnPyc7XG5cbiAgICAvLyBOT1RFOiBvYmplY3RGbGFncyBpcyBhbiBlbnVtLCBidXQgYSBnaXZlbiB0eXBlIGNhbiBoYXZlIG11bHRpcGxlIGZsYWdzLlxuICAgIC8vIEFycmF5PHN0cmluZz4gaXMgYm90aCB0cy5PYmplY3RGbGFncy5SZWZlcmVuY2UgYW5kIHRzLk9iamVjdEZsYWdzLkludGVyZmFjZS5cblxuICAgIGlmICh0eXBlLm9iamVjdEZsYWdzICYgdHMuT2JqZWN0RmxhZ3MuQ2xhc3MpIHtcbiAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgdGhpcy53YXJuKCdjbGFzcyBoYXMgbm8gc3ltYm9sJyk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICB9XG4gICAgICByZXR1cm4gJyEnICsgdGhpcy5zeW1ib2xUb1N0cmluZyh0eXBlLnN5bWJvbCwgLyogdXNlRnFuICovIHRydWUpO1xuICAgIH0gZWxzZSBpZiAodHlwZS5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLkludGVyZmFjZSkge1xuICAgICAgLy8gTm90ZTogdHMuSW50ZXJmYWNlVHlwZSBoYXMgYSB0eXBlUGFyYW1ldGVycyBmaWVsZCwgYnV0IHRoYXRcbiAgICAgIC8vIHNwZWNpZmllcyB0aGUgcGFyYW1ldGVycyB0aGF0IHRoZSBpbnRlcmZhY2UgdHlwZSAqZXhwZWN0cypcbiAgICAgIC8vIHdoZW4gaXQncyB1c2VkLCBhbmQgc2hvdWxkIG5vdCBiZSB0cmFuc2Zvcm1lZCB0byB0aGUgb3V0cHV0LlxuICAgICAgLy8gRS5nLiBhIHR5cGUgbGlrZSBBcnJheTxudW1iZXI+IGlzIGEgVHlwZVJlZmVyZW5jZSB0byB0aGVcbiAgICAgIC8vIEludGVyZmFjZVR5cGUgXCJBcnJheVwiLCBidXQgdGhlIFwibnVtYmVyXCIgdHlwZSBwYXJhbWV0ZXIgaXNcbiAgICAgIC8vIHBhcnQgb2YgdGhlIG91dGVyIFR5cGVSZWZlcmVuY2UsIG5vdCBhIHR5cGVQYXJhbWV0ZXIgb25cbiAgICAgIC8vIHRoZSBJbnRlcmZhY2VUeXBlLlxuICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICB0aGlzLndhcm4oJ2ludGVyZmFjZSBoYXMgbm8gc3ltYm9sJyk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICB9XG4gICAgICBpZiAodHlwZS5zeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkge1xuICAgICAgICAvLyBUaGUgc3ltYm9sIGlzIGJvdGggYSB0eXBlIGFuZCBhIHZhbHVlLlxuICAgICAgICAvLyBGb3IgdXNlci1kZWZpbmVkIHR5cGVzIGluIHRoaXMgc3RhdGUsIHdlIGRvbid0IGhhdmUgYSBDbG9zdXJlIG5hbWVcbiAgICAgICAgLy8gZm9yIHRoZSB0eXBlLiAgU2VlIHRoZSB0eXBlX2FuZF92YWx1ZSB0ZXN0LlxuICAgICAgICBpZiAoIWlzQ2xvc3VyZVByb3ZpZGVkVHlwZSh0eXBlLnN5bWJvbCkpIHtcbiAgICAgICAgICB0aGlzLndhcm4oYHR5cGUvc3ltYm9sIGNvbmZsaWN0IGZvciAke3R5cGUuc3ltYm9sLm5hbWV9LCB1c2luZyB7P30gZm9yIG5vd2ApO1xuICAgICAgICAgIHJldHVybiAnPyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAnIScgKyB0aGlzLnN5bWJvbFRvU3RyaW5nKHR5cGUuc3ltYm9sLCAvKiB1c2VGcW4gKi8gdHJ1ZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlLm9iamVjdEZsYWdzICYgdHMuT2JqZWN0RmxhZ3MuUmVmZXJlbmNlKSB7XG4gICAgICAvLyBBIHJlZmVyZW5jZSB0byBhbm90aGVyIHR5cGUsIGUuZy4gQXJyYXk8bnVtYmVyPiByZWZlcnMgdG8gQXJyYXkuXG4gICAgICAvLyBFbWl0IHRoZSByZWZlcmVuY2VkIHR5cGUgYW5kIGFueSB0eXBlIGFyZ3VtZW50cy5cbiAgICAgIGNvbnN0IHJlZmVyZW5jZVR5cGUgPSB0eXBlIGFzIHRzLlR5cGVSZWZlcmVuY2U7XG5cbiAgICAgIC8vIEEgdHVwbGUgaXMgYSBSZWZlcmVuY2VUeXBlIHdoZXJlIHRoZSB0YXJnZXQgaXMgZmxhZ2dlZCBUdXBsZSBhbmQgdGhlXG4gICAgICAvLyB0eXBlQXJndW1lbnRzIGFyZSB0aGUgdHVwbGUgYXJndW1lbnRzLiAgSnVzdCB0cmVhdCBpdCBhcyBhIG15c3RlcnlcbiAgICAgIC8vIGFycmF5LCBiZWNhdXNlIENsb3N1cmUgZG9lc24ndCB1bmRlcnN0YW5kIHR1cGxlcy5cbiAgICAgIGlmIChyZWZlcmVuY2VUeXBlLnRhcmdldC5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLlR1cGxlKSB7XG4gICAgICAgIHJldHVybiAnIUFycmF5PD8+JztcbiAgICAgIH1cblxuICAgICAgbGV0IHR5cGVTdHIgPSAnJztcbiAgICAgIGlmIChyZWZlcmVuY2VUeXBlLnRhcmdldCA9PT0gcmVmZXJlbmNlVHlwZSkge1xuICAgICAgICAvLyBXZSBnZXQgaW50byBhbiBpbmZpbml0ZSBsb29wIGhlcmUgaWYgdGhlIGlubmVyIHJlZmVyZW5jZSBpc1xuICAgICAgICAvLyB0aGUgc2FtZSBhcyB0aGUgb3V0ZXI7IHRoaXMgY2FuIG9jY3VyIHdoZW4gdGhpcyBmdW5jdGlvblxuICAgICAgICAvLyBmYWlscyB0byB0cmFuc2xhdGUgYSBtb3JlIHNwZWNpZmljIHR5cGUgYmVmb3JlIGdldHRpbmcgdG9cbiAgICAgICAgLy8gdGhpcyBwb2ludC5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYHJlZmVyZW5jZSBsb29wIGluICR7dHlwZVRvRGVidWdTdHJpbmcocmVmZXJlbmNlVHlwZSl9ICR7cmVmZXJlbmNlVHlwZS5mbGFnc31gKTtcbiAgICAgIH1cbiAgICAgIHR5cGVTdHIgKz0gdGhpcy50cmFuc2xhdGUocmVmZXJlbmNlVHlwZS50YXJnZXQpO1xuICAgICAgLy8gVHJhbnNsYXRlIGNhbiByZXR1cm4gJz8nIGZvciBhIG51bWJlciBvZiBzaXR1YXRpb25zLCBlLmcuIHR5cGUvdmFsdWUgY29uZmxpY3RzLlxuICAgICAgLy8gYD88Pz5gIGlzIGlsbGVnYWwgc3ludGF4IGluIENsb3N1cmUgQ29tcGlsZXIsIHNvIGp1c3QgcmV0dXJuIGA/YCBoZXJlLlxuICAgICAgaWYgKHR5cGVTdHIgPT09ICc/JykgcmV0dXJuICc/JztcbiAgICAgIGlmIChyZWZlcmVuY2VUeXBlLnR5cGVBcmd1bWVudHMpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gcmVmZXJlbmNlVHlwZS50eXBlQXJndW1lbnRzLm1hcCh0ID0+IHRoaXMudHJhbnNsYXRlKHQpKTtcbiAgICAgICAgdHlwZVN0ciArPSBgPCR7cGFyYW1zLmpvaW4oJywgJyl9PmA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHlwZVN0cjtcbiAgICB9IGVsc2UgaWYgKHR5cGUub2JqZWN0RmxhZ3MgJiB0cy5PYmplY3RGbGFncy5Bbm9ueW1vdXMpIHtcbiAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgLy8gVGhpcyBjb21lcyB1cCB3aGVuIGdlbmVyYXRpbmcgY29kZSBmb3IgYW4gYXJyb3cgZnVuY3Rpb24gYXMgcGFzc2VkXG4gICAgICAgIC8vIHRvIGEgZ2VuZXJpYyBmdW5jdGlvbi4gIFRoZSBwYXNzZWQtaW4gdHlwZSBpcyB0YWdnZWQgYXMgYW5vbnltb3VzXG4gICAgICAgIC8vIGFuZCBoYXMgbm8gcHJvcGVydGllcyBzbyBpdCdzIGhhcmQgdG8gZmlndXJlIG91dCB3aGF0IHRvIGdlbmVyYXRlLlxuICAgICAgICAvLyBKdXN0IGF2b2lkIGl0IGZvciBub3cgc28gd2UgZG9uJ3QgY3Jhc2guXG4gICAgICAgIHRoaXMud2FybignYW5vbnltb3VzIHR5cGUgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZS5zeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5UeXBlTGl0ZXJhbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVUeXBlTGl0ZXJhbCh0eXBlKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdHlwZS5zeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5GdW5jdGlvbiB8fFxuICAgICAgICAgIHR5cGUuc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuTWV0aG9kKSB7XG4gICAgICAgIGNvbnN0IHNpZ3MgPSB0aGlzLnR5cGVDaGVja2VyLmdldFNpZ25hdHVyZXNPZlR5cGUodHlwZSwgdHMuU2lnbmF0dXJlS2luZC5DYWxsKTtcbiAgICAgICAgaWYgKHNpZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2lnbmF0dXJlVG9DbG9zdXJlKHNpZ3NbMF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLndhcm4oJ3VuaGFuZGxlZCBhbm9ueW1vdXMgdHlwZScpO1xuICAgICAgcmV0dXJuICc/JztcbiAgICB9XG5cbiAgICAvKlxuICAgIFRPRE8odHMyLjEpOiBtb3JlIHVuaGFuZGxlZCBvYmplY3QgdHlwZSBmbGFnczpcbiAgICAgIFR1cGxlXG4gICAgICBNYXBwZWRcbiAgICAgIEluc3RhbnRpYXRlZFxuICAgICAgT2JqZWN0TGl0ZXJhbFxuICAgICAgRXZvbHZpbmdBcnJheVxuICAgICAgT2JqZWN0TGl0ZXJhbFBhdHRlcm5XaXRoQ29tcHV0ZWRQcm9wZXJ0aWVzXG4gICAgKi9cbiAgICB0aGlzLndhcm4oYHVuaGFuZGxlZCB0eXBlICR7dHlwZVRvRGVidWdTdHJpbmcodHlwZSl9YCk7XG4gICAgcmV0dXJuICc/JztcbiAgfVxuXG4gIC8qKlxuICAgKiB0cmFuc2xhdGVUeXBlTGl0ZXJhbCB0cmFuc2xhdGVzIGEgdHMuU3ltYm9sRmxhZ3MuVHlwZUxpdGVyYWwgdHlwZSwgd2hpY2hcbiAgICogaXMgdGhlIGFub255bW91cyB0eXBlIGVuY291bnRlcmVkIGluIGUuZy5cbiAgICogICBsZXQgeDoge2E6IG51bWJlcn07XG4gICAqL1xuICBwcml2YXRlIHRyYW5zbGF0ZVR5cGVMaXRlcmFsKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICAgIHRoaXMuc2VlblR5cGVMaXRlcmFscy5hZGQodHlwZSk7XG4gICAgLy8gR2F0aGVyIHVwIGFsbCB0aGUgbmFtZWQgZmllbGRzIGFuZCB3aGV0aGVyIHRoZSBvYmplY3QgaXMgYWxzbyBjYWxsYWJsZS5cbiAgICBsZXQgY2FsbGFibGUgPSBmYWxzZTtcbiAgICBsZXQgaW5kZXhhYmxlID0gZmFsc2U7XG4gICAgY29uc3QgZmllbGRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGlmICghdHlwZS5zeW1ib2wgfHwgIXR5cGUuc3ltYm9sLm1lbWJlcnMpIHtcbiAgICAgIHRoaXMud2FybigndHlwZSBsaXRlcmFsIGhhcyBubyBzeW1ib2wnKTtcbiAgICAgIHJldHVybiAnPyc7XG4gICAgfVxuXG4gICAgLy8gc3BlY2lhbC1jYXNlIGNvbnN0cnVjdCBzaWduYXR1cmVzLlxuICAgIGNvbnN0IGN0b3JzID0gdHlwZS5nZXRDb25zdHJ1Y3RTaWduYXR1cmVzKCk7XG4gICAgaWYgKGN0b3JzLmxlbmd0aCkge1xuICAgICAgLy8gVE9ETyhtYXJ0aW5wcm9ic3QpOiB0aGlzIGRvZXMgbm90IHN1cHBvcnQgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGRlZmluZWQgb24gY29uc3RydWN0b3JzXG4gICAgICAvLyAobm90IGV4cHJlc3NpYmxlIGluIENsb3N1cmUpLCBub3IgbXVsdGlwbGUgY29uc3RydWN0b3JzIChzYW1lKS5cbiAgICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuY29udmVydFBhcmFtcyhjdG9yc1swXSwgY3RvcnNbMF0uZGVjbGFyYXRpb24ucGFyYW1ldGVycyk7XG4gICAgICBjb25zdCBwYXJhbXNTdHIgPSBwYXJhbXMubGVuZ3RoID8gKCcsICcgKyBwYXJhbXMuam9pbignLCAnKSkgOiAnJztcbiAgICAgIGNvbnN0IGNvbnN0cnVjdGVkVHlwZSA9IHRoaXMudHJhbnNsYXRlKGN0b3JzWzBdLmdldFJldHVyblR5cGUoKSk7XG4gICAgICAvLyBJbiB0aGUgc3BlY2lmaWMgY2FzZSBvZiB0aGUgXCJuZXdcIiBpbiBhIGZ1bmN0aW9uLCBpdCBhcHBlYXJzIHRoYXRcbiAgICAgIC8vICAgZnVuY3Rpb24obmV3OiAhQmFyKVxuICAgICAgLy8gZmFpbHMgdG8gcGFyc2UsIHdoaWxlXG4gICAgICAvLyAgIGZ1bmN0aW9uKG5ldzogKCFCYXIpKVxuICAgICAgLy8gcGFyc2VzIGluIHRoZSB3YXkgeW91J2QgZXhwZWN0LlxuICAgICAgLy8gSXQgYXBwZWFycyBmcm9tIHRlc3RpbmcgdGhhdCBDbG9zdXJlIGlnbm9yZXMgdGhlICEgYW55d2F5IGFuZCBqdXN0XG4gICAgICAvLyBhc3N1bWVzIHRoZSByZXN1bHQgd2lsbCBiZSBub24tbnVsbCBpbiBlaXRoZXIgY2FzZS4gIChUbyBiZSBwZWRhbnRpYyxcbiAgICAgIC8vIGl0J3MgcG9zc2libGUgdG8gcmV0dXJuIG51bGwgZnJvbSBhIGN0b3IgaXQgc2VlbXMgbGlrZSBhIGJhZCBpZGVhLilcbiAgICAgIHJldHVybiBgZnVuY3Rpb24obmV3OiAoJHtjb25zdHJ1Y3RlZFR5cGV9KSR7cGFyYW1zU3RyfSk6ID9gO1xuICAgIH1cblxuICAgIC8vIG1lbWJlcnMgaXMgYW4gRVM2IG1hcCwgYnV0IHRoZSAuZC50cyBkZWZpbmluZyBpdCBkZWZpbmVkIHRoZWlyIG93biBtYXBcbiAgICAvLyB0eXBlLCBzbyB0eXBlc2NyaXB0IGRvZXNuJ3QgYmVsaWV2ZSB0aGF0IC5rZXlzKCkgaXMgaXRlcmFibGVcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiAodHlwZS5zeW1ib2wubWVtYmVycy5rZXlzKCkgYXMgYW55KSkge1xuICAgICAgc3dpdGNoIChmaWVsZCkge1xuICAgICAgICBjYXNlICdfX2NhbGwnOlxuICAgICAgICAgIGNhbGxhYmxlID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnX19pbmRleCc6XG4gICAgICAgICAgaW5kZXhhYmxlID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zdCBtZW1iZXIgPSB0eXBlLnN5bWJvbC5tZW1iZXJzLmdldChmaWVsZCkhO1xuICAgICAgICAgIC8vIG9wdGlvbmFsIG1lbWJlcnMgYXJlIGhhbmRsZWQgYnkgdGhlIHR5cGUgaW5jbHVkaW5nIHx1bmRlZmluZWQgaW4gYSB1bmlvbiB0eXBlLlxuICAgICAgICAgIGNvbnN0IG1lbWJlclR5cGUgPVxuICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh0aGlzLnR5cGVDaGVja2VyLmdldFR5cGVPZlN5bWJvbEF0TG9jYXRpb24obWVtYmVyLCB0aGlzLm5vZGUpKTtcbiAgICAgICAgICBmaWVsZHMucHVzaChgJHtmaWVsZH06ICR7bWVtYmVyVHlwZX1gKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUcnkgdG8gc3BlY2lhbC1jYXNlIHBsYWluIGtleS12YWx1ZSBvYmplY3RzIGFuZCBmdW5jdGlvbnMuXG4gICAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmIChjYWxsYWJsZSAmJiAhaW5kZXhhYmxlKSB7XG4gICAgICAgIC8vIEEgZnVuY3Rpb24gdHlwZS5cbiAgICAgICAgY29uc3Qgc2lncyA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0U2lnbmF0dXJlc09mVHlwZSh0eXBlLCB0cy5TaWduYXR1cmVLaW5kLkNhbGwpO1xuICAgICAgICBpZiAoc2lncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zaWduYXR1cmVUb0Nsb3N1cmUoc2lnc1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaW5kZXhhYmxlICYmICFjYWxsYWJsZSkge1xuICAgICAgICAvLyBBIHBsYWluIGtleS12YWx1ZSBtYXAgdHlwZS5cbiAgICAgICAgbGV0IGtleVR5cGUgPSAnc3RyaW5nJztcbiAgICAgICAgbGV0IHZhbFR5cGUgPSB0aGlzLnR5cGVDaGVja2VyLmdldEluZGV4VHlwZU9mVHlwZSh0eXBlLCB0cy5JbmRleEtpbmQuU3RyaW5nKTtcbiAgICAgICAgaWYgKCF2YWxUeXBlKSB7XG4gICAgICAgICAga2V5VHlwZSA9ICdudW1iZXInO1xuICAgICAgICAgIHZhbFR5cGUgPSB0aGlzLnR5cGVDaGVja2VyLmdldEluZGV4VHlwZU9mVHlwZSh0eXBlLCB0cy5JbmRleEtpbmQuTnVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbFR5cGUpIHtcbiAgICAgICAgICB0aGlzLndhcm4oJ3Vua25vd24gaW5kZXgga2V5IHR5cGUnKTtcbiAgICAgICAgICByZXR1cm4gYCFPYmplY3Q8Pyw/PmA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGAhT2JqZWN0PCR7a2V5VHlwZX0sJHt0aGlzLnRyYW5zbGF0ZSh2YWxUeXBlKX0+YDtcbiAgICAgIH0gZWxzZSBpZiAoIWNhbGxhYmxlICYmICFpbmRleGFibGUpIHtcbiAgICAgICAgLy8gU3BlY2lhbC1jYXNlIHRoZSBlbXB0eSBvYmplY3Qge30gYmVjYXVzZSBDbG9zdXJlIGRvZXNuJ3QgbGlrZSBpdC5cbiAgICAgICAgLy8gVE9ETyhldmFubSk6IHJldmlzaXQgdGhpcyBpZiBpdCBpcyBhIHByb2JsZW0uXG4gICAgICAgIHJldHVybiAnIU9iamVjdCc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFjYWxsYWJsZSAmJiAhaW5kZXhhYmxlKSB7XG4gICAgICAvLyBOb3QgY2FsbGFibGUsIG5vdCBpbmRleGFibGU7IGltcGxpZXMgYSBwbGFpbiBvYmplY3Qgd2l0aCBmaWVsZHMgaW4gaXQuXG4gICAgICByZXR1cm4gYHske2ZpZWxkcy5qb2luKCcsICcpfX1gO1xuICAgIH1cblxuICAgIHRoaXMud2FybigndW5oYW5kbGVkIHR5cGUgbGl0ZXJhbCcpO1xuICAgIHJldHVybiAnPyc7XG4gIH1cblxuICAvKiogQ29udmVydHMgYSB0cy5TaWduYXR1cmUgKGZ1bmN0aW9uIHNpZ25hdHVyZSkgdG8gYSBDbG9zdXJlIGZ1bmN0aW9uIHR5cGUuICovXG4gIHByaXZhdGUgc2lnbmF0dXJlVG9DbG9zdXJlKHNpZzogdHMuU2lnbmF0dXJlKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IENvbnNpZGVyIGhhcm1vbml6aW5nIHNvbWUgb3ZlcmxhcCB3aXRoIGVtaXRGdW5jdGlvblR5cGUgaW4gdHNpY2tsZS50cy5cblxuICAgIHRoaXMuYmxhY2tsaXN0VHlwZVBhcmFtZXRlcnModGhpcy5zeW1ib2xzVG9BbGlhc2VkTmFtZXMsIHNpZy5kZWNsYXJhdGlvbi50eXBlUGFyYW1ldGVycyk7XG5cbiAgICBsZXQgdHlwZVN0ciA9IGBmdW5jdGlvbihgO1xuXG4gICAgbGV0IHBhcmFtRGVjbHM6IFJlYWRvbmx5QXJyYXk8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24+ID0gc2lnLmRlY2xhcmF0aW9uLnBhcmFtZXRlcnM7XG4gICAgY29uc3QgbWF5YmVUaGlzUGFyYW0gPSBwYXJhbURlY2xzWzBdO1xuICAgIC8vIE9kZGx5LCB0aGUgdGhpcyB0eXBlIHNob3dzIHVwIGluIHBhcmFtRGVjbHMsIGJ1dCBub3QgaW4gdGhlIHR5cGUncyBwYXJhbWV0ZXJzLlxuICAgIC8vIEhhbmRsZSBpdCBoZXJlIGFuZCB0aGVuIHBhc3MgcGFyYW1EZWNscyBkb3duIHdpdGhvdXQgaXRzIGZpcnN0IGVsZW1lbnQuXG4gICAgaWYgKG1heWJlVGhpc1BhcmFtICYmIG1heWJlVGhpc1BhcmFtLm5hbWUuZ2V0VGV4dCgpID09PSAndGhpcycpIHtcbiAgICAgIGlmIChtYXliZVRoaXNQYXJhbS50eXBlKSB7XG4gICAgICAgIGNvbnN0IHRoaXNUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihtYXliZVRoaXNQYXJhbS50eXBlKTtcbiAgICAgICAgdHlwZVN0ciArPSBgdGhpczogKCR7dGhpcy50cmFuc2xhdGUodGhpc1R5cGUpfSksIGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhcm4oJ3RoaXMgdHlwZSB3aXRob3V0IHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIHBhcmFtRGVjbHMgPSBwYXJhbURlY2xzLnNsaWNlKDEpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuY29udmVydFBhcmFtcyhzaWcsIHBhcmFtRGVjbHMpO1xuICAgIHR5cGVTdHIgKz0gYCR7cGFyYW1zLmpvaW4oJywgJyl9KWA7XG5cbiAgICBjb25zdCByZXRUeXBlID0gdGhpcy50cmFuc2xhdGUodGhpcy50eXBlQ2hlY2tlci5nZXRSZXR1cm5UeXBlT2ZTaWduYXR1cmUoc2lnKSk7XG4gICAgaWYgKHJldFR5cGUpIHtcbiAgICAgIHR5cGVTdHIgKz0gYDogJHtyZXRUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGVTdHI7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgcGFyYW1ldGVycyBmb3IgdGhlIGdpdmVuIHNpZ25hdHVyZS4gVGFrZXMgcGFyYW1ldGVyIGRlY2xhcmF0aW9ucyBhcyB0aG9zZSBtaWdodCBub3RcbiAgICogbWF0Y2ggdGhlIHNpZ25hdHVyZSBwYXJhbWV0ZXJzIChlLmcuIHRoZXJlIG1pZ2h0IGJlIGFuIGFkZGl0aW9uYWwgdGhpcyBwYXJhbWV0ZXIpLiBUaGlzXG4gICAqIGRpZmZlcmVuY2UgaXMgaGFuZGxlZCBieSB0aGUgY2FsbGVyLCBhcyBpcyBjb252ZXJ0aW5nIHRoZSBcInRoaXNcIiBwYXJhbWV0ZXIuXG4gICAqL1xuICBwcml2YXRlIGNvbnZlcnRQYXJhbXMoc2lnOiB0cy5TaWduYXR1cmUsIHBhcmFtRGVjbHM6IFJlYWRvbmx5QXJyYXk8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24+KTpcbiAgICAgIHN0cmluZ1tdIHtcbiAgICBjb25zdCBwYXJhbVR5cGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIFRoZSBTaWduYXR1cmUgaXRzZWxmIGRvZXMgbm90IGluY2x1ZGUgaW5mb3JtYXRpb24gb24gb3B0aW9uYWwgYW5kIHZhciBhcmcgcGFyYW1ldGVycy5cbiAgICAvLyBVc2UgaXRzIGRlY2xhcmF0aW9uIHRvIHJlY292ZXIgdGhhdCBpbmZvcm1hdGlvbi5cbiAgICBjb25zdCBkZWNsID0gc2lnLmRlY2xhcmF0aW9uO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2lnLnBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcmFtID0gc2lnLnBhcmFtZXRlcnNbaV07XG5cbiAgICAgIGNvbnN0IHBhcmFtRGVjbCA9IHBhcmFtRGVjbHNbaV07XG4gICAgICBjb25zdCBvcHRpb25hbCA9ICEhcGFyYW1EZWNsLnF1ZXN0aW9uVG9rZW47XG4gICAgICBjb25zdCB2YXJBcmdzID0gISFwYXJhbURlY2wuZG90RG90RG90VG9rZW47XG4gICAgICBsZXQgcGFyYW1UeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlT2ZTeW1ib2xBdExvY2F0aW9uKHBhcmFtLCB0aGlzLm5vZGUpO1xuICAgICAgaWYgKHZhckFyZ3MpIHtcbiAgICAgICAgY29uc3QgdHlwZVJlZiA9IHBhcmFtVHlwZSBhcyB0cy5UeXBlUmVmZXJlbmNlO1xuICAgICAgICBwYXJhbVR5cGUgPSB0eXBlUmVmLnR5cGVBcmd1bWVudHMhWzBdO1xuICAgICAgfVxuICAgICAgbGV0IHR5cGVTdHIgPSB0aGlzLnRyYW5zbGF0ZShwYXJhbVR5cGUpO1xuICAgICAgaWYgKHZhckFyZ3MpIHR5cGVTdHIgPSAnLi4uJyArIHR5cGVTdHI7XG4gICAgICBpZiAob3B0aW9uYWwpIHR5cGVTdHIgPSB0eXBlU3RyICsgJz0nO1xuICAgICAgcGFyYW1UeXBlcy5wdXNoKHR5cGVTdHIpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1UeXBlcztcbiAgfVxuXG4gIHdhcm4obXNnOiBzdHJpbmcpIHtcbiAgICAvLyBCeSBkZWZhdWx0LCB3YXJuKCkgZG9lcyBub3RoaW5nLiAgVGhlIGNhbGxlciB3aWxsIG92ZXJ3cml0ZSB0aGlzXG4gICAgLy8gaWYgaXQgd2FudHMgZGlmZmVyZW50IGJlaGF2aW9yLlxuICB9XG5cbiAgLyoqIEByZXR1cm4gdHJ1ZSBpZiBzeW0gc2hvdWxkIGFsd2F5cyBoYXZlIHR5cGUgez99LiAqL1xuICBpc0JsYWNrTGlzdGVkKHN5bWJvbDogdHMuU3ltYm9sKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucGF0aEJsYWNrTGlzdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgcGF0aEJsYWNrTGlzdCA9IHRoaXMucGF0aEJsYWNrTGlzdDtcbiAgICAvLyBTb21lIGJ1aWx0aW4gdHlwZXMsIHN1Y2ggYXMge30sIGdldCByZXByZXNlbnRlZCBieSBhIHN5bWJvbCB0aGF0IGhhcyBubyBkZWNsYXJhdGlvbnMuXG4gICAgaWYgKHN5bWJvbC5kZWNsYXJhdGlvbnMgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBzeW1ib2wuZGVjbGFyYXRpb25zLmV2ZXJ5KG4gPT4ge1xuICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLm5vcm1hbGl6ZShuLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XG4gICAgICByZXR1cm4gcGF0aEJsYWNrTGlzdC5oYXMoZmlsZU5hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3N1cmUgZG9lc24gbm90IHN1cHBvcnQgdHlwZSBwYXJhbWV0ZXJzIGZvciBmdW5jdGlvbiB0eXBlcywgaS5lLiBnZW5lcmljIGZ1bmN0aW9uIHR5cGVzLlxuICAgKiBCbGFja2xpc3QgdGhlIHN5bWJvbHMgZGVjbGFyZWQgYnkgdGhlbSBhbmQgZW1pdCBhID8gZm9yIHRoZSB0eXBlcy5cbiAgICpcbiAgICogVGhpcyBtdXRhdGVzIHRoZSBnaXZlbiBibGFja2xpc3QgbWFwLiBUaGUgbWFwJ3Mgc2NvcGUgaXMgb25lIGZpbGUsIGFuZCBzeW1ib2xzIGFyZVxuICAgKiB1bmlxdWUgb2JqZWN0cywgc28gdGhpcyBzaG91bGQgbmVpdGhlciBsZWFkIHRvIGV4Y2Vzc2l2ZSBtZW1vcnkgY29uc3VtcHRpb24gbm9yIGludHJvZHVjZVxuICAgKiBlcnJvcnMuXG4gICAqXG4gICAqIEBwYXJhbSBibGFja2xpc3QgYSBtYXAgdG8gc3RvcmUgdGhlIGJsYWNrbGlzdGVkIHN5bWJvbHMgaW4sIHdpdGggYSB2YWx1ZSBvZiAnPycuIEluIHByYWN0aWNlLFxuICAgKiAgICAgdGhpcyBpcyBhbHdheXMgPT09IHRoaXMuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLCBidXQgd2UncmUgcGFzc2luZyBpdCBleHBsaWNpdGx5IHRvIG1ha2UgaXRcbiAgICogICAgY2xlYXIgdGhhdCB0aGUgbWFwIGlzIG11dGF0ZWQgKGluIHBhcnRpY3VsYXIgd2hlbiB1c2VkIGZyb20gb3V0c2lkZSB0aGUgY2xhc3MpLlxuICAgKiBAcGFyYW0gZGVjbHMgdGhlIGRlY2xhcmF0aW9ucyB3aG9zZSBzeW1ib2xzIHNob3VsZCBiZSBibGFja2xpc3RlZC5cbiAgICovXG4gIGJsYWNrbGlzdFR5cGVQYXJhbWV0ZXJzKFxuICAgICAgYmxhY2tsaXN0OiBNYXA8dHMuU3ltYm9sLCBzdHJpbmc+LFxuICAgICAgZGVjbHM6IHRzLk5vZGVBcnJheTx0cy5UeXBlUGFyYW1ldGVyRGVjbGFyYXRpb24+fHVuZGVmaW5lZCkge1xuICAgIGlmICghZGVjbHMgfHwgIWRlY2xzLmxlbmd0aCkgcmV0dXJuO1xuICAgIGZvciAoY29uc3QgdHBkIG9mIGRlY2xzKSB7XG4gICAgICBjb25zdCBzeW0gPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24odHBkLm5hbWUpO1xuICAgICAgaWYgKCFzeW0pIHtcbiAgICAgICAgdGhpcy53YXJuKGB0eXBlIHBhcmFtZXRlciB3aXRoIG5vIHN5bWJvbGApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLnNldChzeW0sICc/Jyk7XG4gICAgfVxuICB9XG59XG4iXX0=