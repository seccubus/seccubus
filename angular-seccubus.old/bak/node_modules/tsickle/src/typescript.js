/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview Abstraction over the TypeScript API that makes multiple
 * versions of TypeScript appear to be interoperable. Any time a breaking change
 * in TypeScript affects Tsickle code, we should extend this shim to present an
 * unbroken API.
 * All code in tsickle should import from this location, not from 'typescript'.
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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/typescript", ["require", "exports", "typescript", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:no-any We need to do various unsafe casts between TS versions
    var ts = require("typescript");
    var typescript_1 = require("typescript");
    exports.addSyntheticTrailingComment = typescript_1.addSyntheticTrailingComment;
    exports.createArrayLiteral = typescript_1.createArrayLiteral;
    exports.createArrayTypeNode = typescript_1.createArrayTypeNode;
    exports.createCompilerHost = typescript_1.createCompilerHost;
    exports.createIdentifier = typescript_1.createIdentifier;
    exports.createKeywordTypeNode = typescript_1.createKeywordTypeNode;
    exports.createNodeArray = typescript_1.createNodeArray;
    exports.createNotEmittedStatement = typescript_1.createNotEmittedStatement;
    exports.createObjectLiteral = typescript_1.createObjectLiteral;
    exports.createProgram = typescript_1.createProgram;
    exports.createProperty = typescript_1.createProperty;
    exports.createPropertyAssignment = typescript_1.createPropertyAssignment;
    exports.createPropertySignature = typescript_1.createPropertySignature;
    exports.createSourceFile = typescript_1.createSourceFile;
    exports.createToken = typescript_1.createToken;
    exports.createTypeLiteralNode = typescript_1.createTypeLiteralNode;
    exports.createTypeReferenceNode = typescript_1.createTypeReferenceNode;
    exports.DiagnosticCategory = typescript_1.DiagnosticCategory;
    exports.EmitFlags = typescript_1.EmitFlags;
    exports.flattenDiagnosticMessageText = typescript_1.flattenDiagnosticMessageText;
    exports.forEachChild = typescript_1.forEachChild;
    exports.getCombinedModifierFlags = typescript_1.getCombinedModifierFlags;
    exports.getLeadingCommentRanges = typescript_1.getLeadingCommentRanges;
    exports.getLineAndCharacterOfPosition = typescript_1.getLineAndCharacterOfPosition;
    exports.getMutableClone = typescript_1.getMutableClone;
    exports.getOriginalNode = typescript_1.getOriginalNode;
    exports.getPreEmitDiagnostics = typescript_1.getPreEmitDiagnostics;
    exports.getSyntheticLeadingComments = typescript_1.getSyntheticLeadingComments;
    exports.getSyntheticTrailingComments = typescript_1.getSyntheticTrailingComments;
    exports.getTrailingCommentRanges = typescript_1.getTrailingCommentRanges;
    exports.isExportDeclaration = typescript_1.isExportDeclaration;
    exports.isIdentifier = typescript_1.isIdentifier;
    exports.ModifierFlags = typescript_1.ModifierFlags;
    exports.ModuleKind = typescript_1.ModuleKind;
    exports.NodeFlags = typescript_1.NodeFlags;
    exports.parseCommandLine = typescript_1.parseCommandLine;
    exports.parseJsonConfigFileContent = typescript_1.parseJsonConfigFileContent;
    exports.readConfigFile = typescript_1.readConfigFile;
    exports.resolveModuleName = typescript_1.resolveModuleName;
    exports.ScriptTarget = typescript_1.ScriptTarget;
    exports.setEmitFlags = typescript_1.setEmitFlags;
    exports.setOriginalNode = typescript_1.setOriginalNode;
    exports.setSourceMapRange = typescript_1.setSourceMapRange;
    exports.setSyntheticLeadingComments = typescript_1.setSyntheticLeadingComments;
    exports.setSyntheticTrailingComments = typescript_1.setSyntheticTrailingComments;
    exports.setTextRange = typescript_1.setTextRange;
    exports.SymbolFlags = typescript_1.SymbolFlags;
    exports.SyntaxKind = typescript_1.SyntaxKind;
    exports.sys = typescript_1.sys;
    exports.TypeFlags = typescript_1.TypeFlags;
    exports.updateBlock = typescript_1.updateBlock;
    exports.visitEachChild = typescript_1.visitEachChild;
    exports.visitLexicalEnvironment = typescript_1.visitLexicalEnvironment;
    // getEmitFlags is now private starting in TS 2.5.
    // So we define our own method that calls through to TypeScript to defeat the
    // visibility constraint.
    function getEmitFlags(node) {
        return ts.getEmitFlags(node);
    }
    exports.getEmitFlags = getEmitFlags;
    // Between TypeScript 2.4 and 2.5 updateProperty was modified. If called with 2.4 re-order the
    // parameters.
    exports.updateProperty = ts.updateProperty;
    var _a = __read(ts.version.split('.'), 2), major = _a[0], minor = _a[1];
    if (major === '2' && minor === '4') {
        var updateProperty24_1 = ts.updateProperty;
        exports.updateProperty = function (node, decorators, modifiers, name, questionToken, type, initializer) {
            return updateProperty24_1(node, decorators, modifiers, name, type, initializer);
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNIOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILCtFQUErRTtJQUUvRSwrQkFBaUM7SUFLakMseUNBQTh5RTtJQUE1eEUsbURBQUEsMkJBQTJCLENBQUE7SUFBNEwsMENBQUEsa0JBQWtCLENBQUE7SUFBRSwyQ0FBQSxtQkFBbUIsQ0FBQTtJQUFFLDBDQUFBLGtCQUFrQixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLHVDQUFBLGVBQWUsQ0FBQTtJQUFFLGlEQUFBLHlCQUF5QixDQUFBO0lBQUUsMkNBQUEsbUJBQW1CLENBQUE7SUFBRSxxQ0FBQSxhQUFhLENBQUE7SUFBRSxzQ0FBQSxjQUFjLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSxtQ0FBQSxXQUFXLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQStHLDBDQUFBLGtCQUFrQixDQUFBO0lBQTJCLGlDQUFBLFNBQVMsQ0FBQTtJQUFnSCxvREFBQSw0QkFBNEIsQ0FBQTtJQUFFLG9DQUFBLFlBQVksQ0FBQTtJQUF3RSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUscURBQUEsNkJBQTZCLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLG1EQUFBLDJCQUEyQixDQUFBO0lBQUUsb0RBQUEsNEJBQTRCLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFpRywyQ0FBQSxtQkFBbUIsQ0FBQTtJQUFFLG9DQUFBLFlBQVksQ0FBQTtJQUFxQixxQ0FBQSxhQUFhLENBQUE7SUFBa0Msa0NBQUEsVUFBVSxDQUFBO0lBQXlFLGlDQUFBLFNBQVMsQ0FBQTtJQUFtSCx3Q0FBQSxnQkFBZ0IsQ0FBQTtJQUFFLGtEQUFBLDBCQUEwQixDQUFBO0lBQStHLHNDQUFBLGNBQWMsQ0FBQTtJQUFFLHlDQUFBLGlCQUFpQixDQUFBO0lBQUUsb0NBQUEsWUFBWSxDQUFBO0lBQTBCLG9DQUFBLFlBQVksQ0FBQTtJQUFFLHVDQUFBLGVBQWUsQ0FBQTtJQUFFLHlDQUFBLGlCQUFpQixDQUFBO0lBQUUsbURBQUEsMkJBQTJCLENBQUE7SUFBRSxvREFBQSw0QkFBNEIsQ0FBQTtJQUFFLG9DQUFBLFlBQVksQ0FBQTtJQUFzRSxtQ0FBQSxXQUFXLENBQUE7SUFBRSxrQ0FBQSxVQUFVLENBQUE7SUFBc0IsMkJBQUEsR0FBRyxDQUFBO0lBQXVILGlDQUFBLFNBQVMsQ0FBQTtJQUFzQyxtQ0FBQSxXQUFXLENBQUE7SUFBMEMsc0NBQUEsY0FBYyxDQUFBO0lBQUUsK0NBQUEsdUJBQXVCLENBQUE7SUFFOXZFLGtEQUFrRDtJQUNsRCw2RUFBNkU7SUFDN0UseUJBQXlCO0lBQ3pCLHNCQUE2QixJQUFhO1FBQ3hDLE1BQU0sQ0FBRSxFQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFGRCxvQ0FFQztJQUVELDhGQUE4RjtJQUM5RixjQUFjO0lBQ0gsUUFBQSxjQUFjLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQztJQUV4QyxJQUFBLHFDQUFzQyxFQUFyQyxhQUFLLEVBQUUsYUFBSyxDQUEwQjtJQUM3QyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQU0sa0JBQWdCLEdBQUcsRUFBRSxDQUFDLGNBQW1ELENBQUM7UUFDaEYsc0JBQWMsR0FBRyxVQUFDLElBQTRCLEVBQUUsVUFBaUQsRUFDL0UsU0FBK0MsRUFBRSxJQUE0QixFQUM3RSxhQUF5QyxFQUFFLElBQTJCLEVBQ3RFLFdBQW9DO1lBQ3BELE1BQU0sQ0FBQyxrQkFBZ0IsQ0FDWixJQUF1QyxFQUFFLFVBQXFDLEVBQzlFLFNBQWdCLEVBQUUsSUFBVyxFQUFFLElBQVcsRUFBRSxXQUFrQixDQUFRLENBQUM7UUFDcEYsQ0FBQyxDQUFDO0lBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBBYnN0cmFjdGlvbiBvdmVyIHRoZSBUeXBlU2NyaXB0IEFQSSB0aGF0IG1ha2VzIG11bHRpcGxlXG4gKiB2ZXJzaW9ucyBvZiBUeXBlU2NyaXB0IGFwcGVhciB0byBiZSBpbnRlcm9wZXJhYmxlLiBBbnkgdGltZSBhIGJyZWFraW5nIGNoYW5nZVxuICogaW4gVHlwZVNjcmlwdCBhZmZlY3RzIFRzaWNrbGUgY29kZSwgd2Ugc2hvdWxkIGV4dGVuZCB0aGlzIHNoaW0gdG8gcHJlc2VudCBhblxuICogdW5icm9rZW4gQVBJLlxuICogQWxsIGNvZGUgaW4gdHNpY2tsZSBzaG91bGQgaW1wb3J0IGZyb20gdGhpcyBsb2NhdGlvbiwgbm90IGZyb20gJ3R5cGVzY3JpcHQnLlxuICovXG5cbi8vIHRzbGludDpkaXNhYmxlOm5vLWFueSBXZSBuZWVkIHRvIGRvIHZhcmlvdXMgdW5zYWZlIGNhc3RzIGJldHdlZW4gVFMgdmVyc2lvbnNcblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbi8vIE5vdGUsIHRoaXMgaW1wb3J0IGRlcGVuZHMgb24gYSBnZW5ydWxlIGNvcHlpbmcgdGhlIC5kLnRzIGZpbGUgdG8gdGhpcyBwYWNrYWdlXG5pbXBvcnQgKiBhcyB0czI0IGZyb20gJy4vdHlwZXNjcmlwdC0yLjQnO1xuXG5leHBvcnQge19fU3RyaW5nLCBhZGRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnQsIEFzc2VydGlvbkV4cHJlc3Npb24sIEJsb2NrLCBDYWxsRXhwcmVzc2lvbiwgQ2FuY2VsbGF0aW9uVG9rZW4sIENsYXNzRGVjbGFyYXRpb24sIENsYXNzRWxlbWVudCwgQ2xhc3NMaWtlRGVjbGFyYXRpb24sIENvbW1lbnRSYW5nZSwgQ29tcGlsZXJIb3N0LCBDb21waWxlck9wdGlvbnMsIENvbnN0cnVjdG9yRGVjbGFyYXRpb24sIGNyZWF0ZUFycmF5TGl0ZXJhbCwgY3JlYXRlQXJyYXlUeXBlTm9kZSwgY3JlYXRlQ29tcGlsZXJIb3N0LCBjcmVhdGVJZGVudGlmaWVyLCBjcmVhdGVLZXl3b3JkVHlwZU5vZGUsIGNyZWF0ZU5vZGVBcnJheSwgY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudCwgY3JlYXRlT2JqZWN0TGl0ZXJhbCwgY3JlYXRlUHJvZ3JhbSwgY3JlYXRlUHJvcGVydHksIGNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCwgY3JlYXRlUHJvcGVydHlTaWduYXR1cmUsIGNyZWF0ZVNvdXJjZUZpbGUsIGNyZWF0ZVRva2VuLCBjcmVhdGVUeXBlTGl0ZXJhbE5vZGUsIGNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlLCBDdXN0b21UcmFuc2Zvcm1lcnMsIERlY2xhcmF0aW9uLCBEZWNsYXJhdGlvblN0YXRlbWVudCwgRGVjbGFyYXRpb25XaXRoVHlwZVBhcmFtZXRlcnMsIERlY29yYXRvciwgRGlhZ25vc3RpYywgRGlhZ25vc3RpY0NhdGVnb3J5LCBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiwgRW1pdEZsYWdzLCBFbWl0UmVzdWx0LCBFbnRpdHlOYW1lLCBFbnVtRGVjbGFyYXRpb24sIEV4cG9ydERlY2xhcmF0aW9uLCBFeHBvcnRTcGVjaWZpZXIsIEV4cHJlc3Npb24sIEV4cHJlc3Npb25TdGF0ZW1lbnQsIGZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZVRleHQsIGZvckVhY2hDaGlsZCwgRnVuY3Rpb25EZWNsYXJhdGlvbiwgRnVuY3Rpb25MaWtlRGVjbGFyYXRpb24sIEdldEFjY2Vzc29yRGVjbGFyYXRpb24sIGdldENvbWJpbmVkTW9kaWZpZXJGbGFncywgZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMsIGdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uLCBnZXRNdXRhYmxlQ2xvbmUsIGdldE9yaWdpbmFsTm9kZSwgZ2V0UHJlRW1pdERpYWdub3N0aWNzLCBnZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMsIGdldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMsIGdldFRyYWlsaW5nQ29tbWVudFJhbmdlcywgSWRlbnRpZmllciwgSW1wb3J0RGVjbGFyYXRpb24sIEltcG9ydEVxdWFsc0RlY2xhcmF0aW9uLCBJbXBvcnRTcGVjaWZpZXIsIEludGVyZmFjZURlY2xhcmF0aW9uLCBpc0V4cG9ydERlY2xhcmF0aW9uLCBpc0lkZW50aWZpZXIsIE1ldGhvZERlY2xhcmF0aW9uLCBNb2RpZmllckZsYWdzLCBNb2R1bGVCbG9jaywgTW9kdWxlRGVjbGFyYXRpb24sIE1vZHVsZUtpbmQsIE1vZHVsZVJlc29sdXRpb25Ib3N0LCBOYW1lZERlY2xhcmF0aW9uLCBOYW1lZEltcG9ydHMsIE5vZGUsIE5vZGVBcnJheSwgTm9kZUZsYWdzLCBOb25OdWxsRXhwcmVzc2lvbiwgTm90RW1pdHRlZFN0YXRlbWVudCwgT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlLCBPYmplY3RMaXRlcmFsRXhwcmVzc2lvbiwgUGFyYW1ldGVyRGVjbGFyYXRpb24sIHBhcnNlQ29tbWFuZExpbmUsIHBhcnNlSnNvbkNvbmZpZ0ZpbGVDb250ZW50LCBQcm9ncmFtLCBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24sIFByb3BlcnR5QXNzaWdubWVudCwgUHJvcGVydHlEZWNsYXJhdGlvbiwgUHJvcGVydHlOYW1lLCBQcm9wZXJ0eVNpZ25hdHVyZSwgcmVhZENvbmZpZ0ZpbGUsIHJlc29sdmVNb2R1bGVOYW1lLCBTY3JpcHRUYXJnZXQsIFNldEFjY2Vzc29yRGVjbGFyYXRpb24sIHNldEVtaXRGbGFncywgc2V0T3JpZ2luYWxOb2RlLCBzZXRTb3VyY2VNYXBSYW5nZSwgc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzLCBzZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzLCBzZXRUZXh0UmFuZ2UsIFNpZ25hdHVyZURlY2xhcmF0aW9uLCBTb3VyY2VGaWxlLCBTdGF0ZW1lbnQsIFN0cmluZ0xpdGVyYWwsIFN5bWJvbCwgU3ltYm9sRmxhZ3MsIFN5bnRheEtpbmQsIFN5bnRoZXNpemVkQ29tbWVudCwgc3lzLCBUb2tlbiwgVHJhbnNmb3JtYXRpb25Db250ZXh0LCBUcmFuc2Zvcm1lciwgVHJhbnNmb3JtZXJGYWN0b3J5LCBUeXBlLCBUeXBlQWxpYXNEZWNsYXJhdGlvbiwgVHlwZUNoZWNrZXIsIFR5cGVFbGVtZW50LCBUeXBlRmxhZ3MsIFR5cGVOb2RlLCBUeXBlUmVmZXJlbmNlLCBVbmlvblR5cGUsIHVwZGF0ZUJsb2NrLCBWYXJpYWJsZURlY2xhcmF0aW9uLCBWYXJpYWJsZVN0YXRlbWVudCwgdmlzaXRFYWNoQ2hpbGQsIHZpc2l0TGV4aWNhbEVudmlyb25tZW50LCBWaXNpdG9yLCBXcml0ZUZpbGVDYWxsYmFja30gZnJvbSAndHlwZXNjcmlwdCc7XG5cbi8vIGdldEVtaXRGbGFncyBpcyBub3cgcHJpdmF0ZSBzdGFydGluZyBpbiBUUyAyLjUuXG4vLyBTbyB3ZSBkZWZpbmUgb3VyIG93biBtZXRob2QgdGhhdCBjYWxscyB0aHJvdWdoIHRvIFR5cGVTY3JpcHQgdG8gZGVmZWF0IHRoZVxuLy8gdmlzaWJpbGl0eSBjb25zdHJhaW50LlxuZXhwb3J0IGZ1bmN0aW9uIGdldEVtaXRGbGFncyhub2RlOiB0cy5Ob2RlKTogdHMuRW1pdEZsYWdzfHVuZGVmaW5lZCB7XG4gIHJldHVybiAodHMgYXMgYW55KS5nZXRFbWl0RmxhZ3Mobm9kZSk7XG59XG5cbi8vIEJldHdlZW4gVHlwZVNjcmlwdCAyLjQgYW5kIDIuNSB1cGRhdGVQcm9wZXJ0eSB3YXMgbW9kaWZpZWQuIElmIGNhbGxlZCB3aXRoIDIuNCByZS1vcmRlciB0aGVcbi8vIHBhcmFtZXRlcnMuXG5leHBvcnQgbGV0IHVwZGF0ZVByb3BlcnR5ID0gdHMudXBkYXRlUHJvcGVydHk7XG5cbmNvbnN0IFttYWpvciwgbWlub3JdID0gdHMudmVyc2lvbi5zcGxpdCgnLicpO1xuaWYgKG1ham9yID09PSAnMicgJiYgbWlub3IgPT09ICc0Jykge1xuICBjb25zdCB1cGRhdGVQcm9wZXJ0eTI0ID0gdHMudXBkYXRlUHJvcGVydHkgYXMgYW55IGFzIHR5cGVvZiB0czI0LnVwZGF0ZVByb3BlcnR5O1xuICB1cGRhdGVQcm9wZXJ0eSA9IChub2RlOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uLCBkZWNvcmF0b3JzOiBSZWFkb25seUFycmF5PHRzLkRlY29yYXRvcj58dW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllcnM6IFJlYWRvbmx5QXJyYXk8dHMuTW9kaWZpZXI+fHVuZGVmaW5lZCwgbmFtZTogc3RyaW5nfHRzLlByb3BlcnR5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25Ub2tlbjogdHMuUXVlc3Rpb25Ub2tlbnx1bmRlZmluZWQsIHR5cGU6IHRzLlR5cGVOb2RlfHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbGl6ZXI6IHRzLkV4cHJlc3Npb258dW5kZWZpbmVkKTogdHMuUHJvcGVydHlEZWNsYXJhdGlvbiA9PiB7XG4gICAgcmV0dXJuIHVwZGF0ZVByb3BlcnR5MjQoXG4gICAgICAgICAgICAgICBub2RlIGFzIGFueSBhcyB0czI0LlByb3BlcnR5RGVjbGFyYXRpb24sIGRlY29yYXRvcnMgYXMgYW55IGFzIHRzMjQuRGVjb3JhdG9yW10sXG4gICAgICAgICAgICAgICBtb2RpZmllcnMgYXMgYW55LCBuYW1lIGFzIGFueSwgdHlwZSBhcyBhbnkswqBpbml0aWFsaXplciBhcyBhbnkpIGFzIGFueTtcbiAgfTtcbn1cbiJdfQ==