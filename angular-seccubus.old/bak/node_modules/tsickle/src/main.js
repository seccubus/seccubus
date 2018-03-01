#!/usr/bin/env node
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/main", ["require", "exports", "fs", "minimist", "mkdirp", "path", "tsickle/src/typescript", "tsickle/src/cli_support", "tsickle/src/tsickle", "tsickle/src/tsickle"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var minimist = require("minimist");
    var mkdirp = require("mkdirp");
    var path = require("path");
    var ts = require("tsickle/src/typescript");
    var cliSupport = require("tsickle/src/cli_support");
    var tsickle = require("tsickle/src/tsickle");
    var tsickle_1 = require("tsickle/src/tsickle");
    function usage() {
        console.error("usage: tsickle [tsickle options] -- [tsc options]\n\nexample:\n  tsickle --externs=foo/externs.js -- -p src --noImplicitAny\n\ntsickle flags are:\n  --externs=PATH     save generated Closure externs.js to PATH\n  --typed            [experimental] attempt to provide Closure types instead of {?}\n");
    }
    /**
     * Parses the command-line arguments, extracting the tsickle settings and
     * the arguments to pass on to tsc.
     */
    function loadSettingsFromArgs(args) {
        var settings = {};
        var parsedArgs = minimist(args);
        try {
            for (var _a = __values(Object.keys(parsedArgs)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var flag = _b.value;
                switch (flag) {
                    case 'h':
                    case 'help':
                        usage();
                        process.exit(0);
                        break;
                    case 'externs':
                        settings.externsPath = parsedArgs[flag];
                        break;
                    case 'typed':
                        settings.isTyped = true;
                        break;
                    case 'verbose':
                        settings.verbose = true;
                        break;
                    case '_':
                        // This is part of the minimist API, and holds args after the '--'.
                        break;
                    default:
                        console.error("unknown flag '--" + flag + "'");
                        usage();
                        process.exit(1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Arguments after the '--' arg are arguments to tsc.
        var tscArgs = parsedArgs['_'];
        return { settings: settings, tscArgs: tscArgs };
        var e_1, _c;
    }
    /**
     * Loads the tsconfig.json from a directory.
     *
     * TODO(martinprobst): use ts.findConfigFile to match tsc behaviour.
     *
     * @param args tsc command-line arguments.
     */
    function loadTscConfig(args) {
        // Gather tsc options/input files from command line.
        var _a = ts.parseCommandLine(args), options = _a.options, fileNames = _a.fileNames, errors = _a.errors;
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // Store file arguments
        var tsFileArguments = fileNames;
        // Read further settings from tsconfig.json.
        var projectDir = options.project || '.';
        var configFileName = path.join(projectDir, 'tsconfig.json');
        var _b = ts.readConfigFile(configFileName, function (path) { return fs.readFileSync(path, 'utf-8'); }), json = _b.config, error = _b.error;
        if (error) {
            return { options: {}, fileNames: [], errors: [error] };
        }
        (_c = ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName), options = _c.options, fileNames = _c.fileNames, errors = _c.errors);
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // if file arguments were given to the typescript transpiler then transpile only those files
        fileNames = tsFileArguments.length > 0 ? tsFileArguments : fileNames;
        return { options: options, fileNames: fileNames, errors: [] };
        var _c;
    }
    /**
     * Compiles TypeScript code into Closure-compiler-ready JS.
     */
    function toClosureJS(options, fileNames, settings, writeFile) {
        var compilerHost = ts.createCompilerHost(options);
        var program = ts.createProgram(fileNames, options, compilerHost);
        var transformerHost = {
            shouldSkipTsickleProcessing: function (fileName) {
                return fileNames.indexOf(fileName) === -1;
            },
            shouldIgnoreWarningsForPath: function (fileName) { return false; },
            pathToModuleName: cliSupport.pathToModuleName,
            fileNameToModuleId: function (fileName) { return fileName; },
            es5Mode: true,
            googmodule: true,
            prelude: '',
            transformDecorators: true,
            transformTypesToClosure: true,
            typeBlackListPaths: new Set(),
            untyped: false,
            logWarning: function (warning) { return console.error(tsickle.formatDiagnostics([warning])); },
            options: options,
            host: compilerHost,
        };
        var diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length > 0) {
            return {
                diagnostics: diagnostics,
                modulesManifest: new tsickle_1.ModulesManifest(),
                externs: {},
                emitSkipped: true,
                emittedFiles: [],
            };
        }
        return tsickle.emitWithTsickle(program, transformerHost, compilerHost, options, undefined, writeFile);
    }
    exports.toClosureJS = toClosureJS;
    function main(args) {
        var _a = loadSettingsFromArgs(args), settings = _a.settings, tscArgs = _a.tscArgs;
        var config = loadTscConfig(tscArgs);
        if (config.errors.length) {
            console.error(tsickle.formatDiagnostics(config.errors));
            return 1;
        }
        if (config.options.module !== ts.ModuleKind.CommonJS) {
            // This is not an upstream TypeScript diagnostic, therefore it does not go
            // through the diagnostics array mechanism.
            console.error('tsickle converts TypeScript modules to Closure modules via CommonJS internally. ' +
                'Set tsconfig.js "module": "commonjs"');
            return 1;
        }
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var result = toClosureJS(config.options, config.fileNames, settings, function (filePath, contents) {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
        });
        if (result.diagnostics.length) {
            console.error(tsickle.formatDiagnostics(result.diagnostics));
            return 1;
        }
        if (settings.externsPath) {
            mkdirp.sync(path.dirname(settings.externsPath));
            fs.writeFileSync(settings.externsPath, tsickle.getGeneratedExterns(result.externs));
        }
        return 0;
    }
    // CLI entry point
    if (require.main === module) {
        process.exit(main(process.argv.splice(2)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFVQSx1QkFBeUI7SUFDekIsbUNBQXFDO0lBQ3JDLCtCQUFpQztJQUNqQywyQkFBNkI7SUFDN0IsMkNBQW1DO0lBRW5DLG9EQUE0QztJQUM1Qyw2Q0FBcUM7SUFDckMsK0NBQTBDO0lBZTFDO1FBQ0UsT0FBTyxDQUFDLEtBQUssQ0FBQywwU0FRZixDQUFDLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsOEJBQThCLElBQWM7UUFDMUMsSUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1FBQzlCLElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7WUFDbEMsR0FBRyxDQUFDLENBQWUsSUFBQSxLQUFBLFNBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQSxnQkFBQTtnQkFBckMsSUFBTSxJQUFJLFdBQUE7Z0JBQ2IsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDYixLQUFLLEdBQUcsQ0FBQztvQkFDVCxLQUFLLE1BQU07d0JBQ1QsS0FBSyxFQUFFLENBQUM7d0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsS0FBSyxDQUFDO29CQUNSLEtBQUssU0FBUzt3QkFDWixRQUFRLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDeEMsS0FBSyxDQUFDO29CQUNSLEtBQUssT0FBTzt3QkFDVixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDeEIsS0FBSyxDQUFDO29CQUNSLEtBQUssU0FBUzt3QkFDWixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDeEIsS0FBSyxDQUFDO29CQUNSLEtBQUssR0FBRzt3QkFDTixtRUFB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UUFBUSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtaW5pbWlzdCBmcm9tICdtaW5pbWlzdCc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQgKiBhcyBjbGlTdXBwb3J0IGZyb20gJy4vY2xpX3N1cHBvcnQnO1xuaW1wb3J0ICogYXMgdHNpY2tsZSBmcm9tICcuL3RzaWNrbGUnO1xuaW1wb3J0IHtNb2R1bGVzTWFuaWZlc3R9IGZyb20gJy4vdHNpY2tsZSc7XG5pbXBvcnQge2NyZWF0ZVNvdXJjZVJlcGxhY2luZ0NvbXBpbGVySG9zdH0gZnJvbSAnLi91dGlsJztcblxuLyoqIFRzaWNrbGUgc2V0dGluZ3MgcGFzc2VkIG9uIHRoZSBjb21tYW5kIGxpbmUuICovXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzIHtcbiAgLyoqIElmIHByb3ZpZGVkLCBwYXRoIHRvIHNhdmUgZXh0ZXJucyB0by4gKi9cbiAgZXh0ZXJuc1BhdGg/OiBzdHJpbmc7XG5cbiAgLyoqIElmIHByb3ZpZGVkLCBhdHRlbXB0IHRvIHByb3ZpZGUgdHlwZXMgcmF0aGVyIHRoYW4gez99LiAqL1xuICBpc1R5cGVkPzogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSwgbG9nIGludGVybmFsIGRlYnVnIHdhcm5pbmdzIHRvIHRoZSBjb25zb2xlLiAqL1xuICB2ZXJib3NlPzogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gdXNhZ2UoKSB7XG4gIGNvbnNvbGUuZXJyb3IoYHVzYWdlOiB0c2lja2xlIFt0c2lja2xlIG9wdGlvbnNdIC0tIFt0c2Mgb3B0aW9uc11cblxuZXhhbXBsZTpcbiAgdHNpY2tsZSAtLWV4dGVybnM9Zm9vL2V4dGVybnMuanMgLS0gLXAgc3JjIC0tbm9JbXBsaWNpdEFueVxuXG50c2lja2xlIGZsYWdzIGFyZTpcbiAgLS1leHRlcm5zPVBBVEggICAgIHNhdmUgZ2VuZXJhdGVkIENsb3N1cmUgZXh0ZXJucy5qcyB0byBQQVRIXG4gIC0tdHlwZWQgICAgICAgICAgICBbZXhwZXJpbWVudGFsXSBhdHRlbXB0IHRvIHByb3ZpZGUgQ2xvc3VyZSB0eXBlcyBpbnN0ZWFkIG9mIHs/fVxuYCk7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSBjb21tYW5kLWxpbmUgYXJndW1lbnRzLCBleHRyYWN0aW5nIHRoZSB0c2lja2xlIHNldHRpbmdzIGFuZFxuICogdGhlIGFyZ3VtZW50cyB0byBwYXNzIG9uIHRvIHRzYy5cbiAqL1xuZnVuY3Rpb24gbG9hZFNldHRpbmdzRnJvbUFyZ3MoYXJnczogc3RyaW5nW10pOiB7c2V0dGluZ3M6IFNldHRpbmdzLCB0c2NBcmdzOiBzdHJpbmdbXX0ge1xuICBjb25zdCBzZXR0aW5nczogU2V0dGluZ3MgPSB7fTtcbiAgY29uc3QgcGFyc2VkQXJncyA9IG1pbmltaXN0KGFyZ3MpO1xuICBmb3IgKGNvbnN0IGZsYWcgb2YgT2JqZWN0LmtleXMocGFyc2VkQXJncykpIHtcbiAgICBzd2l0Y2ggKGZsYWcpIHtcbiAgICAgIGNhc2UgJ2gnOlxuICAgICAgY2FzZSAnaGVscCc6XG4gICAgICAgIHVzYWdlKCk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdleHRlcm5zJzpcbiAgICAgICAgc2V0dGluZ3MuZXh0ZXJuc1BhdGggPSBwYXJzZWRBcmdzW2ZsYWddO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R5cGVkJzpcbiAgICAgICAgc2V0dGluZ3MuaXNUeXBlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICAgIHNldHRpbmdzLnZlcmJvc2UgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ18nOlxuICAgICAgICAvLyBUaGlzIGlzIHBhcnQgb2YgdGhlIG1pbmltaXN0IEFQSSwgYW5kIGhvbGRzIGFyZ3MgYWZ0ZXIgdGhlICctLScuXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5lcnJvcihgdW5rbm93biBmbGFnICctLSR7ZmxhZ30nYCk7XG4gICAgICAgIHVzYWdlKCk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH1cbiAgLy8gQXJndW1lbnRzIGFmdGVyIHRoZSAnLS0nIGFyZyBhcmUgYXJndW1lbnRzIHRvIHRzYy5cbiAgY29uc3QgdHNjQXJncyA9IHBhcnNlZEFyZ3NbJ18nXTtcbiAgcmV0dXJuIHtzZXR0aW5ncywgdHNjQXJnc307XG59XG5cbi8qKlxuICogTG9hZHMgdGhlIHRzY29uZmlnLmpzb24gZnJvbSBhIGRpcmVjdG9yeS5cbiAqXG4gKiBUT0RPKG1hcnRpbnByb2JzdCk6IHVzZSB0cy5maW5kQ29uZmlnRmlsZSB0byBtYXRjaCB0c2MgYmVoYXZpb3VyLlxuICpcbiAqIEBwYXJhbSBhcmdzIHRzYyBjb21tYW5kLWxpbmUgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBsb2FkVHNjQ29uZmlnKGFyZ3M6IHN0cmluZ1tdKTpcbiAgICB7b3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLCBmaWxlTmFtZXM6IHN0cmluZ1tdLCBlcnJvcnM6IHRzLkRpYWdub3N0aWNbXX0ge1xuICAvLyBHYXRoZXIgdHNjIG9wdGlvbnMvaW5wdXQgZmlsZXMgZnJvbSBjb21tYW5kIGxpbmUuXG4gIGxldCB7b3B0aW9ucywgZmlsZU5hbWVzLCBlcnJvcnN9ID0gdHMucGFyc2VDb21tYW5kTGluZShhcmdzKTtcbiAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtvcHRpb25zOiB7fSwgZmlsZU5hbWVzOiBbXSwgZXJyb3JzfTtcbiAgfVxuXG4gIC8vIFN0b3JlIGZpbGUgYXJndW1lbnRzXG4gIGNvbnN0IHRzRmlsZUFyZ3VtZW50cyA9IGZpbGVOYW1lcztcblxuICAvLyBSZWFkIGZ1cnRoZXIgc2V0dGluZ3MgZnJvbSB0c2NvbmZpZy5qc29uLlxuICBjb25zdCBwcm9qZWN0RGlyID0gb3B0aW9ucy5wcm9qZWN0IHx8ICcuJztcbiAgY29uc3QgY29uZmlnRmlsZU5hbWUgPSBwYXRoLmpvaW4ocHJvamVjdERpciwgJ3RzY29uZmlnLmpzb24nKTtcbiAgY29uc3Qge2NvbmZpZzoganNvbiwgZXJyb3J9ID1cbiAgICAgIHRzLnJlYWRDb25maWdGaWxlKGNvbmZpZ0ZpbGVOYW1lLCBwYXRoID0+IGZzLnJlYWRGaWxlU3luYyhwYXRoLCAndXRmLTgnKSk7XG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiB7b3B0aW9uczoge30sIGZpbGVOYW1lczogW10sIGVycm9yczogW2Vycm9yXX07XG4gIH1cbiAgKHtvcHRpb25zLCBmaWxlTmFtZXMsIGVycm9yc30gPVxuICAgICAgIHRzLnBhcnNlSnNvbkNvbmZpZ0ZpbGVDb250ZW50KGpzb24sIHRzLnN5cywgcHJvamVjdERpciwgb3B0aW9ucywgY29uZmlnRmlsZU5hbWUpKTtcbiAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtvcHRpb25zOiB7fSwgZmlsZU5hbWVzOiBbXSwgZXJyb3JzfTtcbiAgfVxuXG4gIC8vIGlmIGZpbGUgYXJndW1lbnRzIHdlcmUgZ2l2ZW4gdG8gdGhlIHR5cGVzY3JpcHQgdHJhbnNwaWxlciB0aGVuIHRyYW5zcGlsZSBvbmx5IHRob3NlIGZpbGVzXG4gIGZpbGVOYW1lcyA9IHRzRmlsZUFyZ3VtZW50cy5sZW5ndGggPiAwID8gdHNGaWxlQXJndW1lbnRzIDogZmlsZU5hbWVzO1xuXG4gIHJldHVybiB7b3B0aW9ucywgZmlsZU5hbWVzLCBlcnJvcnM6IFtdfTtcbn1cblxuLyoqXG4gKiBDb21waWxlcyBUeXBlU2NyaXB0IGNvZGUgaW50byBDbG9zdXJlLWNvbXBpbGVyLXJlYWR5IEpTLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9DbG9zdXJlSlMoXG4gICAgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLCBmaWxlTmFtZXM6IHN0cmluZ1tdLCBzZXR0aW5nczogU2V0dGluZ3MsXG4gICAgd3JpdGVGaWxlPzogdHMuV3JpdGVGaWxlQ2FsbGJhY2spOiB0c2lja2xlLkVtaXRSZXN1bHQge1xuICBjb25zdCBjb21waWxlckhvc3QgPSB0cy5jcmVhdGVDb21waWxlckhvc3Qob3B0aW9ucyk7XG4gIGNvbnN0IHByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKGZpbGVOYW1lcywgb3B0aW9ucywgY29tcGlsZXJIb3N0KTtcbiAgY29uc3QgdHJhbnNmb3JtZXJIb3N0OiB0c2lja2xlLlRzaWNrbGVIb3N0ID0ge1xuICAgIHNob3VsZFNraXBUc2lja2xlUHJvY2Vzc2luZzogKGZpbGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiBmaWxlTmFtZXMuaW5kZXhPZihmaWxlTmFtZSkgPT09IC0xO1xuICAgIH0sXG4gICAgc2hvdWxkSWdub3JlV2FybmluZ3NGb3JQYXRoOiAoZmlsZU5hbWU6IHN0cmluZykgPT4gZmFsc2UsXG4gICAgcGF0aFRvTW9kdWxlTmFtZTogY2xpU3VwcG9ydC5wYXRoVG9Nb2R1bGVOYW1lLFxuICAgIGZpbGVOYW1lVG9Nb2R1bGVJZDogKGZpbGVOYW1lKSA9PiBmaWxlTmFtZSxcbiAgICBlczVNb2RlOiB0cnVlLFxuICAgIGdvb2dtb2R1bGU6IHRydWUsXG4gICAgcHJlbHVkZTogJycsXG4gICAgdHJhbnNmb3JtRGVjb3JhdG9yczogdHJ1ZSxcbiAgICB0cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZTogdHJ1ZSxcbiAgICB0eXBlQmxhY2tMaXN0UGF0aHM6IG5ldyBTZXQoKSxcbiAgICB1bnR5cGVkOiBmYWxzZSxcbiAgICBsb2dXYXJuaW5nOiAod2FybmluZykgPT4gY29uc29sZS5lcnJvcih0c2lja2xlLmZvcm1hdERpYWdub3N0aWNzKFt3YXJuaW5nXSkpLFxuICAgIG9wdGlvbnMsXG4gICAgaG9zdDogY29tcGlsZXJIb3N0LFxuICB9O1xuICBjb25zdCBkaWFnbm9zdGljcyA9IHRzLmdldFByZUVtaXREaWFnbm9zdGljcyhwcm9ncmFtKTtcbiAgaWYgKGRpYWdub3N0aWNzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGlhZ25vc3RpY3MsXG4gICAgICBtb2R1bGVzTWFuaWZlc3Q6IG5ldyBNb2R1bGVzTWFuaWZlc3QoKSxcbiAgICAgIGV4dGVybnM6IHt9LFxuICAgICAgZW1pdFNraXBwZWQ6IHRydWUsXG4gICAgICBlbWl0dGVkRmlsZXM6IFtdLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHRzaWNrbGUuZW1pdFdpdGhUc2lja2xlKFxuICAgICAgcHJvZ3JhbSwgdHJhbnNmb3JtZXJIb3N0LCBjb21waWxlckhvc3QsIG9wdGlvbnMsIHVuZGVmaW5lZCwgd3JpdGVGaWxlKTtcbn1cblxuZnVuY3Rpb24gbWFpbihhcmdzOiBzdHJpbmdbXSk6IG51bWJlciB7XG4gIGNvbnN0IHtzZXR0aW5ncywgdHNjQXJnc30gPSBsb2FkU2V0dGluZ3NGcm9tQXJncyhhcmdzKTtcbiAgY29uc3QgY29uZmlnID0gbG9hZFRzY0NvbmZpZyh0c2NBcmdzKTtcbiAgaWYgKGNvbmZpZy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgY29uc29sZS5lcnJvcih0c2lja2xlLmZvcm1hdERpYWdub3N0aWNzKGNvbmZpZy5lcnJvcnMpKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmIChjb25maWcub3B0aW9ucy5tb2R1bGUgIT09IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMpIHtcbiAgICAvLyBUaGlzIGlzIG5vdCBhbiB1cHN0cmVhbSBUeXBlU2NyaXB0IGRpYWdub3N0aWMsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdCBnb1xuICAgIC8vIHRocm91Z2ggdGhlIGRpYWdub3N0aWNzIGFycmF5IG1lY2hhbmlzbS5cbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAndHNpY2tsZSBjb252ZXJ0cyBUeXBlU2NyaXB0IG1vZHVsZXMgdG8gQ2xvc3VyZSBtb2R1bGVzIHZpYSBDb21tb25KUyBpbnRlcm5hbGx5LiAnICtcbiAgICAgICAgJ1NldCB0c2NvbmZpZy5qcyBcIm1vZHVsZVwiOiBcImNvbW1vbmpzXCInKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIFJ1biB0c2lja2xlK1RTQyB0byBjb252ZXJ0IGlucHV0cyB0byBDbG9zdXJlIEpTIGZpbGVzLlxuICBjb25zdCByZXN1bHQgPSB0b0Nsb3N1cmVKUyhcbiAgICAgIGNvbmZpZy5vcHRpb25zLCBjb25maWcuZmlsZU5hbWVzLCBzZXR0aW5ncywgKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbnRlbnRzLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9KTtcbiAgICAgIH0pO1xuICBpZiAocmVzdWx0LmRpYWdub3N0aWNzLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IodHNpY2tsZS5mb3JtYXREaWFnbm9zdGljcyhyZXN1bHQuZGlhZ25vc3RpY3MpKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmIChzZXR0aW5ncy5leHRlcm5zUGF0aCkge1xuICAgIG1rZGlycC5zeW5jKHBhdGguZGlybmFtZShzZXR0aW5ncy5leHRlcm5zUGF0aCkpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoc2V0dGluZ3MuZXh0ZXJuc1BhdGgsIHRzaWNrbGUuZ2V0R2VuZXJhdGVkRXh0ZXJucyhyZXN1bHQuZXh0ZXJucykpO1xuICB9XG4gIHJldHVybiAwO1xufVxuXG4vLyBDTEkgZW50cnkgcG9pbnRcbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBwcm9jZXNzLmV4aXQobWFpbihwcm9jZXNzLmFyZ3Yuc3BsaWNlKDIpKSk7XG59XG4iXX0=