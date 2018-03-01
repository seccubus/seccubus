/// <amd-module name="tsickle/src/rewriter" />
import { SourceMapper } from './source_map_utils';
import * as ts from './typescript';
/**
 * A Rewriter manages iterating through a ts.SourceFile, copying input
 * to output while letting the subclass potentially alter some nodes
 * along the way by implementing maybeProcess().
 */
export declare abstract class Rewriter {
    file: ts.SourceFile;
    private sourceMapper;
    private output;
    /** Errors found while examining the code. */
    protected diagnostics: ts.Diagnostic[];
    /** Current position in the output. */
    private position;
    /**
     * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
     * print statements.
     */
    private indent;
    /**
     * Skip emitting any code before the given offset. E.g. used to avoid emitting @fileoverview
     * comments twice.
     */
    private skipCommentsUpToOffset;
    constructor(file: ts.SourceFile, sourceMapper?: SourceMapper);
    getOutput(prefix?: string): {
        output: string;
        diagnostics: ts.Diagnostic[];
    };
    /**
     * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
     */
    visit(node: ts.Node): void;
    /**
     * maybeProcess lets subclasses optionally processes a node.
     *
     * @return True if the node has been handled and doesn't need to be traversed;
     *    false to have the node written and its children recursively visited.
     */
    protected maybeProcess(node: ts.Node): boolean;
    /** writeNode writes a ts.Node, calling this.visit() on its children. */
    writeNode(node: ts.Node, skipComments?: boolean, newLineIfCommentsStripped?: boolean): void;
    writeNodeFrom(node: ts.Node, pos: number, end?: number): void;
    /**
     * Writes all leading trivia (whitespace or comments) on node, or all trivia up to the given
     * position. Also marks those trivia as "already emitted" by shifting the skipCommentsUpTo marker.
     */
    writeLeadingTrivia(node: ts.Node, upTo?: number): void;
    addSourceMapping(node: ts.Node): void;
    /**
     * Write a span of the input file as expressed by absolute offsets.
     * These offsets are found in attributes like node.getFullStart() and
     * node.getEnd().
     */
    writeRange(node: ts.Node, from: number, to: number): void;
    emit(str: string): void;
    /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
    escapeForComment(str: string): string;
    logWithIndent(message: string): void;
    /**
     * Produces a compiler error that references the Node's kind.  This is useful for the "else"
     * branch of code that is attempting to handle all possible input Node types, to ensure all cases
     * covered.
     */
    errorUnimplementedKind(node: ts.Node, where: string): void;
    error(node: ts.Node, messageText: string): void;
}
/** Returns the string contents of a ts.Identifier. */
export declare function getIdentifierText(identifier: ts.Identifier): string;
/** Returns a dot-joined qualified name (foo.bar.Baz). */
export declare function getEntityNameText(name: ts.EntityName): string;
/**
 * Converts an escaped TypeScript name into the original source name.
 * Prefer getIdentifierText() instead if possible.
 */
export declare function unescapeName(name: string): string;
