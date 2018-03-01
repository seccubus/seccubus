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
        define("tsickle/src/class_decorator_downlevel_transformer", ["require", "exports", "tsickle/src/decorator-annotator", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var decorator_annotator_1 = require("tsickle/src/decorator-annotator");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * Creates the AST for the decorator field type annotation, which has the form
     * { type: Function, args?: any[] }[]
     */
    function createClassDecoratorType() {
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
        return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
    }
    /**
     * Extracts the type of the decorator, as well as all the arguments passed to
     * the decorator.  Returns an AST with the form
     * { type: decorator, args: [arg1, arg2] }
     */
    function extractMetadataFromSingleDecorator(decorator, diagnostics) {
        var metadataProperties = [];
        var expr = decorator.expression;
        switch (expr.kind) {
            case ts.SyntaxKind.Identifier:
                // The decorator was a plain @Foo.
                metadataProperties.push(ts.createPropertyAssignment('type', expr));
                break;
            case ts.SyntaxKind.CallExpression:
                // The decorator was a call, like @Foo(bar).
                var call = expr;
                metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
                if (call.arguments.length) {
                    var args = [];
                    try {
                        for (var _a = __values(call.arguments), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var arg = _b.value;
                            args.push(arg);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var argsArrayLiteral = ts.createArrayLiteral(args);
                    argsArrayLiteral.elements.hasTrailingComma = true;
                    metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
                }
                break;
            default:
                diagnostics.push({
                    file: decorator.getSourceFile(),
                    start: decorator.getStart(),
                    length: decorator.getEnd() - decorator.getStart(),
                    messageText: ts.SyntaxKind[decorator.kind] + " not implemented in gathering decorator metadata",
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                });
                break;
        }
        return ts.createObjectLiteral(metadataProperties);
        var e_1, _c;
    }
    /**
     * Takes a list of decorator metadata object ASTs and produces an AST for a
     * static class property of an array of those metadata objects.
     */
    function createDecoratorClassProperty(decoratorList) {
        var modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
        var type = createClassDecoratorType();
        var initializer = ts.createArrayLiteral(decoratorList, true);
        initializer.elements.hasTrailingComma = true;
        return ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
    }
    function isNameEqual(classMember, name) {
        if (classMember.name === undefined) {
            return false;
        }
        var id = classMember.name;
        return id.text === name;
    }
    /**
     * Inserts the decorator metadata property in the place that the old
     * decorator-annotator visitor would put it, so the unit tests don't have to
     * change.
     * TODO(lucassloan): remove this when all 3 properties are put in via
     * transformers
     */
    function insertBeforeDecoratorProperties(classMembers, decoratorMetadata) {
        var insertionPoint = classMembers.findIndex(function (m) { return isNameEqual(m, 'ctorParameters') || isNameEqual(m, 'propDecorators'); });
        if (insertionPoint === -1) {
            insertionPoint = classMembers.length - 1;
        }
        var members = __spread(classMembers.slice(0, insertionPoint), [
            decoratorMetadata
        ], classMembers.slice(insertionPoint));
        return ts.setTextRange(ts.createNodeArray(members, classMembers.hasTrailingComma), classMembers);
    }
    function classDecoratorDownlevelTransformer(typeChecker, diagnostics) {
        return function (context) {
            var visitor = function (node) {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration:
                        var cd = transformer_util_1.visitEachChild(node, visitor, context);
                        var decorators = cd.decorators;
                        if (decorators === undefined || decorators.length === 0)
                            return cd;
                        var decoratorList = [];
                        var decoratorsToKeep = [];
                        try {
                            for (var decorators_1 = __values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                                var decorator = decorators_1_1.value;
                                if (decorator_annotator_1.shouldLower(decorator, typeChecker)) {
                                    decoratorList.push(extractMetadataFromSingleDecorator(decorator, diagnostics));
                                }
                                else {
                                    decoratorsToKeep.push(decorator);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (decorators_1_1 && !decorators_1_1.done && (_a = decorators_1.return)) _a.call(decorators_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        if (decoratorList.length === 0)
                            return cd;
                        var newClassDeclaration = ts.getMutableClone(cd);
                        newClassDeclaration.members = insertBeforeDecoratorProperties(newClassDeclaration.members, createDecoratorClassProperty(decoratorList));
                        newClassDeclaration.decorators =
                            decoratorsToKeep.length ? ts.createNodeArray(decoratorsToKeep) : undefined;
                        return newClassDeclaration;
                    default:
                        return transformer_util_1.visitEachChild(node, visitor, context);
                }
                var e_2, _a;
            };
            return function (sf) { return visitor(sf); };
        };
    }
    exports.classDecoratorDownlevelTransformer = classDecoratorDownlevelTransformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfZGVjb3JhdG9yX2Rvd25sZXZlbF90cmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGFzc19kZWNvcmF0b3JfZG93bmxldmVsX3RyYW5zZm9ybWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsdUVBQWtEO0lBQ2xELGlFQUFrRDtJQUNsRCwyQ0FBbUM7SUFFbkM7OztPQUdHO0lBQ0g7UUFDRSxJQUFNLFlBQVksR0FBcUIsRUFBRSxDQUFDO1FBQzFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUN4QyxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFDNUIsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUN4QyxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFDOUQsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM1RixNQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsNENBQTRDLFNBQXVCLEVBQUUsV0FBNEI7UUFDL0YsSUFBTSxrQkFBa0IsR0FBa0MsRUFBRSxDQUFDO1FBQzdELElBQU0sSUFB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SUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbEQsQ0FBQzs7WUFDSCxDQUFDLENBQUM7WUFFRixNQUFNLENBQUMsVUFBQyxFQUFpQixJQUFLLE9BQUEsT0FBTyxDQUFDLEVBQUUsQ0FBa0IsRUFBNUIsQ0FBNEIsQ0FBQztRQUM3RCxDQUFDLENBQUM7SUFDSixDQUFDO0lBeENELGdGQXdDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzaG91bGRMb3dlcn0gZnJvbSAnLi9kZWNvcmF0b3ItYW5ub3RhdG9yJztcbmltcG9ydCB7dmlzaXRFYWNoQ2hpbGR9IGZyb20gJy4vdHJhbnNmb3JtZXJfdXRpbCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIEFTVCBmb3IgdGhlIGRlY29yYXRvciBmaWVsZCB0eXBlIGFubm90YXRpb24sIHdoaWNoIGhhcyB0aGUgZm9ybVxuICogeyB0eXBlOiBGdW5jdGlvbiwgYXJncz86IGFueVtdIH1bXVxuICovXG5mdW5jdGlvbiBjcmVhdGVDbGFzc0RlY29yYXRvclR5cGUoKSB7XG4gIGNvbnN0IHR5cGVFbGVtZW50czogdHMuVHlwZUVsZW1lbnRbXSA9IFtdO1xuICB0eXBlRWxlbWVudHMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgJ3R5cGUnLCB1bmRlZmluZWQsXG4gICAgICB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSh0cy5jcmVhdGVJZGVudGlmaWVyKCdGdW5jdGlvbicpLCB1bmRlZmluZWQpLCB1bmRlZmluZWQpKTtcbiAgdHlwZUVsZW1lbnRzLnB1c2godHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICB1bmRlZmluZWQsICdhcmdzJywgdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5RdWVzdGlvblRva2VuKSxcbiAgICAgIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUodHMuY3JlYXRlS2V5d29yZFR5cGVOb2RlKHRzLlN5bnRheEtpbmQuQW55S2V5d29yZCkpLCB1bmRlZmluZWQpKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUodHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKHR5cGVFbGVtZW50cykpO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSB0eXBlIG9mIHRoZSBkZWNvcmF0b3IsIGFzIHdlbGwgYXMgYWxsIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvXG4gKiB0aGUgZGVjb3JhdG9yLiAgUmV0dXJucyBhbiBBU1Qgd2l0aCB0aGUgZm9ybVxuICogeyB0eXBlOiBkZWNvcmF0b3IsIGFyZ3M6IFthcmcxLCBhcmcyXSB9XG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RNZXRhZGF0YUZyb21TaW5nbGVEZWNvcmF0b3IoZGVjb3JhdG9yOiB0cy5EZWNvcmF0b3IsIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10pIHtcbiAgY29uc3QgbWV0YWRhdGFQcm9wZXJ0aWVzOiB0cy5PYmplY3RMaXRlcmFsRWxlbWVudExpa2VbXSA9IFtdO1xuICBjb25zdCBleHByID0gZGVjb3JhdG9yLmV4cHJlc3Npb247XG4gIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAvLyBUaGUgZGVjb3JhdG9yIHdhcyBhIHBsYWluIEBGb28uXG4gICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3R5cGUnLCBleHByKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb246XG4gICAgICAvLyBUaGUgZGVjb3JhdG9yIHdhcyBhIGNhbGwsIGxpa2UgQEZvbyhiYXIpLlxuICAgICAgY29uc3QgY2FsbCA9IGV4cHIgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3R5cGUnLCBjYWxsLmV4cHJlc3Npb24pKTtcbiAgICAgIGlmIChjYWxsLmFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYXJnczogdHMuRXhwcmVzc2lvbltdID0gW107XG4gICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGNhbGwuYXJndW1lbnRzKSB7XG4gICAgICAgICAgYXJncy5wdXNoKGFyZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXJnc0FycmF5TGl0ZXJhbCA9IHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChhcmdzKTtcbiAgICAgICAgYXJnc0FycmF5TGl0ZXJhbC5lbGVtZW50cy5oYXNUcmFpbGluZ0NvbW1hID0gdHJ1ZTtcbiAgICAgICAgbWV0YWRhdGFQcm9wZXJ0aWVzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCdhcmdzJywgYXJnc0FycmF5TGl0ZXJhbCkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goe1xuICAgICAgICBmaWxlOiBkZWNvcmF0b3IuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgICBzdGFydDogZGVjb3JhdG9yLmdldFN0YXJ0KCksXG4gICAgICAgIGxlbmd0aDogZGVjb3JhdG9yLmdldEVuZCgpIC0gZGVjb3JhdG9yLmdldFN0YXJ0KCksXG4gICAgICAgIG1lc3NhZ2VUZXh0OlxuICAgICAgICAgICAgYCR7dHMuU3ludGF4S2luZFtkZWNvcmF0b3Iua2luZF19IG5vdCBpbXBsZW1lbnRlZCBpbiBnYXRoZXJpbmcgZGVjb3JhdG9yIG1ldGFkYXRhYCxcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgY29kZTogMCxcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwobWV0YWRhdGFQcm9wZXJ0aWVzKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhIGxpc3Qgb2YgZGVjb3JhdG9yIG1ldGFkYXRhIG9iamVjdCBBU1RzIGFuZCBwcm9kdWNlcyBhbiBBU1QgZm9yIGFcbiAqIHN0YXRpYyBjbGFzcyBwcm9wZXJ0eSBvZiBhbiBhcnJheSBvZiB0aG9zZSBtZXRhZGF0YSBvYmplY3RzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVEZWNvcmF0b3JDbGFzc1Byb3BlcnR5KGRlY29yYXRvckxpc3Q6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uW10pIHtcbiAgY29uc3QgbW9kaWZpZXIgPSB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpO1xuICBjb25zdCB0eXBlID0gY3JlYXRlQ2xhc3NEZWNvcmF0b3JUeXBlKCk7XG4gIGNvbnN0IGluaXRpYWxpemVyID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGRlY29yYXRvckxpc3QsIHRydWUpO1xuICBpbml0aWFsaXplci5lbGVtZW50cy5oYXNUcmFpbGluZ0NvbW1hID0gdHJ1ZTtcbiAgcmV0dXJuIHRzLmNyZWF0ZVByb3BlcnR5KHVuZGVmaW5lZCwgW21vZGlmaWVyXSwgJ2RlY29yYXRvcnMnLCB1bmRlZmluZWQsIHR5cGUsIGluaXRpYWxpemVyKTtcbn1cblxuZnVuY3Rpb24gaXNOYW1lRXF1YWwoY2xhc3NNZW1iZXI6IHRzLkNsYXNzRWxlbWVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChjbGFzc01lbWJlci5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgaWQgPSBjbGFzc01lbWJlci5uYW1lIGFzIHRzLklkZW50aWZpZXI7XG4gIHJldHVybiBpZC50ZXh0ID09PSBuYW1lO1xufVxuXG4vKipcbiAqIEluc2VydHMgdGhlIGRlY29yYXRvciBtZXRhZGF0YSBwcm9wZXJ0eSBpbiB0aGUgcGxhY2UgdGhhdCB0aGUgb2xkXG4gKiBkZWNvcmF0b3ItYW5ub3RhdG9yIHZpc2l0b3Igd291bGQgcHV0IGl0LCBzbyB0aGUgdW5pdCB0ZXN0cyBkb24ndCBoYXZlIHRvXG4gKiBjaGFuZ2UuXG4gKiBUT0RPKGx1Y2Fzc2xvYW4pOiByZW1vdmUgdGhpcyB3aGVuIGFsbCAzIHByb3BlcnRpZXMgYXJlIHB1dCBpbiB2aWFcbiAqIHRyYW5zZm9ybWVyc1xuICovXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmVEZWNvcmF0b3JQcm9wZXJ0aWVzKFxuICAgIGNsYXNzTWVtYmVyczogdHMuTm9kZUFycmF5PHRzLkNsYXNzRWxlbWVudD4sXG4gICAgZGVjb3JhdG9yTWV0YWRhdGE6IHRzLlByb3BlcnR5RGVjbGFyYXRpb24pOiB0cy5Ob2RlQXJyYXk8dHMuQ2xhc3NFbGVtZW50PiB7XG4gIGxldCBpbnNlcnRpb25Qb2ludCA9IGNsYXNzTWVtYmVycy5maW5kSW5kZXgoXG4gICAgICBtID0+IGlzTmFtZUVxdWFsKG0sICdjdG9yUGFyYW1ldGVycycpIHx8IGlzTmFtZUVxdWFsKG0sICdwcm9wRGVjb3JhdG9ycycpKTtcbiAgaWYgKGluc2VydGlvblBvaW50ID09PSAtMSkge1xuICAgIGluc2VydGlvblBvaW50ID0gY2xhc3NNZW1iZXJzLmxlbmd0aCAtIDE7XG4gIH1cbiAgY29uc3QgbWVtYmVycyA9IFtcbiAgICAuLi5jbGFzc01lbWJlcnMuc2xpY2UoMCwgaW5zZXJ0aW9uUG9pbnQpLCBkZWNvcmF0b3JNZXRhZGF0YSxcbiAgICAuLi5jbGFzc01lbWJlcnMuc2xpY2UoaW5zZXJ0aW9uUG9pbnQpXG4gIF07XG4gIHJldHVybiB0cy5zZXRUZXh0UmFuZ2UodHMuY3JlYXRlTm9kZUFycmF5KG1lbWJlcnMsIGNsYXNzTWVtYmVycy5oYXNUcmFpbGluZ0NvbW1hKSwgY2xhc3NNZW1iZXJzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzRGVjb3JhdG9yRG93bmxldmVsVHJhbnNmb3JtZXIoXG4gICAgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdKTpcbiAgICAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB0cy5UcmFuc2Zvcm1lcjx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB7XG4gICAgY29uc3QgdmlzaXRvcjogdHMuVmlzaXRvciA9IChub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSA9PiB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjb25zdCBjZCA9IHZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IGNkLmRlY29yYXRvcnM7XG5cbiAgICAgICAgICBpZiAoZGVjb3JhdG9ycyA9PT0gdW5kZWZpbmVkIHx8IGRlY29yYXRvcnMubGVuZ3RoID09PSAwKSByZXR1cm4gY2Q7XG5cbiAgICAgICAgICBjb25zdCBkZWNvcmF0b3JMaXN0ID0gW107XG4gICAgICAgICAgY29uc3QgZGVjb3JhdG9yc1RvS2VlcDogdHMuRGVjb3JhdG9yW10gPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGRlY29yYXRvciBvZiBkZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICBpZiAoc2hvdWxkTG93ZXIoZGVjb3JhdG9yLCB0eXBlQ2hlY2tlcikpIHtcbiAgICAgICAgICAgICAgZGVjb3JhdG9yTGlzdC5wdXNoKGV4dHJhY3RNZXRhZGF0YUZyb21TaW5nbGVEZWNvcmF0b3IoZGVjb3JhdG9yLCBkaWFnbm9zdGljcykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVjb3JhdG9yc1RvS2VlcC5wdXNoKGRlY29yYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGRlY29yYXRvckxpc3QubGVuZ3RoID09PSAwKSByZXR1cm4gY2Q7XG5cbiAgICAgICAgICBjb25zdCBuZXdDbGFzc0RlY2xhcmF0aW9uID0gdHMuZ2V0TXV0YWJsZUNsb25lKGNkKTtcblxuICAgICAgICAgIG5ld0NsYXNzRGVjbGFyYXRpb24ubWVtYmVycyA9IGluc2VydEJlZm9yZURlY29yYXRvclByb3BlcnRpZXMoXG4gICAgICAgICAgICAgIG5ld0NsYXNzRGVjbGFyYXRpb24ubWVtYmVycywgY3JlYXRlRGVjb3JhdG9yQ2xhc3NQcm9wZXJ0eShkZWNvcmF0b3JMaXN0KSk7XG5cbiAgICAgICAgICBuZXdDbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMgPVxuICAgICAgICAgICAgICBkZWNvcmF0b3JzVG9LZWVwLmxlbmd0aCA/IHRzLmNyZWF0ZU5vZGVBcnJheShkZWNvcmF0b3JzVG9LZWVwKSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHJldHVybiBuZXdDbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiB2aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIChzZjogdHMuU291cmNlRmlsZSkgPT4gdmlzaXRvcihzZikgYXMgdHMuU291cmNlRmlsZTtcbiAgfTtcbn0iXX0=