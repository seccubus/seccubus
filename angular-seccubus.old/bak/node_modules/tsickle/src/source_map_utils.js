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
        define("tsickle/src/source_map_utils", ["require", "exports", "source-map"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var source_map_1 = require("source-map");
    /**
     * Return a new RegExp object every time we want one because the
     * RegExp object has internal state that we don't want to persist
     * between different logical uses.
     */
    function getInlineSourceMapRegex() {
        return new RegExp('^//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
    }
    function containsInlineSourceMap(source) {
        return getInlineSourceMapCount(source) > 0;
    }
    exports.containsInlineSourceMap = containsInlineSourceMap;
    function getInlineSourceMapCount(source) {
        var match = source.match(getInlineSourceMapRegex());
        return match ? match.length : 0;
    }
    exports.getInlineSourceMapCount = getInlineSourceMapCount;
    function extractInlineSourceMap(source) {
        var inlineSourceMapRegex = getInlineSourceMapRegex();
        var previousResult = null;
        var result = null;
        // We want to extract the last source map in the source file
        // since that's probably the most recent one added.  We keep
        // matching against the source until we don't get a result,
        // then we use the previous result.
        do {
            previousResult = result;
            result = inlineSourceMapRegex.exec(source);
        } while (result !== null);
        var base64EncodedMap = previousResult[1];
        return Buffer.from(base64EncodedMap, 'base64').toString('utf8');
    }
    exports.extractInlineSourceMap = extractInlineSourceMap;
    function removeInlineSourceMap(source) {
        return source.replace(getInlineSourceMapRegex(), '');
    }
    exports.removeInlineSourceMap = removeInlineSourceMap;
    /**
     * Sets the source map inline in the file.  If there's an existing inline source
     * map, it clobbers it.
     */
    function setInlineSourceMap(source, sourceMap) {
        var encodedSourceMap = Buffer.from(sourceMap, 'utf8').toString('base64');
        if (containsInlineSourceMap(source)) {
            return source.replace(getInlineSourceMapRegex(), "//# sourceMappingURL=data:application/json;base64," + encodedSourceMap);
        }
        else {
            return source + "\n//# sourceMappingURL=data:application/json;base64," + encodedSourceMap;
        }
    }
    exports.setInlineSourceMap = setInlineSourceMap;
    function parseSourceMap(text, fileName, sourceName) {
        var rawSourceMap = JSON.parse(text);
        if (sourceName) {
            rawSourceMap.sources = [sourceName];
        }
        if (fileName) {
            rawSourceMap.file = fileName;
        }
        return rawSourceMap;
    }
    exports.parseSourceMap = parseSourceMap;
    function sourceMapConsumerToGenerator(sourceMapConsumer) {
        return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapConsumer);
    }
    exports.sourceMapConsumerToGenerator = sourceMapConsumerToGenerator;
    /**
     * Tsc identifies source files by their relative path to the output file.  Since
     * there's no easy way to identify these relative paths when tsickle generates its
     * own source maps, we patch them with the file name from the tsc source maps
     * before composing them.
     */
    function sourceMapGeneratorToConsumer(sourceMapGenerator, fileName, sourceName) {
        var rawSourceMap = sourceMapGenerator.toJSON();
        if (sourceName) {
            rawSourceMap.sources = [sourceName];
        }
        if (fileName) {
            rawSourceMap.file = fileName;
        }
        return new source_map_1.SourceMapConsumer(rawSourceMap);
    }
    exports.sourceMapGeneratorToConsumer = sourceMapGeneratorToConsumer;
    function sourceMapTextToConsumer(sourceMapText) {
        // the SourceMapConsumer constructor returns a BasicSourceMapConsumer or an
        // IndexedSourceMapConsumer depending on if you pass in a RawSourceMap or a
        // RawIndexMap or the string json of either.  In this case we're passing in
        // the string for a RawSourceMap, so we always get a BasicSourceMapConsumer
        return new source_map_1.SourceMapConsumer(sourceMapText);
    }
    exports.sourceMapTextToConsumer = sourceMapTextToConsumer;
    function sourceMapTextToGenerator(sourceMapText) {
        return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapTextToConsumer(sourceMapText));
    }
    exports.sourceMapTextToGenerator = sourceMapTextToGenerator;
    exports.NOOP_SOURCE_MAPPER = {
        shiftByOffset: function () { },
        addMapping: function () { },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcF91dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zb3VyY2VfbWFwX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgseUNBQXVHO0lBR3ZHOzs7O09BSUc7SUFDSDtRQUNFLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQywwREFBMEQsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsaUNBQXdDLE1BQWM7UUFDcEQsTUFBTSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRkQsMERBRUM7SUFFRCxpQ0FBd0MsTUFBYztRQUNwRCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUN0RCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUhELDBEQUdDO0lBRUQsZ0NBQXVDLE1BQWM7UUFDbkQsSUFBTSxvQkFBb0IsR0FBRyx1QkFBdUIsRUFBRSxDQUFDO1FBQ3ZELElBQUksY0FBYyxHQUF5QixJQUFJLENBQUM7UUFDaEQsSUFBSSxNQUFNLEdBQXlCLElBQUksQ0FBQztRQUN4Qyw0REFBNEQ7UUFDNUQsNERBQTREO1FBQzVELDJEQUEyRDtRQUMzRCxtQ0FBbUM7UUFDbkMsR0FBRyxDQUFDO1lBQ0YsY0FBYyxHQUFHLE1BQU0sQ0FBQztZQUN4QixNQUFNLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLENBQUMsUUFBUSxNQUFNLEtBQUssSUFBSSxFQUFFO1FBQzFCLElBQU0sZ0JBQWdCLEdBQUcsY0FBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBZEQsd0RBY0M7SUFFRCwrQkFBc0MsTUFBYztRQUNsRCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFGRCxzREFFQztJQUVEOzs7T0FHRztJQUNILDRCQUFtQyxNQUFjLEVBQUUsU0FBaUI7UUFDbEUsSUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0UsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUNqQix1QkFBdUIsRUFBRSxFQUN6Qix1REFBcUQsZ0JBQWtCLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUksTUFBTSw0REFBdUQsZ0JBQWtCLENBQUM7UUFDNUYsQ0FBQztJQUNILENBQUM7SUFURCxnREFTQztJQUVELHdCQUErQixJQUFZLEVBQUUsUUFBaUIsRUFBRSxVQUFtQjtRQUNqRixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBaUIsQ0FBQztRQUN0RCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2YsWUFBWSxDQUFDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2IsWUFBWSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7UUFDL0IsQ0FBQztRQUNELE1BQU0sQ0FBQyxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQVRELHdDQVNDO0lBRUQsc0NBQTZDLGlCQUFvQztRQUUvRSxNQUFNLENBQUMsK0JBQWtCLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUhELG9FQUdDO0lBRUQ7Ozs7O09BS0c7SUFDSCxzQ0FDSSxrQkFBc0MsRUFBRSxRQUFpQixFQUN6RCxVQUFtQjtRQUNyQixJQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqRCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2YsWUFBWSxDQUFDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2IsWUFBWSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7UUFDL0IsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLDhCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFYRCxvRUFXQztJQUVELGlDQUF3QyxhQUFxQjtRQUMzRCwyRUFBMkU7UUFDM0UsMkVBQTJFO1FBQzNFLDJFQUEyRTtRQUMzRSwyRUFBMkU7UUFDM0UsTUFBTSxDQUFDLElBQUksOEJBQWlCLENBQUMsYUFBYSxDQUEyQixDQUFDO0lBQ3hFLENBQUM7SUFORCwwREFNQztJQUVELGtDQUF5QyxhQUFxQjtRQUM1RCxNQUFNLENBQUMsK0JBQWtCLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUZELDREQUVDO0lBZ0NZLFFBQUEsa0JBQWtCLEdBQWlCO1FBQzlDLGFBQWEsZ0JBQWUsQ0FBQztRQUM3QixVQUFVLGdCQUFlLENBQUM7S0FDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCYXNpY1NvdXJjZU1hcENvbnN1bWVyLCBSYXdTb3VyY2VNYXAsIFNvdXJjZU1hcENvbnN1bWVyLCBTb3VyY2VNYXBHZW5lcmF0b3J9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBSZXR1cm4gYSBuZXcgUmVnRXhwIG9iamVjdCBldmVyeSB0aW1lIHdlIHdhbnQgb25lIGJlY2F1c2UgdGhlXG4gKiBSZWdFeHAgb2JqZWN0IGhhcyBpbnRlcm5hbCBzdGF0ZSB0aGF0IHdlIGRvbid0IHdhbnQgdG8gcGVyc2lzdFxuICogYmV0d2VlbiBkaWZmZXJlbnQgbG9naWNhbCB1c2VzLlxuICovXG5mdW5jdGlvbiBnZXRJbmxpbmVTb3VyY2VNYXBSZWdleCgpOiBSZWdFeHAge1xuICByZXR1cm4gbmV3IFJlZ0V4cCgnXi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsKC4qKSQnLCAnbWcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zSW5saW5lU291cmNlTWFwKHNvdXJjZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBnZXRJbmxpbmVTb3VyY2VNYXBDb3VudChzb3VyY2UpID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElubGluZVNvdXJjZU1hcENvdW50KHNvdXJjZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgY29uc3QgbWF0Y2ggPSBzb3VyY2UubWF0Y2goZ2V0SW5saW5lU291cmNlTWFwUmVnZXgoKSk7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoLmxlbmd0aCA6IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0SW5saW5lU291cmNlTWFwKHNvdXJjZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaW5saW5lU291cmNlTWFwUmVnZXggPSBnZXRJbmxpbmVTb3VyY2VNYXBSZWdleCgpO1xuICBsZXQgcHJldmlvdXNSZXN1bHQ6IFJlZ0V4cEV4ZWNBcnJheXxudWxsID0gbnVsbDtcbiAgbGV0IHJlc3VsdDogUmVnRXhwRXhlY0FycmF5fG51bGwgPSBudWxsO1xuICAvLyBXZSB3YW50IHRvIGV4dHJhY3QgdGhlIGxhc3Qgc291cmNlIG1hcCBpbiB0aGUgc291cmNlIGZpbGVcbiAgLy8gc2luY2UgdGhhdCdzIHByb2JhYmx5IHRoZSBtb3N0IHJlY2VudCBvbmUgYWRkZWQuICBXZSBrZWVwXG4gIC8vIG1hdGNoaW5nIGFnYWluc3QgdGhlIHNvdXJjZSB1bnRpbCB3ZSBkb24ndCBnZXQgYSByZXN1bHQsXG4gIC8vIHRoZW4gd2UgdXNlIHRoZSBwcmV2aW91cyByZXN1bHQuXG4gIGRvIHtcbiAgICBwcmV2aW91c1Jlc3VsdCA9IHJlc3VsdDtcbiAgICByZXN1bHQgPSBpbmxpbmVTb3VyY2VNYXBSZWdleC5leGVjKHNvdXJjZSk7XG4gIH0gd2hpbGUgKHJlc3VsdCAhPT0gbnVsbCk7XG4gIGNvbnN0IGJhc2U2NEVuY29kZWRNYXAgPSBwcmV2aW91c1Jlc3VsdCFbMV07XG4gIHJldHVybiBCdWZmZXIuZnJvbShiYXNlNjRFbmNvZGVkTWFwLCAnYmFzZTY0JykudG9TdHJpbmcoJ3V0ZjgnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUlubGluZVNvdXJjZU1hcChzb3VyY2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzb3VyY2UucmVwbGFjZShnZXRJbmxpbmVTb3VyY2VNYXBSZWdleCgpLCAnJyk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc291cmNlIG1hcCBpbmxpbmUgaW4gdGhlIGZpbGUuICBJZiB0aGVyZSdzIGFuIGV4aXN0aW5nIGlubGluZSBzb3VyY2VcbiAqIG1hcCwgaXQgY2xvYmJlcnMgaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRJbmxpbmVTb3VyY2VNYXAoc291cmNlOiBzdHJpbmcsIHNvdXJjZU1hcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZW5jb2RlZFNvdXJjZU1hcCA9IEJ1ZmZlci5mcm9tKHNvdXJjZU1hcCwgJ3V0ZjgnKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gIGlmIChjb250YWluc0lubGluZVNvdXJjZU1hcChzb3VyY2UpKSB7XG4gICAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKFxuICAgICAgICBnZXRJbmxpbmVTb3VyY2VNYXBSZWdleCgpLFxuICAgICAgICBgLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwke2VuY29kZWRTb3VyY2VNYXB9YCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGAke3NvdXJjZX1cXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCR7ZW5jb2RlZFNvdXJjZU1hcH1gO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNvdXJjZU1hcCh0ZXh0OiBzdHJpbmcsIGZpbGVOYW1lPzogc3RyaW5nLCBzb3VyY2VOYW1lPzogc3RyaW5nKTogUmF3U291cmNlTWFwIHtcbiAgY29uc3QgcmF3U291cmNlTWFwID0gSlNPTi5wYXJzZSh0ZXh0KSBhcyBSYXdTb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VOYW1lKSB7XG4gICAgcmF3U291cmNlTWFwLnNvdXJjZXMgPSBbc291cmNlTmFtZV07XG4gIH1cbiAgaWYgKGZpbGVOYW1lKSB7XG4gICAgcmF3U291cmNlTWFwLmZpbGUgPSBmaWxlTmFtZTtcbiAgfVxuICByZXR1cm4gcmF3U291cmNlTWFwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc291cmNlTWFwQ29uc3VtZXJUb0dlbmVyYXRvcihzb3VyY2VNYXBDb25zdW1lcjogU291cmNlTWFwQ29uc3VtZXIpOlxuICAgIFNvdXJjZU1hcEdlbmVyYXRvciB7XG4gIHJldHVybiBTb3VyY2VNYXBHZW5lcmF0b3IuZnJvbVNvdXJjZU1hcChzb3VyY2VNYXBDb25zdW1lcik7XG59XG5cbi8qKlxuICogVHNjIGlkZW50aWZpZXMgc291cmNlIGZpbGVzIGJ5IHRoZWlyIHJlbGF0aXZlIHBhdGggdG8gdGhlIG91dHB1dCBmaWxlLiAgU2luY2VcbiAqIHRoZXJlJ3Mgbm8gZWFzeSB3YXkgdG8gaWRlbnRpZnkgdGhlc2UgcmVsYXRpdmUgcGF0aHMgd2hlbiB0c2lja2xlIGdlbmVyYXRlcyBpdHNcbiAqIG93biBzb3VyY2UgbWFwcywgd2UgcGF0Y2ggdGhlbSB3aXRoIHRoZSBmaWxlIG5hbWUgZnJvbSB0aGUgdHNjIHNvdXJjZSBtYXBzXG4gKiBiZWZvcmUgY29tcG9zaW5nIHRoZW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzb3VyY2VNYXBHZW5lcmF0b3JUb0NvbnN1bWVyKFxuICAgIHNvdXJjZU1hcEdlbmVyYXRvcjogU291cmNlTWFwR2VuZXJhdG9yLCBmaWxlTmFtZT86IHN0cmluZyxcbiAgICBzb3VyY2VOYW1lPzogc3RyaW5nKTogU291cmNlTWFwQ29uc3VtZXIge1xuICBjb25zdCByYXdTb3VyY2VNYXAgPSBzb3VyY2VNYXBHZW5lcmF0b3IudG9KU09OKCk7XG4gIGlmIChzb3VyY2VOYW1lKSB7XG4gICAgcmF3U291cmNlTWFwLnNvdXJjZXMgPSBbc291cmNlTmFtZV07XG4gIH1cbiAgaWYgKGZpbGVOYW1lKSB7XG4gICAgcmF3U291cmNlTWFwLmZpbGUgPSBmaWxlTmFtZTtcbiAgfVxuICByZXR1cm4gbmV3IFNvdXJjZU1hcENvbnN1bWVyKHJhd1NvdXJjZU1hcCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb3VyY2VNYXBUZXh0VG9Db25zdW1lcihzb3VyY2VNYXBUZXh0OiBzdHJpbmcpOiBCYXNpY1NvdXJjZU1hcENvbnN1bWVyIHtcbiAgLy8gdGhlIFNvdXJjZU1hcENvbnN1bWVyIGNvbnN0cnVjdG9yIHJldHVybnMgYSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyIG9yIGFuXG4gIC8vIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lciBkZXBlbmRpbmcgb24gaWYgeW91IHBhc3MgaW4gYSBSYXdTb3VyY2VNYXAgb3IgYVxuICAvLyBSYXdJbmRleE1hcCBvciB0aGUgc3RyaW5nIGpzb24gb2YgZWl0aGVyLiAgSW4gdGhpcyBjYXNlIHdlJ3JlIHBhc3NpbmcgaW5cbiAgLy8gdGhlIHN0cmluZyBmb3IgYSBSYXdTb3VyY2VNYXAsIHNvIHdlIGFsd2F5cyBnZXQgYSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyXG4gIHJldHVybiBuZXcgU291cmNlTWFwQ29uc3VtZXIoc291cmNlTWFwVGV4dCkgYXMgQmFzaWNTb3VyY2VNYXBDb25zdW1lcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvdXJjZU1hcFRleHRUb0dlbmVyYXRvcihzb3VyY2VNYXBUZXh0OiBzdHJpbmcpOiBTb3VyY2VNYXBHZW5lcmF0b3Ige1xuICByZXR1cm4gU291cmNlTWFwR2VuZXJhdG9yLmZyb21Tb3VyY2VNYXAoc291cmNlTWFwVGV4dFRvQ29uc3VtZXIoc291cmNlTWFwVGV4dCkpO1xufVxuXG4vKipcbiAqIEEgcG9zaXRpb24gaW4gYSBzb3VyY2UgbWFwLiBBbGwgb2Zmc2V0cyBhcmUgemVyby1iYXNlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTb3VyY2VQb3NpdGlvbiB7XG4gIC8qKiAwIGJhc2VkICovXG4gIGNvbHVtbjogbnVtYmVyO1xuICAvKiogMCBiYXNlZCAqL1xuICBsaW5lOiBudW1iZXI7XG4gIC8qKiAwIGJhc2VkIGZ1bGwgb2Zmc2V0IGluIHRoZSBmaWxlLiAqL1xuICBwb3NpdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZU1hcHBlciB7XG4gIC8qKlxuICAgKiBMb2dpY2FsbHkgc2hpZnQgYWxsIHNvdXJjZSBwb3NpdGlvbnMgYnkgYG9mZnNldGAuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHVzZWZ1bCBpZiBjb2RlIGhhcyB0byBwcmVwZW5kIGFkZGl0aW9uYWwgdGV4dCB0byB0aGUgZ2VuZXJhdGVkIG91dHB1dCBhZnRlclxuICAgKiBzb3VyY2UgbWFwcGluZ3MgaGF2ZSBhbHJlYWR5IGJlZW4gZ2VuZXJhdGVkLiBUaGUgc291cmNlIG1hcHMgYXJlIHRoZW4gdHJhbnNwYXJlbnRseSBhZGp1c3RlZFxuICAgKiBkdXJpbmcgVHlwZVNjcmlwdCBvdXRwdXQgZ2VuZXJhdGlvbi5cbiAgICovXG4gIHNoaWZ0QnlPZmZzZXQob2Zmc2V0OiBudW1iZXIpOiB2b2lkO1xuICAvKipcbiAgICogQWRkcyBhIG1hcHBpbmcgZnJvbSBgb3JpZ2luYWxOb2RlYCBpbiBgb3JpZ2luYWxgIHBvc2l0aW9uIHRvIGl0cyBuZXcgbG9jYXRpb24gaW4gdGhlIG91dHB1dCxcbiAgICogc3Bhbm5pbmcgZnJvbSBgZ2VuZXJhdGVkYCAoYW4gb2Zmc2V0IGluIHRoZSBmaWxlKSBmb3IgYGxlbmd0aGAgY2hhcmFjdGVycy5cbiAgICovXG4gIGFkZE1hcHBpbmcoXG4gICAgICBvcmlnaW5hbE5vZGU6IHRzLk5vZGUsIG9yaWdpbmFsOiBTb3VyY2VQb3NpdGlvbiwgZ2VuZXJhdGVkOiBTb3VyY2VQb3NpdGlvbixcbiAgICAgIGxlbmd0aDogbnVtYmVyKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IE5PT1BfU09VUkNFX01BUFBFUjogU291cmNlTWFwcGVyID0ge1xuICBzaGlmdEJ5T2Zmc2V0KCkgey8qIG5vLW9wICovfSxcbiAgYWRkTWFwcGluZygpIHsvKiBuby1vcCAqL30sXG59O1xuIl19