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
        define("tsickle/src/cli_support", ["require", "exports", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    // Postprocess generated JS.
    function pathToModuleName(context, fileName) {
        fileName = fileName.replace(/\.js$/, '');
        if (fileName[0] === '.') {
            // './foo' or '../foo'.
            // Resolve the path against the dirname of the current module.
            fileName = path.join(path.dirname(context), fileName);
        }
        // Replace characters not supported by goog.module.
        var moduleName = fileName.replace(/\/|\\/g, '.').replace(/^[^a-zA-Z_$]/, '_').replace(/[^a-zA-Z0-9._$]/g, '_');
        return moduleName;
    }
    exports.pathToModuleName = pathToModuleName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpX3N1cHBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpX3N1cHBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCwyQkFBNkI7SUFFN0IsNEJBQTRCO0lBQzVCLDBCQUFpQyxPQUFlLEVBQUUsUUFBZ0I7UUFDaEUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXpDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLHVCQUF1QjtZQUN2Qiw4REFBOEQ7WUFDOUQsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsbURBQW1EO1FBQ25ELElBQU0sVUFBVSxHQUNaLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWxHLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQWJELDRDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBQb3N0cHJvY2VzcyBnZW5lcmF0ZWQgSlMuXG5leHBvcnQgZnVuY3Rpb24gcGF0aFRvTW9kdWxlTmFtZShjb250ZXh0OiBzdHJpbmcsIGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBmaWxlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL1xcLmpzJC8sICcnKTtcblxuICBpZiAoZmlsZU5hbWVbMF0gPT09ICcuJykge1xuICAgIC8vICcuL2Zvbycgb3IgJy4uL2ZvbycuXG4gICAgLy8gUmVzb2x2ZSB0aGUgcGF0aCBhZ2FpbnN0IHRoZSBkaXJuYW1lIG9mIHRoZSBjdXJyZW50IG1vZHVsZS5cbiAgICBmaWxlTmFtZSA9IHBhdGguam9pbihwYXRoLmRpcm5hbWUoY29udGV4dCksIGZpbGVOYW1lKTtcbiAgfVxuICAvLyBSZXBsYWNlIGNoYXJhY3RlcnMgbm90IHN1cHBvcnRlZCBieSBnb29nLm1vZHVsZS5cbiAgY29uc3QgbW9kdWxlTmFtZSA9XG4gICAgICBmaWxlTmFtZS5yZXBsYWNlKC9cXC98XFxcXC9nLCAnLicpLnJlcGxhY2UoL15bXmEtekEtWl8kXS8sICdfJykucmVwbGFjZSgvW15hLXpBLVowLTkuXyRdL2csICdfJyk7XG5cbiAgcmV0dXJuIG1vZHVsZU5hbWU7XG59XG4iXX0=