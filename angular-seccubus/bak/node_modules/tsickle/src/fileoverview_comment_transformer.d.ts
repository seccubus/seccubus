/// <amd-module name="tsickle/src/fileoverview_comment_transformer" />
import * as ts from './typescript';
/**
 * Returns true if the given comment is a \@fileoverview style comment in the Closure sense, i.e. a
 * comment that has JSDoc tags marking it as a fileoverview comment.
 * Note that this is different from TypeScript's understanding of the concept, where a file comment
 * is a comment separated from the rest of the file by a double newline.
 */
export declare function isClosureFileoverviewComment(text: string): boolean;
/**
 * A transformer that ensures the emitted JS file has an \@fileoverview comment that contains an
 * \@suppress {checkTypes} annotation by either adding or updating an existing comment.
 */
export declare function transformFileoverviewComment(context: ts.TransformationContext): (sf: ts.SourceFile) => ts.SourceFile;
