import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { ComponentMetadata, DirectiveMetadata } from './angular/metadata';
export declare class Rule extends Lint.Rules.AbstractRule {
    static metadata: Lint.IRuleMetadata;
    static FAILURE_STRING: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
export declare class ClassMetadataWalker extends NgWalker {
    private rule;
    className: string;
    isInjectable: boolean;
    isComponent: boolean;
    isDirective: boolean;
    isPipe: boolean;
    constructor(sourceFile: ts.SourceFile, rule: Rule);
    visitNgInjectable(controller: ts.ClassDeclaration, decorator: ts.Decorator): void;
    visitNgComponent(metadata: ComponentMetadata): void;
    visitNgDirective(metadata: DirectiveMetadata): void;
    visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator): void;
    visitMethodDeclaration(method: ts.MethodDeclaration): void;
    private generateFailure(start, width, failureConfig);
}
