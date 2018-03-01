/// <amd-module name="tsickle/src/typescript" />
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
import * as ts from 'typescript';
export { __String, addSyntheticTrailingComment, AssertionExpression, Block, CallExpression, CancellationToken, ClassDeclaration, ClassElement, ClassLikeDeclaration, CommentRange, CompilerHost, CompilerOptions, ConstructorDeclaration, createArrayLiteral, createArrayTypeNode, createCompilerHost, createIdentifier, createKeywordTypeNode, createNodeArray, createNotEmittedStatement, createObjectLiteral, createProgram, createProperty, createPropertyAssignment, createPropertySignature, createSourceFile, createToken, createTypeLiteralNode, createTypeReferenceNode, CustomTransformers, Declaration, DeclarationStatement, DeclarationWithTypeParameters, Decorator, Diagnostic, DiagnosticCategory, ElementAccessExpression, EmitFlags, EmitResult, EntityName, EnumDeclaration, ExportDeclaration, ExportSpecifier, Expression, ExpressionStatement, flattenDiagnosticMessageText, forEachChild, FunctionDeclaration, FunctionLikeDeclaration, GetAccessorDeclaration, getCombinedModifierFlags, getLeadingCommentRanges, getLineAndCharacterOfPosition, getMutableClone, getOriginalNode, getPreEmitDiagnostics, getSyntheticLeadingComments, getSyntheticTrailingComments, getTrailingCommentRanges, Identifier, ImportDeclaration, ImportEqualsDeclaration, ImportSpecifier, InterfaceDeclaration, isExportDeclaration, isIdentifier, MethodDeclaration, ModifierFlags, ModuleBlock, ModuleDeclaration, ModuleKind, ModuleResolutionHost, NamedDeclaration, NamedImports, Node, NodeArray, NodeFlags, NonNullExpression, NotEmittedStatement, ObjectLiteralElementLike, ObjectLiteralExpression, ParameterDeclaration, parseCommandLine, parseJsonConfigFileContent, Program, PropertyAccessExpression, PropertyAssignment, PropertyDeclaration, PropertyName, PropertySignature, readConfigFile, resolveModuleName, ScriptTarget, SetAccessorDeclaration, setEmitFlags, setOriginalNode, setSourceMapRange, setSyntheticLeadingComments, setSyntheticTrailingComments, setTextRange, SignatureDeclaration, SourceFile, Statement, StringLiteral, Symbol, SymbolFlags, SyntaxKind, SynthesizedComment, sys, Token, TransformationContext, Transformer, TransformerFactory, Type, TypeAliasDeclaration, TypeChecker, TypeElement, TypeFlags, TypeNode, TypeReference, UnionType, updateBlock, VariableDeclaration, VariableStatement, visitEachChild, visitLexicalEnvironment, Visitor, WriteFileCallback } from 'typescript';
export declare function getEmitFlags(node: ts.Node): ts.EmitFlags | undefined;
export declare let updateProperty: typeof ts.updateProperty;
