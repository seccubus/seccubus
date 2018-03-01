/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/util", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // toArray is a temporary function to help in the use of
    // ES6 maps and sets when running on node 4, which doesn't
    // support Iterators completely.
    var ts = require("typescript");
    /**
     * Constructs a new ts.CompilerHost that overlays sources in substituteSource
     * over another ts.CompilerHost.
     *
     * @param substituteSource A map of source file name -> overlay source text.
     */
    function createSourceReplacingCompilerHost(substituteSource, delegate) {
        return {
            getSourceFile: getSourceFile,
            getCancellationToken: delegate.getCancellationToken,
            getDefaultLibFileName: delegate.getDefaultLibFileName,
            writeFile: delegate.writeFile,
            getCurrentDirectory: delegate.getCurrentDirectory,
            getCanonicalFileName: delegate.getCanonicalFileName,
            useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
            getNewLine: delegate.getNewLine,
            fileExists: delegate.fileExists,
            readFile: delegate.readFile,
            directoryExists: delegate.directoryExists,
            getDirectories: delegate.getDirectories,
        };
        function getSourceFile(fileName, languageVersion, onError) {
            var path = ts.sys.resolvePath(fileName);
            var sourceText = substituteSource.get(path);
            if (sourceText !== undefined) {
                return ts.createSourceFile(fileName, sourceText, languageVersion);
            }
            return delegate.getSourceFile(path, languageVersion, onError);
        }
    }
    exports.createSourceReplacingCompilerHost = createSourceReplacingCompilerHost;
    /**
     * Returns the input string with line endings normalized to '\n'.
     */
    function normalizeLineEndings(input) {
        return input.replace(/\r\n/g, '\n');
    }
    exports.normalizeLineEndings = normalizeLineEndings;
    /** @return true if node has the specified modifier flag set. */
    function hasModifierFlag(node, flag) {
        return (ts.getCombinedModifierFlags(node) & flag) !== 0;
    }
    exports.hasModifierFlag = hasModifierFlag;
    function isDtsFileName(fileName) {
        return /\.d\.ts$/.test(fileName);
    }
    exports.isDtsFileName = isDtsFileName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsd0RBQXdEO0lBQ3hELDBEQUEwRDtJQUMxRCxnQ0FBZ0M7SUFFaEMsK0JBQWlDO0lBRWpDOzs7OztPQUtHO0lBQ0gsMkNBQ0ksZ0JBQXFDLEVBQUUsUUFBeUI7UUFDbEUsTUFBTSxDQUFDO1lBQ0wsYUFBYSxlQUFBO1lBQ2Isb0JBQW9CLEVBQUUsUUFBUSxDQUFDLG9CQUFvQjtZQUNuRCxxQkFBcUIsRUFBRSxRQUFRLENBQUMscUJBQXFCO1lBQ3JELFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztZQUM3QixtQkFBbUIsRUFBRSxRQUFRLENBQUMsbUJBQW1CO1lBQ2pELG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxvQkFBb0I7WUFDbkQseUJBQXlCLEVBQUUsUUFBUSxDQUFDLHlCQUF5QjtZQUM3RCxVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7WUFDL0IsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVO1lBQy9CLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtZQUMzQixlQUFlLEVBQUUsUUFBUSxDQUFDLGVBQWU7WUFDekMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjO1NBQ3hDLENBQUM7UUFFRix1QkFDSSxRQUFnQixFQUFFLGVBQWdDLEVBQ2xELE9BQW1DO1lBQ3JDLElBQU0sSUFBSSxHQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELElBQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3BFLENBQUM7WUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLENBQUM7SUFDSCxDQUFDO0lBM0JELDhFQTJCQztJQUVEOztPQUVHO0lBQ0gsOEJBQXFDLEtBQWE7UUFDaEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFGRCxvREFFQztJQUVELGdFQUFnRTtJQUNoRSx5QkFBZ0MsSUFBYSxFQUFFLElBQXNCO1FBQ25FLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUZELDBDQUVDO0lBRUQsdUJBQThCLFFBQWdCO1FBQzVDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFGRCxzQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gdG9BcnJheSBpcyBhIHRlbXBvcmFyeSBmdW5jdGlvbiB0byBoZWxwIGluIHRoZSB1c2Ugb2Zcbi8vIEVTNiBtYXBzIGFuZCBzZXRzIHdoZW4gcnVubmluZyBvbiBub2RlIDQsIHdoaWNoIGRvZXNuJ3Rcbi8vIHN1cHBvcnQgSXRlcmF0b3JzIGNvbXBsZXRlbHkuXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgdHMuQ29tcGlsZXJIb3N0IHRoYXQgb3ZlcmxheXMgc291cmNlcyBpbiBzdWJzdGl0dXRlU291cmNlXG4gKiBvdmVyIGFub3RoZXIgdHMuQ29tcGlsZXJIb3N0LlxuICpcbiAqIEBwYXJhbSBzdWJzdGl0dXRlU291cmNlIEEgbWFwIG9mIHNvdXJjZSBmaWxlIG5hbWUgLT4gb3ZlcmxheSBzb3VyY2UgdGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNvdXJjZVJlcGxhY2luZ0NvbXBpbGVySG9zdChcbiAgICBzdWJzdGl0dXRlU291cmNlOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBkZWxlZ2F0ZTogdHMuQ29tcGlsZXJIb3N0KTogdHMuQ29tcGlsZXJIb3N0IHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTb3VyY2VGaWxlLFxuICAgIGdldENhbmNlbGxhdGlvblRva2VuOiBkZWxlZ2F0ZS5nZXRDYW5jZWxsYXRpb25Ub2tlbixcbiAgICBnZXREZWZhdWx0TGliRmlsZU5hbWU6IGRlbGVnYXRlLmdldERlZmF1bHRMaWJGaWxlTmFtZSxcbiAgICB3cml0ZUZpbGU6IGRlbGVnYXRlLndyaXRlRmlsZSxcbiAgICBnZXRDdXJyZW50RGlyZWN0b3J5OiBkZWxlZ2F0ZS5nZXRDdXJyZW50RGlyZWN0b3J5LFxuICAgIGdldENhbm9uaWNhbEZpbGVOYW1lOiBkZWxlZ2F0ZS5nZXRDYW5vbmljYWxGaWxlTmFtZSxcbiAgICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzOiBkZWxlZ2F0ZS51c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzLFxuICAgIGdldE5ld0xpbmU6IGRlbGVnYXRlLmdldE5ld0xpbmUsXG4gICAgZmlsZUV4aXN0czogZGVsZWdhdGUuZmlsZUV4aXN0cyxcbiAgICByZWFkRmlsZTogZGVsZWdhdGUucmVhZEZpbGUsXG4gICAgZGlyZWN0b3J5RXhpc3RzOiBkZWxlZ2F0ZS5kaXJlY3RvcnlFeGlzdHMsXG4gICAgZ2V0RGlyZWN0b3JpZXM6IGRlbGVnYXRlLmdldERpcmVjdG9yaWVzLFxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFNvdXJjZUZpbGUoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCxcbiAgICAgIG9uRXJyb3I/OiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIGNvbnN0IHBhdGg6IHN0cmluZyA9IHRzLnN5cy5yZXNvbHZlUGF0aChmaWxlTmFtZSk7XG4gICAgY29uc3Qgc291cmNlVGV4dCA9IHN1YnN0aXR1dGVTb3VyY2UuZ2V0KHBhdGgpO1xuICAgIGlmIChzb3VyY2VUZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCBzb3VyY2VUZXh0LCBsYW5ndWFnZVZlcnNpb24pO1xuICAgIH1cbiAgICByZXR1cm4gZGVsZWdhdGUuZ2V0U291cmNlRmlsZShwYXRoLCBsYW5ndWFnZVZlcnNpb24sIG9uRXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW5wdXQgc3RyaW5nIHdpdGggbGluZSBlbmRpbmdzIG5vcm1hbGl6ZWQgdG8gJ1xcbicuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVMaW5lRW5kaW5ncyhpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJyk7XG59XG5cbi8qKiBAcmV0dXJuIHRydWUgaWYgbm9kZSBoYXMgdGhlIHNwZWNpZmllZCBtb2RpZmllciBmbGFnIHNldC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNb2RpZmllckZsYWcobm9kZTogdHMuTm9kZSwgZmxhZzogdHMuTW9kaWZpZXJGbGFncyk6IGJvb2xlYW4ge1xuICByZXR1cm4gKHRzLmdldENvbWJpbmVkTW9kaWZpZXJGbGFncyhub2RlKSAmIGZsYWcpICE9PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEdHNGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAvXFwuZFxcLnRzJC8udGVzdChmaWxlTmFtZSk7XG59XG4iXX0=