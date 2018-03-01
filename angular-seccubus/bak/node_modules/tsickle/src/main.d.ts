/// <amd-module name="tsickle/src/main" />
import * as ts from './typescript';
import * as tsickle from './tsickle';
/** Tsickle settings passed on the command line. */
export interface Settings {
    /** If provided, path to save externs to. */
    externsPath?: string;
    /** If provided, attempt to provide types rather than {?}. */
    isTyped?: boolean;
    /** If true, log internal debug warnings to the console. */
    verbose?: boolean;
}
/**
 * Compiles TypeScript code into Closure-compiler-ready JS.
 */
export declare function toClosureJS(options: ts.CompilerOptions, fileNames: string[], settings: Settings, writeFile?: ts.WriteFileCallback): tsickle.EmitResult;
