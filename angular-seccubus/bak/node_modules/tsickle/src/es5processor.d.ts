/// <amd-module name="tsickle/src/es5processor" />
import { ModulesManifest } from './modules_manifest';
import * as ts from './typescript';
export interface Es5ProcessorHost {
    /**
     * Takes a context (the current file) and the path of the file to import
     *  and generates a googmodule module name
     */
    pathToModuleName(context: string, importPath: string): string;
    /**
     * If we do googmodule processing, we polyfill module.id, since that's
     * part of ES6 modules.  This function determines what the module.id will be
     * for each file.
     */
    fileNameToModuleId(fileName: string): string;
    /** Whether to convert CommonJS module syntax to `goog.module` Closure imports. */
    googmodule?: boolean;
    /** Whether the emit targets ES5 or ES6+. */
    es5Mode?: boolean;
    /** expand "import 'foo';" to "import 'foo/index';" if it points to an index file. */
    convertIndexImportShorthand?: boolean;
    /**
     * An additional prelude to insert in front of the emitted code, e.g. to import a shared library.
     */
    prelude?: string;
    options: ts.CompilerOptions;
    host: ts.ModuleResolutionHost;
}
/**
 * Extracts the namespace part of a goog: import, or returns null if the given
 * import is not a goog: import.
 */
export declare function extractGoogNamespaceImport(tsImport: string): string | null;
/**
 * Convert from implicit `import {} from 'pkg'` to `import {} from 'pkg/index'.
 * TypeScript supports the shorthand, but not all ES6 module loaders do.
 * Workaround for https://github.com/Microsoft/TypeScript/issues/12597
 */
export declare function resolveIndexShorthand(host: {
    options: ts.CompilerOptions;
    host: ts.ModuleResolutionHost;
}, fileName: string, imported: string): string;
/**
 * Converts TypeScript's JS+CommonJS output to Closure goog.module etc.
 * For use as a postprocessing step *after* TypeScript emits JavaScript.
 *
 * @param fileName The source file name.
 * @param moduleId The "module id", a module-identifying string that is
 *     the value module.id in the scope of the module.
 * @param pathToModuleName A function that maps a filesystem .ts path to a
 *     Closure module name, as found in a goog.require('...') statement.
 *     The context parameter is the referencing file, used for resolving
 *     imports with relative paths like "import * as foo from '../foo';".
 * @param prelude An additional prelude to insert after the `goog.module` call,
 *     e.g. with additional imports or requires.
 */
export declare function processES5(host: Es5ProcessorHost, fileName: string, content: string): {
    output: string;
    referencedModules: string[];
};
export declare function convertCommonJsToGoogModuleIfNeeded(host: Es5ProcessorHost, modulesManifest: ModulesManifest, fileName: string, content: string): string;
