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
        define("tsickle/src/modules_manifest", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** A class that maintains the module dependency graph of output JS files. */
    var ModulesManifest = /** @class */ (function () {
        function ModulesManifest() {
            /** Map of googmodule module name to file name */
            this.moduleToFileName = {};
            /** Map of file name to arrays of imported googmodule module names */
            this.referencedModules = {};
        }
        ModulesManifest.prototype.addManifest = function (other) {
            Object.assign(this.moduleToFileName, other.moduleToFileName);
            Object.assign(this.referencedModules, other.referencedModules);
        };
        ModulesManifest.prototype.addModule = function (fileName, module) {
            this.moduleToFileName[module] = fileName;
            this.referencedModules[fileName] = [];
        };
        ModulesManifest.prototype.addReferencedModule = function (fileName, resolvedModule) {
            this.referencedModules[fileName].push(resolvedModule);
        };
        Object.defineProperty(ModulesManifest.prototype, "modules", {
            get: function () {
                return Object.keys(this.moduleToFileName);
            },
            enumerable: true,
            configurable: true
        });
        ModulesManifest.prototype.getFileNameFromModule = function (module) {
            return this.moduleToFileName[module];
        };
        Object.defineProperty(ModulesManifest.prototype, "fileNames", {
            get: function () {
                return Object.keys(this.referencedModules);
            },
            enumerable: true,
            configurable: true
        });
        ModulesManifest.prototype.getReferencedModules = function (fileName) {
            return this.referencedModules[fileName];
        };
        return ModulesManifest;
    }());
    exports.ModulesManifest = ModulesManifest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlc19tYW5pZmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzX21hbmlmZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBSUgsNkVBQTZFO0lBQzdFO1FBQUE7WUFDRSxpREFBaUQ7WUFDekMscUJBQWdCLEdBQW9CLEVBQUUsQ0FBQztZQUMvQyxxRUFBcUU7WUFDN0Qsc0JBQWlCLEdBQXNCLEVBQUUsQ0FBQztRQStCcEQsQ0FBQztRQTdCQyxxQ0FBVyxHQUFYLFVBQVksS0FBc0I7WUFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELG1DQUFTLEdBQVQsVUFBVSxRQUFnQixFQUFFLE1BQWM7WUFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFRCw2Q0FBbUIsR0FBbkIsVUFBb0IsUUFBZ0IsRUFBRSxjQUFzQjtZQUMxRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxzQkFBSSxvQ0FBTztpQkFBWDtnQkFDRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1QyxDQUFDOzs7V0FBQTtRQUVELCtDQUFxQixHQUFyQixVQUFzQixNQUFjO1lBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVELHNCQUFJLHNDQUFTO2lCQUFiO2dCQUNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzdDLENBQUM7OztXQUFBO1FBRUQsOENBQW9CLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQW5DRCxJQW1DQztJQW5DWSwwQ0FBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBGaWxlTWFwPFQ+IHsgW2ZpbGVOYW1lOiBzdHJpbmddOiBUOyB9XG5cbi8qKiBBIGNsYXNzIHRoYXQgbWFpbnRhaW5zIHRoZSBtb2R1bGUgZGVwZW5kZW5jeSBncmFwaCBvZiBvdXRwdXQgSlMgZmlsZXMuICovXG5leHBvcnQgY2xhc3MgTW9kdWxlc01hbmlmZXN0IHtcbiAgLyoqIE1hcCBvZiBnb29nbW9kdWxlIG1vZHVsZSBuYW1lIHRvIGZpbGUgbmFtZSAqL1xuICBwcml2YXRlIG1vZHVsZVRvRmlsZU5hbWU6IEZpbGVNYXA8c3RyaW5nPiA9IHt9O1xuICAvKiogTWFwIG9mIGZpbGUgbmFtZSB0byBhcnJheXMgb2YgaW1wb3J0ZWQgZ29vZ21vZHVsZSBtb2R1bGUgbmFtZXMgKi9cbiAgcHJpdmF0ZSByZWZlcmVuY2VkTW9kdWxlczogRmlsZU1hcDxzdHJpbmdbXT4gPSB7fTtcblxuICBhZGRNYW5pZmVzdChvdGhlcjogTW9kdWxlc01hbmlmZXN0KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZHVsZVRvRmlsZU5hbWUsIG90aGVyLm1vZHVsZVRvRmlsZU5hbWUpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5yZWZlcmVuY2VkTW9kdWxlcywgb3RoZXIucmVmZXJlbmNlZE1vZHVsZXMpO1xuICB9XG5cbiAgYWRkTW9kdWxlKGZpbGVOYW1lOiBzdHJpbmcsIG1vZHVsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5tb2R1bGVUb0ZpbGVOYW1lW21vZHVsZV0gPSBmaWxlTmFtZTtcbiAgICB0aGlzLnJlZmVyZW5jZWRNb2R1bGVzW2ZpbGVOYW1lXSA9IFtdO1xuICB9XG5cbiAgYWRkUmVmZXJlbmNlZE1vZHVsZShmaWxlTmFtZTogc3RyaW5nLCByZXNvbHZlZE1vZHVsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZWZlcmVuY2VkTW9kdWxlc1tmaWxlTmFtZV0ucHVzaChyZXNvbHZlZE1vZHVsZSk7XG4gIH1cblxuICBnZXQgbW9kdWxlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kdWxlVG9GaWxlTmFtZSk7XG4gIH1cblxuICBnZXRGaWxlTmFtZUZyb21Nb2R1bGUobW9kdWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm1vZHVsZVRvRmlsZU5hbWVbbW9kdWxlXTtcbiAgfVxuXG4gIGdldCBmaWxlTmFtZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnJlZmVyZW5jZWRNb2R1bGVzKTtcbiAgfVxuXG4gIGdldFJlZmVyZW5jZWRNb2R1bGVzKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMucmVmZXJlbmNlZE1vZHVsZXNbZmlsZU5hbWVdO1xuICB9XG59XG4iXX0=