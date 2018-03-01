import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { ComponentMetadata, DirectiveMetadata } from './angular/metadata';
export declare class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata;
    static INJECTABLE_FAILURE_STRING: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
export declare class ClassMetadataWalker extends NgWalker {
    private rule;
    className: string;
    isInjectable: boolean;
    constructor(sourceFile: ts.SourceFile, rule: Rule);
    visitNgInjectable(classDeclaration: ts.ClassDeclaration, decorator: ts.Decorator): void;
    protected visitNgDirective(metadata: DirectiveMetadata): void;
    protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator): void;
    protected visitNgComponent(metadata: ComponentMetadata): void;
    protected visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
    protected visitNgOutput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
    protected visitNgHostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]): void;
    protected visitNgHostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]): void;
    protected visitNgContentChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
    protected visitNgContentChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
    protected visitNgViewChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
    protected visitNgViewChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
    private generateFailure(start, width, failureConfig);
}
