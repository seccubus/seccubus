/// <amd-module name="tsickle/src/decorator-annotator" />
import { Rewriter } from './rewriter';
import { SourceMapper } from './source_map_utils';
import * as ts from './typescript';
export declare function shouldLower(decorator: ts.Decorator, typeChecker: ts.TypeChecker): boolean;
export declare class DecoratorClassVisitor {
    private typeChecker;
    private rewriter;
    private classDecl;
    private importedNames;
    /** Decorators on the class itself. */
    decorators: ts.Decorator[];
    /** The constructor parameter list and decorators on each param. */
    private ctorParameters;
    /** Per-method decorators. */
    propDecorators: Map<string, ts.Decorator[]>;
    constructor(typeChecker: ts.TypeChecker, rewriter: Rewriter, classDecl: ts.ClassDeclaration, importedNames: Array<{
        name: ts.Identifier;
        declarationNames: ts.Identifier[];
    }>);
    /**
     * Determines whether the given decorator should be re-written as an annotation.
     */
    private decoratorsToLower(n);
    /**
     * gatherConstructor grabs the parameter list and decorators off the class
     * constructor, and emits nothing.
     */
    private gatherConstructor(ctor);
    /**
     * gatherMethod grabs the decorators off a class method and emits nothing.
     */
    private gatherMethodOrProperty(method);
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
    private getValueIdentifierForType(typeSymbol, typeNode);
    beforeProcessNode(node: ts.Node): void;
    /**
     * Checks if the decorator is on a class, as opposed to a field or an
     * argument.
     */
    private isClassDecorator(decorator);
    maybeProcessDecorator(node: ts.Decorator, start?: number): boolean;
    foundDecorators(): boolean;
    /**
     * emits the types for the various gathered metadata to be used
     * in the tsickle type annotations helper.
     */
    emitMetadataTypeAnnotationsHelpers(): void;
    /**
     * emitMetadata emits the various gathered metadata, as static fields.
     */
    emitMetadataAsStaticProperties(): void;
    private emitDecorator(decorator);
}
/**
 * Collect the Identifiers used as named bindings in the given import declaration
 * with their Symbol.
 * This is needed later on to find an identifier that represents the value
 * of an imported type identifier.
 */
export declare function collectImportedNames(typeChecker: ts.TypeChecker, decl: ts.ImportDeclaration): Array<{
    name: ts.Identifier;
    declarationNames: ts.Identifier[];
}>;
export declare function visitClassContentIncludingDecorators(classDecl: ts.ClassDeclaration, rewriter: Rewriter, decoratorVisitor?: DecoratorClassVisitor): void;
export declare function convertDecorators(typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile, sourceMapper: SourceMapper): {
    output: string;
    diagnostics: ts.Diagnostic[];
};
