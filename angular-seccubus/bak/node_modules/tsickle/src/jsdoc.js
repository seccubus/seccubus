/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/jsdoc", ["require", "exports", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("tsickle/src/util");
    /**
     * A list of all JSDoc tags allowed by the Closure compiler.
     * The public Closure docs don't list all the tags it allows; this list comes
     * from the compiler source itself.
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/Annotation.java
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/ParserConfig.properties
     */
    var JSDOC_TAGS_WHITELIST = new Set([
        'abstract', 'argument',
        'author', 'consistentIdGenerator',
        'const', 'constant',
        'constructor', 'copyright',
        'define', 'deprecated',
        'desc', 'dict',
        'disposes', 'enhance',
        'enhanceable', 'enum',
        'export', 'expose',
        'extends', 'externs',
        'fileoverview', 'final',
        'hassoydelcall', 'hassoydeltemplate',
        'hidden', 'id',
        'idGenerator', 'ignore',
        'implements', 'implicitCast',
        'inheritDoc', 'interface',
        'jaggerInject', 'jaggerModule',
        'jaggerProvide', 'jaggerProvidePromise',
        'lends', 'license',
        'link', 'meaning',
        'modifies', 'modName',
        'mods', 'ngInject',
        'noalias', 'nocollapse',
        'nocompile', 'nosideeffects',
        'override', 'owner',
        'package', 'param',
        'pintomodule', 'polymerBehavior',
        'preserve', 'preserveTry',
        'private', 'protected',
        'public', 'record',
        'requirecss', 'requires',
        'return', 'returns',
        'see', 'stableIdGenerator',
        'struct', 'suppress',
        'template', 'this',
        'throws', 'type',
        'typedef', 'unrestricted',
        'version', 'wizaction',
        'wizmodule',
    ]);
    /**
     * A list of JSDoc @tags that are never allowed in TypeScript source. These are Closure tags that
     * can be expressed in the TypeScript surface syntax. As tsickle's emit will mangle type names,
     * these will cause Closure Compiler issues and should not be used.
     */
    var JSDOC_TAGS_BLACKLIST = new Set([
        'augments', 'class', 'constructs', 'constructor', 'enum', 'extends', 'field',
        'function', 'implements', 'interface', 'lends', 'namespace', 'private', 'public',
        'record', 'static', 'template', 'this', 'type', 'typedef',
    ]);
    /**
     * A list of JSDoc @tags that might include a {type} after them. Only banned when a type is passed.
     * Note that this does not include tags that carry a non-type system type, e.g. \@suppress.
     */
    var JSDOC_TAGS_WITH_TYPES = new Set([
        'const',
        'export',
        'param',
        'return',
    ]);
    /**
     * parse parses JSDoc out of a comment string.
     * Returns null if comment is not JSDoc.
     */
    // TODO(martinprobst): representing JSDoc as a list of tags is too simplistic. We need functionality
    // such as merging (below), de-duplicating certain tags (@deprecated), and special treatment for
    // others (e.g. @suppress). We should introduce a proper model class with a more suitable data
    // strucure (e.g. a Map<TagName, Values[]>).
    function parse(comment) {
        // Make sure we have proper line endings before parsing on Windows.
        comment = util_1.normalizeLineEndings(comment);
        // TODO(evanm): this is a pile of hacky regexes for now, because we
        // would rather use the better TypeScript implementation of JSDoc
        // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
        var match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
        if (!match)
            return null;
        return parseContents(match[1].trim());
    }
    exports.parse = parse;
    /**
     * parseContents parses JSDoc out of a comment text.
     * Returns null if comment is not JSDoc.
     *
     * @param commentText a comment's text content, i.e. the comment w/o /* and * /.
     */
    function parseContents(commentText) {
        // Make sure we have proper line endings before parsing on Windows.
        commentText = util_1.normalizeLineEndings(commentText);
        // Strip all the " * " bits from the front of each line.
        commentText = commentText.replace(/^\s*\*? ?/gm, '');
        var lines = commentText.split('\n');
        var tags = [];
        var warnings = [];
        try {
            for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                var line = lines_1_1.value;
                var match = line.match(/^@(\S+) *(.*)/);
                if (match) {
                    var _a = __read(match, 3), _ = _a[0], tagName = _a[1], text = _a[2];
                    if (tagName === 'returns') {
                        // A synonym for 'return'.
                        tagName = 'return';
                    }
                    var type = void 0;
                    if (JSDOC_TAGS_BLACKLIST.has(tagName)) {
                        warnings.push("@" + tagName + " annotations are redundant with TypeScript equivalents");
                        continue; // Drop the tag so Closure won't process it.
                    }
                    else if (JSDOC_TAGS_WITH_TYPES.has(tagName) && text[0] === '{') {
                        warnings.push("the type annotation on @" + tagName + " is redundant with its TypeScript type, " +
                            "remove the {...} part");
                        continue;
                    }
                    else if (tagName === 'suppress') {
                        var suppressMatch = text.match(/^\{(.*)\}(.*)$/);
                        if (!suppressMatch) {
                            warnings.push("malformed @suppress tag: \"" + text + "\"");
                        }
                        else {
                            _b = __read(suppressMatch, 3), type = _b[1], text = _b[2];
                        }
                    }
                    else if (tagName === 'dict') {
                        warnings.push('use index signatures (`[k: string]: type`) instead of @dict');
                        continue;
                    }
                    // Grab the parameter name from @param tags.
                    var parameterName = void 0;
                    if (tagName === 'param') {
                        match = text.match(/^(\S+) ?(.*)/);
                        if (match)
                            _c = __read(match, 3), _ = _c[0], parameterName = _c[1], text = _c[2];
                    }
                    var tag = { tagName: tagName };
                    if (parameterName)
                        tag.parameterName = parameterName;
                    if (text)
                        tag.text = text;
                    if (type)
                        tag.type = type;
                    tags.push(tag);
                }
                else {
                    // Text without a preceding @tag on it is either the plain text
                    // documentation or a continuation of a previous tag.
                    if (tags.length === 0) {
                        tags.push({ tagName: '', text: line });
                    }
                    else {
                        var lastTag = tags[tags.length - 1];
                        lastTag.text = (lastTag.text || '') + '\n' + line;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lines_1_1 && !lines_1_1.done && (_d = lines_1.return)) _d.call(lines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (warnings.length > 0) {
            return { tags: tags, warnings: warnings };
        }
        return { tags: tags };
        var e_1, _d, _b, _c;
    }
    exports.parseContents = parseContents;
    /**
     * Serializes a Tag into a string usable in a comment.
     * Returns a string like " @foo {bar} baz" (note the whitespace).
     */
    function tagToString(tag, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        var out = '';
        if (tag.tagName) {
            if (!JSDOC_TAGS_WHITELIST.has(tag.tagName) || escapeExtraTags.has(tag.tagName)) {
                // Escape tags we don't understand.  This is a subtle
                // compromise between multiple issues.
                // 1) If we pass through these non-Closure tags, the user will
                //    get a warning from Closure, and the point of tsickle is
                //    to insulate the user from Closure.
                // 2) The output of tsickle is for Closure but also may be read
                //    by humans, for example non-TypeScript users of Angular.
                // 3) Finally, we don't want to warn because users should be
                //    free to add whichever JSDoc they feel like.  If the user
                //    wants help ensuring they didn't typo a tag, that is the
                //    responsibility of a linter.
                out += " \\@" + tag.tagName;
            }
            else {
                out += " @" + tag.tagName;
            }
        }
        if (tag.type) {
            out += ' {';
            if (tag.restParam) {
                out += '...';
            }
            out += tag.type;
            if (tag.optional) {
                out += '=';
            }
            out += '}';
        }
        if (tag.parameterName) {
            out += ' ' + tag.parameterName;
        }
        if (tag.text) {
            out += ' ' + tag.text.replace(/@/g, '\\@');
        }
        return out;
    }
    /** Tags that must only occur onces in a comment (filtered below). */
    var SINGLETON_TAGS = new Set(['deprecated']);
    /** Serializes a Comment out to a string, but does not include the start and end comment tokens. */
    function toStringWithoutStartEnd(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, false, escapeExtraTags);
    }
    exports.toStringWithoutStartEnd = toStringWithoutStartEnd;
    /** Serializes a Comment out to a string usable in source code. */
    function toString(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, true, escapeExtraTags);
    }
    exports.toString = toString;
    function serialize(tags, includeStartEnd, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        if (tags.length === 0)
            return '';
        if (tags.length === 1) {
            var tag = tags[0];
            if ((tag.tagName === 'type' || tag.tagName === 'nocollapse') &&
                (!tag.text || !tag.text.match('\n'))) {
                // Special-case one-liner "type" and "nocollapse" tags to fit on one line, e.g.
                //   /** @type {foo} */
                return '/**' + tagToString(tag, escapeExtraTags) + ' */\n';
            }
            // Otherwise, fall through to the multi-line output.
        }
        var out = includeStartEnd ? '/**\n' : '*\n';
        var emitted = new Set();
        try {
            for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                var tag = tags_1_1.value;
                if (emitted.has(tag.tagName) && SINGLETON_TAGS.has(tag.tagName)) {
                    continue;
                }
                emitted.add(tag.tagName);
                out += ' *';
                // If the tagToString is multi-line, insert " * " prefixes on subsequent lines.
                out += tagToString(tag, escapeExtraTags).split('\n').join('\n * ');
                out += '\n';
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        out += includeStartEnd ? ' */\n' : ' ';
        return out;
        var e_2, _a;
    }
    /** Merges multiple tags (of the same tagName type) into a single unified tag. */
    function merge(tags) {
        var tagNames = new Set();
        var parameterNames = new Set();
        var types = new Set();
        var texts = new Set();
        // If any of the tags are optional/rest, then the merged output is optional/rest.
        var optional = false;
        var restParam = false;
        try {
            for (var tags_2 = __values(tags), tags_2_1 = tags_2.next(); !tags_2_1.done; tags_2_1 = tags_2.next()) {
                var tag_1 = tags_2_1.value;
                if (tag_1.tagName)
                    tagNames.add(tag_1.tagName);
                if (tag_1.parameterName)
                    parameterNames.add(tag_1.parameterName);
                if (tag_1.type)
                    types.add(tag_1.type);
                if (tag_1.text)
                    texts.add(tag_1.text);
                if (tag_1.optional)
                    optional = true;
                if (tag_1.restParam)
                    restParam = true;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (tags_2_1 && !tags_2_1.done && (_a = tags_2.return)) _a.call(tags_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (tagNames.size !== 1) {
            throw new Error("cannot merge differing tags: " + JSON.stringify(tags));
        }
        var tagName = tagNames.values().next().value;
        var parameterName = parameterNames.size > 0 ? Array.from(parameterNames).join('_or_') : undefined;
        var type = types.size > 0 ? Array.from(types).join('|') : undefined;
        var text = texts.size > 0 ? Array.from(texts).join(' / ') : undefined;
        var tag = { tagName: tagName, parameterName: parameterName, type: type, text: text };
        // Note: a param can either be optional or a rest param; if we merged an
        // optional and rest param together, prefer marking it as a rest param.
        if (restParam) {
            tag.restParam = true;
        }
        else if (optional) {
            tag.optional = true;
        }
        return tag;
        var e_3, _a;
    }
    exports.merge = merge;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNkb2MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvanNkb2MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUE0QztJQXNDNUM7Ozs7OztPQU1HO0lBQ0gsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNuQyxVQUFVLEVBQU8sVUFBVTtRQUMzQixRQUFRLEVBQVMsdUJBQXVCO1FBQ3hDLE9BQU8sRUFBVSxVQUFVO1FBQzNCLGFBQWEsRUFBSSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxZQUFZO1FBQzdCLE1BQU0sRUFBVyxNQUFNO1FBQ3ZCLFVBQVUsRUFBTyxTQUFTO1FBQzFCLGFBQWEsRUFBSSxNQUFNO1FBQ3ZCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFNBQVMsRUFBUSxTQUFTO1FBQzFCLGNBQWMsRUFBRyxPQUFPO1FBQ3hCLGVBQWUsRUFBRSxtQkFBbUI7UUFDcEMsUUFBUSxFQUFTLElBQUk7UUFDckIsYUFBYSxFQUFJLFFBQVE7UUFDekIsWUFBWSxFQUFLLGNBQWM7UUFDL0IsWUFBWSxFQUFLLFdBQVc7UUFDNUIsY0FBYyxFQUFHLGNBQWM7UUFDL0IsZUFBZSxFQUFFLHNCQUFzQjtRQUN2QyxPQUFPLEVBQVUsU0FBUztRQUMxQixNQUFNLEVBQVcsU0FBUztRQUMxQixVQUFVLEVBQU8sU0FBUztRQUMxQixNQUFNLEVBQVcsVUFBVTtRQUMzQixTQUFTLEVBQVEsWUFBWTtRQUM3QixXQUFXLEVBQU0sZUFBZTtRQUNoQyxVQUFVLEVBQU8sT0FBTztRQUN4QixTQUFTLEVBQVEsT0FBTztRQUN4QixhQUFhLEVBQUksaUJBQWlCO1FBQ2xDLFVBQVUsRUFBTyxhQUFhO1FBQzlCLFNBQVMsRUFBUSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFlBQVksRUFBSyxVQUFVO1FBQzNCLFFBQVEsRUFBUyxTQUFTO1FBQzFCLEtBQUssRUFBWSxtQkFBbUI7UUFDcEMsUUFBUSxFQUFTLFVBQVU7UUFDM0IsVUFBVSxFQUFPLE1BQU07UUFDdkIsUUFBUSxFQUFTLE1BQU07UUFDdkIsU0FBUyxFQUFRLGNBQWM7UUFDL0IsU0FBUyxFQUFRLFdBQVc7UUFDNUIsV0FBVztLQUNaLENBQUMsQ0FBQztJQUVIOzs7O09BSUc7SUFDSCxJQUFNLG9CQUFvQixHQUFHLElBQUksR0FBRyxDQUFDO1FBQ25DLFVBQVUsRUFBRSxPQUFPLEVBQU8sWUFBWSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQU8sU0FBUyxFQUFFLE9BQU87UUFDdEYsVUFBVSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUcsT0FBTyxFQUFRLFdBQVcsRUFBRSxTQUFTLEVBQUUsUUFBUTtRQUN2RixRQUFRLEVBQUksUUFBUSxFQUFNLFVBQVUsRUFBSSxNQUFNLEVBQVMsTUFBTSxFQUFPLFNBQVM7S0FDOUUsQ0FBQyxDQUFDO0lBRUg7OztPQUdHO0lBQ0gsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNwQyxPQUFPO1FBQ1AsUUFBUTtRQUNSLE9BQU87UUFDUCxRQUFRO0tBQ1QsQ0FBQyxDQUFDO0lBWUg7OztPQUdHO0lBQ0gsb0dBQW9HO0lBQ3BHLGdHQUFnRztJQUNoRyw4RkFBOEY7SUFDOUYsNENBQTRDO0lBQzVDLGVBQXNCLE9BQWU7UUFDbkMsbUVBQW1FO1FBQ25FLE9BQU8sR0FBRywyQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxtRUFBbUU7UUFDbkUsaUVBQWlFO1FBQ2pFLGdFQUFnRTtRQUNoRSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQVRELHNCQVNDO0lBRUQ7Ozs7O09BS0c7SUFDSCx1QkFBOEIsV0FBbUI7UUFDL0MsbUVBQW1FO1FBQ25FLFdBQVcsR0FBRywyQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoRCx3REFBd0Q7UUFDeEQsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELElBQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBTSxJQUFJLEdBQVUsRUFBRSxDQUFDO1FBQ3ZCLElBQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQzs7WUFDOUIsR0FBRyxDQUFDLENBQWUsSUFBQSxVQUFBLFNBQUEsS0FBSyxDQUFBLDRCQUFBO2dCQUFuQixJQUFNLElBQUksa0JBQUE7Z0JBQ2IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDeEMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDTixJQUFBLHFCQUEwQixFQUF6QixTQUFDLEVBQUUsZUFBTyxFQUFFLFlBQUksQ0FBVTtvQkFDL0IsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLDBCQUEwQjt3QkFDMUIsT0FBTyxHQUFHLFFBQVEsQ0FBQztvQkFDckIsQ0FBQztvQkFDRCxJQUFJLElBQUksU0FBa0IsQ0FBQztvQkFDM0IsRUFBRSxDQUFDLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFJLE9BQU8sMkRBQXdELENBQUMsQ0FBQzt3QkFDbkYsUUFBUSxDQUFDLENBQUUsNENBQTRDO29CQUN6RCxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2pFLFFBQVEsQ0FBQyxJQUFJLENBQ1QsNkJBQTJCLE9BQU8sNkNBQTBDOzRCQUM1RSx1QkFBdUIsQ0FBQyxDQUFDO3dCQUM3QixRQUFRLENBQUM7b0JBQ1gsQ0FBQztvQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ2xDLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLGdDQUE2QixJQUFJLE9BQUcsQ0FBQyxDQUFDO3dCQUN0RCxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNOLDZCQUE4QixFQUEzQixZQUFJLEVBQUUsWUFBSSxDQUFrQjt3QkFDakMsQ0FBQztvQkFDSCxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDOUIsUUFBUSxDQUFDLElBQUksQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO3dCQUM3RSxRQUFRLENBQUM7b0JBQ1gsQ0FBQztvQkFFRCw0Q0FBNEM7b0JBQzVDLElBQUksYUFBYSxTQUFrQixDQUFDO29CQUNwQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQ25DLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQzs0QkFBQyxxQkFBZ0MsRUFBL0IsU0FBQyxFQUFFLHFCQUFhLEVBQUUsWUFBSSxDQUFVO29CQUM5QyxDQUFDO29CQUVELElBQU0sR0FBRyxHQUFRLEVBQUMsT0FBTyxTQUFBLEVBQUMsQ0FBQztvQkFDM0IsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDO3dCQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO29CQUNyRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTiwrREFBK0Q7b0JBQy9ELHFEQUFxRDtvQkFDckQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztvQkFDdkMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDdEMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDcEQsQ0FBQztnQkFDSCxDQUFDO2FBQ0Y7Ozs7Ozs7OztRQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsRUFBQyxJQUFJLE1BQUEsRUFBRSxRQUFRLFVBQUEsRUFBQyxDQUFDO1FBQzFCLENBQUM7UUFDRCxNQUFNLENBQUMsRUFBQyxJQUFJLE1BQUEsRUFBQyxDQUFDOztJQUNoQixDQUFDO0lBaEVELHNDQWdFQztJQUVEOzs7T0FHRztJQUNILHFCQUFxQixHQUFRLEVBQUUsZUFBbUM7UUFBbkMsZ0NBQUEsRUFBQSxzQkFBc0IsR0FBRyxFQUFVO1FBQ2hFLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLHFEQUFxRDtnQkFDckQsc0NBQXNDO2dCQUN0Qyw4REFBOEQ7Z0JBQzlELDZEQUE2RDtnQkFDN0Qsd0NBQXdDO2dCQUN4QywrREFBK0Q7Z0JBQy9ELDZEQUE2RDtnQkFDN0QsNERBQTREO2dCQUM1RCw4REFBOEQ7Z0JBQzlELDZEQUE2RDtnQkFDN0QsaUNBQWlDO2dCQUNqQyxHQUFHLElBQUksU0FBTyxHQUFHLENBQUMsT0FBUyxDQUFDO1lBQzlCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixHQUFHLElBQUksT0FBSyxHQUFHLENBQUMsT0FBUyxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDYixHQUFHLElBQUksSUFBSSxDQUFDO1lBQ1osRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLEdBQUcsSUFBSSxLQUFLLENBQUM7WUFDZixDQUFDO1lBQ0QsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDaEIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDYixDQUFDO1lBQ0QsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNiLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN0QixHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUM7UUFDakMsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2IsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLElBQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUUvQyxtR0FBbUc7SUFDbkcsaUNBQXdDLElBQVcsRUFBRSxlQUFtQztRQUFuQyxnQ0FBQSxFQUFBLHNCQUFzQixHQUFHLEVBQVU7UUFDdEYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFGRCwwREFFQztJQUVELGtFQUFrRTtJQUNsRSxrQkFBeUIsSUFBVyxFQUFFLGVBQW1DO1FBQW5DLGdDQUFBLEVBQUEsc0JBQXNCLEdBQUcsRUFBVTtRQUN2RSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUZELDRCQUVDO0lBRUQsbUJBQ0ksSUFBVyxFQUFFLGVBQXdCLEVBQUUsZUFBbUM7UUFBbkMsZ0NBQUEsRUFBQSxzQkFBc0IsR0FBRyxFQUFVO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sS0FBSyxZQUFZLENBQUM7Z0JBQ3hELENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLCtFQUErRTtnQkFDL0UsdUJBQXVCO2dCQUN2QixNQUFNLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLEdBQUcsT0FBTyxDQUFDO1lBQzdELENBQUM7WUFDRCxvREFBb0Q7UUFDdEQsQ0FBQztRQUVELElBQUksR0FBRyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDNUMsSUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQzs7WUFDbEMsR0FBRyxDQUFDLENBQWMsSUFBQSxTQUFBLFNBQUEsSUFBSSxDQUFBLDBCQUFBO2dCQUFqQixJQUFNLEdBQUcsaUJBQUE7Z0JBQ1osRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoRSxRQUFRLENBQUM7Z0JBQ1gsQ0FBQztnQkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekIsR0FBRyxJQUFJLElBQUksQ0FBQztnQkFDWiwrRUFBK0U7Z0JBQy9FLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25FLEdBQUcsSUFBSSxJQUFJLENBQUM7YUFDYjs7Ozs7Ozs7O1FBQ0QsR0FBRyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDdkMsTUFBTSxDQUFDLEdBQUcsQ0FBQzs7SUFDYixDQUFDO0lBRUQsaUZBQWlGO0lBQ2pGLGVBQXNCLElBQVc7UUFDL0IsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUNuQyxJQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ3pDLElBQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDaEMsSUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUNoQyxpRkFBaUY7UUFDakYsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQzs7WUFDdEIsR0FBRyxDQUFDLENBQWMsSUFBQSxTQUFBLFNBQUEsSUFBSSxDQUFBLDBCQUFBO2dCQUFqQixJQUFNLEtBQUcsaUJBQUE7Z0JBQ1osRUFBRSxDQUFDLENBQUMsS0FBRyxDQUFDLE9BQU8sQ0FBQztvQkFBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDM0MsRUFBRSxDQUFDLENBQUMsS0FBRyxDQUFDLGFBQWEsQ0FBQztvQkFBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDN0QsRUFBRSxDQUFDLENBQUMsS0FBRyxDQUFDLElBQUksQ0FBQztvQkFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsRUFBRSxDQUFDLENBQUMsS0FBRyxDQUFDLElBQUksQ0FBQztvQkFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsRUFBRSxDQUFDLENBQUMsS0FBRyxDQUFDLFFBQVEsQ0FBQztvQkFBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNsQyxFQUFFLENBQUMsQ0FBQyxLQUFHLENBQUMsU0FBUyxDQUFDO29CQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDckM7Ozs7Ozs7OztRQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFnQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUNELElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDL0MsSUFBTSxhQUFhLEdBQ2YsY0FBYyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDbEYsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDdEUsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDeEUsSUFBTSxHQUFHLEdBQVEsRUFBQyxPQUFPLFNBQUEsRUFBRSxhQUFhLGVBQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDO1FBQ3RELHdFQUF3RTtRQUN4RSx1RUFBdUU7UUFDdkUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNkLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwQixHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQzs7SUFDYixDQUFDO0lBbENELHNCQWtDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtub3JtYWxpemVMaW5lRW5kaW5nc30gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBUeXBlU2NyaXB0IGhhcyBhbiBBUEkgZm9yIEpTRG9jIGFscmVhZHksIGJ1dCBpdCdzIG5vdCBleHBvc2VkLlxuICogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy83MzkzXG4gKiBGb3Igbm93IHdlIGNyZWF0ZSB0eXBlcyB0aGF0IGFyZSBzaW1pbGFyIHRvIHRoZWlycyBzbyB0aGF0IG1pZ3JhdGluZ1xuICogdG8gdGhlaXIgQVBJIHdpbGwgYmUgZWFzaWVyLiAgU2VlIGUuZy4gdHMuSlNEb2NUYWcgYW5kIHRzLkpTRG9jQ29tbWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYWcge1xuICAvKipcbiAgICogdGFnTmFtZSBpcyBlLmcuIFwicGFyYW1cIiBpbiBhbiBAcGFyYW0gZGVjbGFyYXRpb24uICBJdCBpcyB0aGUgZW1wdHkgc3RyaW5nXG4gICAqIGZvciB0aGUgcGxhaW4gdGV4dCBkb2N1bWVudGF0aW9uIHRoYXQgb2NjdXJzIGJlZm9yZSBhbnkgQGZvbyBsaW5lcy5cbiAgICovXG4gIHRhZ05hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIHBhcmFtZXRlck5hbWUgaXMgdGhlIHRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiBwYXJhbWV0ZXIsIGUuZy4gXCJmb29cIlxuICAgKiBpbiBgXFxAcGFyYW0gZm9vIFRoZSBmb28gcGFyYW1gXG4gICAqL1xuICBwYXJhbWV0ZXJOYW1lPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHR5cGUgb2YgYSBKU0RvYyBcXEBwYXJhbSwgXFxAdHlwZSBldGMgdGFnLCByZW5kZXJlZCBpbiBjdXJseSBicmFjZXMuXG4gICAqIENhbiBhbHNvIGhvbGQgdGhlIHR5cGUgb2YgYW4gXFxAc3VwcHJlc3MuXG4gICAqL1xuICB0eXBlPzogc3RyaW5nO1xuICAvKiogb3B0aW9uYWwgaXMgdHJ1ZSBmb3Igb3B0aW9uYWwgZnVuY3Rpb24gcGFyYW1ldGVycy4gKi9cbiAgb3B0aW9uYWw/OiBib29sZWFuO1xuICAvKiogcmVzdFBhcmFtIGlzIHRydWUgZm9yIFwiLi4ueDogZm9vW11cIiBmdW5jdGlvbiBwYXJhbWV0ZXJzLiAqL1xuICByZXN0UGFyYW0/OiBib29sZWFuO1xuICAvKipcbiAgICogZGVzdHJ1Y3R1cmluZyBpcyB0cnVlIGZvciBkZXN0cnVjdHVyaW5nIGJpbmQgcGFyYW1ldGVycywgd2hpY2ggcmVxdWlyZVxuICAgKiBub24tbnVsbCBhcmd1bWVudHMgb24gdGhlIENsb3N1cmUgc2lkZS4gIENhbiBsaWtlbHkgcmVtb3ZlIHRoaXNcbiAgICogb25jZSBUeXBlU2NyaXB0IG51bGxhYmxlIHR5cGVzIGFyZSBhdmFpbGFibGUuXG4gICAqL1xuICBkZXN0cnVjdHVyaW5nPzogYm9vbGVhbjtcbiAgLyoqIEFueSByZW1haW5pbmcgdGV4dCBvbiB0aGUgdGFnLCBlLmcuIHRoZSBkZXNjcmlwdGlvbi4gKi9cbiAgdGV4dD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIGxpc3Qgb2YgYWxsIEpTRG9jIHRhZ3MgYWxsb3dlZCBieSB0aGUgQ2xvc3VyZSBjb21waWxlci5cbiAqIFRoZSBwdWJsaWMgQ2xvc3VyZSBkb2NzIGRvbid0IGxpc3QgYWxsIHRoZSB0YWdzIGl0IGFsbG93czsgdGhpcyBsaXN0IGNvbWVzXG4gKiBmcm9tIHRoZSBjb21waWxlciBzb3VyY2UgaXRzZWxmLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL2Jsb2IvbWFzdGVyL3NyYy9jb20vZ29vZ2xlL2phdmFzY3JpcHQvanNjb21wL3BhcnNpbmcvQW5ub3RhdGlvbi5qYXZhXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2Nsb3N1cmUtY29tcGlsZXIvYmxvYi9tYXN0ZXIvc3JjL2NvbS9nb29nbGUvamF2YXNjcmlwdC9qc2NvbXAvcGFyc2luZy9QYXJzZXJDb25maWcucHJvcGVydGllc1xuICovXG5jb25zdCBKU0RPQ19UQUdTX1dISVRFTElTVCA9IG5ldyBTZXQoW1xuICAnYWJzdHJhY3QnLCAgICAgICdhcmd1bWVudCcsXG4gICdhdXRob3InLCAgICAgICAgJ2NvbnNpc3RlbnRJZEdlbmVyYXRvcicsXG4gICdjb25zdCcsICAgICAgICAgJ2NvbnN0YW50JyxcbiAgJ2NvbnN0cnVjdG9yJywgICAnY29weXJpZ2h0JyxcbiAgJ2RlZmluZScsICAgICAgICAnZGVwcmVjYXRlZCcsXG4gICdkZXNjJywgICAgICAgICAgJ2RpY3QnLFxuICAnZGlzcG9zZXMnLCAgICAgICdlbmhhbmNlJyxcbiAgJ2VuaGFuY2VhYmxlJywgICAnZW51bScsXG4gICdleHBvcnQnLCAgICAgICAgJ2V4cG9zZScsXG4gICdleHRlbmRzJywgICAgICAgJ2V4dGVybnMnLFxuICAnZmlsZW92ZXJ2aWV3JywgICdmaW5hbCcsXG4gICdoYXNzb3lkZWxjYWxsJywgJ2hhc3NveWRlbHRlbXBsYXRlJyxcbiAgJ2hpZGRlbicsICAgICAgICAnaWQnLFxuICAnaWRHZW5lcmF0b3InLCAgICdpZ25vcmUnLFxuICAnaW1wbGVtZW50cycsICAgICdpbXBsaWNpdENhc3QnLFxuICAnaW5oZXJpdERvYycsICAgICdpbnRlcmZhY2UnLFxuICAnamFnZ2VySW5qZWN0JywgICdqYWdnZXJNb2R1bGUnLFxuICAnamFnZ2VyUHJvdmlkZScsICdqYWdnZXJQcm92aWRlUHJvbWlzZScsXG4gICdsZW5kcycsICAgICAgICAgJ2xpY2Vuc2UnLFxuICAnbGluaycsICAgICAgICAgICdtZWFuaW5nJyxcbiAgJ21vZGlmaWVzJywgICAgICAnbW9kTmFtZScsXG4gICdtb2RzJywgICAgICAgICAgJ25nSW5qZWN0JyxcbiAgJ25vYWxpYXMnLCAgICAgICAnbm9jb2xsYXBzZScsXG4gICdub2NvbXBpbGUnLCAgICAgJ25vc2lkZWVmZmVjdHMnLFxuICAnb3ZlcnJpZGUnLCAgICAgICdvd25lcicsXG4gICdwYWNrYWdlJywgICAgICAgJ3BhcmFtJyxcbiAgJ3BpbnRvbW9kdWxlJywgICAncG9seW1lckJlaGF2aW9yJyxcbiAgJ3ByZXNlcnZlJywgICAgICAncHJlc2VydmVUcnknLFxuICAncHJpdmF0ZScsICAgICAgICdwcm90ZWN0ZWQnLFxuICAncHVibGljJywgICAgICAgICdyZWNvcmQnLFxuICAncmVxdWlyZWNzcycsICAgICdyZXF1aXJlcycsXG4gICdyZXR1cm4nLCAgICAgICAgJ3JldHVybnMnLFxuICAnc2VlJywgICAgICAgICAgICdzdGFibGVJZEdlbmVyYXRvcicsXG4gICdzdHJ1Y3QnLCAgICAgICAgJ3N1cHByZXNzJyxcbiAgJ3RlbXBsYXRlJywgICAgICAndGhpcycsXG4gICd0aHJvd3MnLCAgICAgICAgJ3R5cGUnLFxuICAndHlwZWRlZicsICAgICAgICd1bnJlc3RyaWN0ZWQnLFxuICAndmVyc2lvbicsICAgICAgICd3aXphY3Rpb24nLFxuICAnd2l6bW9kdWxlJyxcbl0pO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBKU0RvYyBAdGFncyB0aGF0IGFyZSBuZXZlciBhbGxvd2VkIGluIFR5cGVTY3JpcHQgc291cmNlLiBUaGVzZSBhcmUgQ2xvc3VyZSB0YWdzIHRoYXRcbiAqIGNhbiBiZSBleHByZXNzZWQgaW4gdGhlIFR5cGVTY3JpcHQgc3VyZmFjZSBzeW50YXguIEFzIHRzaWNrbGUncyBlbWl0IHdpbGwgbWFuZ2xlIHR5cGUgbmFtZXMsXG4gKiB0aGVzZSB3aWxsIGNhdXNlIENsb3N1cmUgQ29tcGlsZXIgaXNzdWVzIGFuZCBzaG91bGQgbm90IGJlIHVzZWQuXG4gKi9cbmNvbnN0IEpTRE9DX1RBR1NfQkxBQ0tMSVNUID0gbmV3IFNldChbXG4gICdhdWdtZW50cycsICdjbGFzcycsICAgICAgJ2NvbnN0cnVjdHMnLCAnY29uc3RydWN0b3InLCAnZW51bScsICAgICAgJ2V4dGVuZHMnLCAnZmllbGQnLFxuICAnZnVuY3Rpb24nLCAnaW1wbGVtZW50cycsICdpbnRlcmZhY2UnLCAgJ2xlbmRzJywgICAgICAgJ25hbWVzcGFjZScsICdwcml2YXRlJywgJ3B1YmxpYycsXG4gICdyZWNvcmQnLCAgICdzdGF0aWMnLCAgICAgJ3RlbXBsYXRlJywgICAndGhpcycsICAgICAgICAndHlwZScsICAgICAgJ3R5cGVkZWYnLFxuXSk7XG5cbi8qKlxuICogQSBsaXN0IG9mIEpTRG9jIEB0YWdzIHRoYXQgbWlnaHQgaW5jbHVkZSBhIHt0eXBlfSBhZnRlciB0aGVtLiBPbmx5IGJhbm5lZCB3aGVuIGEgdHlwZSBpcyBwYXNzZWQuXG4gKiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCBpbmNsdWRlIHRhZ3MgdGhhdCBjYXJyeSBhIG5vbi10eXBlIHN5c3RlbSB0eXBlLCBlLmcuIFxcQHN1cHByZXNzLlxuICovXG5jb25zdCBKU0RPQ19UQUdTX1dJVEhfVFlQRVMgPSBuZXcgU2V0KFtcbiAgJ2NvbnN0JyxcbiAgJ2V4cG9ydCcsXG4gICdwYXJhbScsXG4gICdyZXR1cm4nLFxuXSk7XG5cbi8qKlxuICogUmVzdWx0IG9mIHBhcnNpbmcgYSBKU0RvYyBjb21tZW50LiBTdWNoIGNvbW1lbnRzIGVzc2VudGlhbGx5IGFyZSBidWlsdCBvZiBhIGxpc3Qgb2YgdGFncy5cbiAqIEluIGFkZGl0aW9uIHRvIHRoZSB0YWdzLCB0aGlzIG1pZ2h0IGFsc28gY29udGFpbiB3YXJuaW5ncyB0byBpbmRpY2F0ZSBub24tZmF0YWwgcHJvYmxlbXNcbiAqIHdoaWxlIGZpbmRpbmcgdGhlIHRhZ3MuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkSlNEb2NDb21tZW50IHtcbiAgdGFnczogVGFnW107XG4gIHdhcm5pbmdzPzogc3RyaW5nW107XG59XG5cbi8qKlxuICogcGFyc2UgcGFyc2VzIEpTRG9jIG91dCBvZiBhIGNvbW1lbnQgc3RyaW5nLlxuICogUmV0dXJucyBudWxsIGlmIGNvbW1lbnQgaXMgbm90IEpTRG9jLlxuICovXG4vLyBUT0RPKG1hcnRpbnByb2JzdCk6IHJlcHJlc2VudGluZyBKU0RvYyBhcyBhIGxpc3Qgb2YgdGFncyBpcyB0b28gc2ltcGxpc3RpYy4gV2UgbmVlZCBmdW5jdGlvbmFsaXR5XG4vLyBzdWNoIGFzIG1lcmdpbmcgKGJlbG93KSwgZGUtZHVwbGljYXRpbmcgY2VydGFpbiB0YWdzIChAZGVwcmVjYXRlZCksIGFuZCBzcGVjaWFsIHRyZWF0bWVudCBmb3Jcbi8vIG90aGVycyAoZS5nLiBAc3VwcHJlc3MpLiBXZSBzaG91bGQgaW50cm9kdWNlIGEgcHJvcGVyIG1vZGVsIGNsYXNzIHdpdGggYSBtb3JlIHN1aXRhYmxlIGRhdGFcbi8vIHN0cnVjdXJlIChlLmcuIGEgTWFwPFRhZ05hbWUsIFZhbHVlc1tdPikuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoY29tbWVudDogc3RyaW5nKTogUGFyc2VkSlNEb2NDb21tZW50fG51bGwge1xuICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBwcm9wZXIgbGluZSBlbmRpbmdzIGJlZm9yZSBwYXJzaW5nIG9uIFdpbmRvd3MuXG4gIGNvbW1lbnQgPSBub3JtYWxpemVMaW5lRW5kaW5ncyhjb21tZW50KTtcbiAgLy8gVE9ETyhldmFubSk6IHRoaXMgaXMgYSBwaWxlIG9mIGhhY2t5IHJlZ2V4ZXMgZm9yIG5vdywgYmVjYXVzZSB3ZVxuICAvLyB3b3VsZCByYXRoZXIgdXNlIHRoZSBiZXR0ZXIgVHlwZVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiBKU0RvY1xuICAvLyBwYXJzaW5nLiAgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy83MzkzXG4gIGNvbnN0IG1hdGNoID0gY29tbWVudC5tYXRjaCgvXlxcL1xcKlxcKihbXFxzXFxTXSo/KVxcKlxcLyQvKTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBwYXJzZUNvbnRlbnRzKG1hdGNoWzFdLnRyaW0oKSk7XG59XG5cbi8qKlxuICogcGFyc2VDb250ZW50cyBwYXJzZXMgSlNEb2Mgb3V0IG9mIGEgY29tbWVudCB0ZXh0LlxuICogUmV0dXJucyBudWxsIGlmIGNvbW1lbnQgaXMgbm90IEpTRG9jLlxuICpcbiAqIEBwYXJhbSBjb21tZW50VGV4dCBhIGNvbW1lbnQncyB0ZXh0IGNvbnRlbnQsIGkuZS4gdGhlIGNvbW1lbnQgdy9vIC8qIGFuZCAqIC8uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbnRlbnRzKGNvbW1lbnRUZXh0OiBzdHJpbmcpOiB7dGFnczogVGFnW10sIHdhcm5pbmdzPzogc3RyaW5nW119fG51bGwge1xuICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBwcm9wZXIgbGluZSBlbmRpbmdzIGJlZm9yZSBwYXJzaW5nIG9uIFdpbmRvd3MuXG4gIGNvbW1lbnRUZXh0ID0gbm9ybWFsaXplTGluZUVuZGluZ3MoY29tbWVudFRleHQpO1xuICAvLyBTdHJpcCBhbGwgdGhlIFwiICogXCIgYml0cyBmcm9tIHRoZSBmcm9udCBvZiBlYWNoIGxpbmUuXG4gIGNvbW1lbnRUZXh0ID0gY29tbWVudFRleHQucmVwbGFjZSgvXlxccypcXCo/ID8vZ20sICcnKTtcbiAgY29uc3QgbGluZXMgPSBjb21tZW50VGV4dC5zcGxpdCgnXFxuJyk7XG4gIGNvbnN0IHRhZ3M6IFRhZ1tdID0gW107XG4gIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBsZXQgbWF0Y2ggPSBsaW5lLm1hdGNoKC9eQChcXFMrKSAqKC4qKS8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgbGV0IFtfLCB0YWdOYW1lLCB0ZXh0XSA9IG1hdGNoO1xuICAgICAgaWYgKHRhZ05hbWUgPT09ICdyZXR1cm5zJykge1xuICAgICAgICAvLyBBIHN5bm9ueW0gZm9yICdyZXR1cm4nLlxuICAgICAgICB0YWdOYW1lID0gJ3JldHVybic7XG4gICAgICB9XG4gICAgICBsZXQgdHlwZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgICAgIGlmIChKU0RPQ19UQUdTX0JMQUNLTElTVC5oYXModGFnTmFtZSkpIHtcbiAgICAgICAgd2FybmluZ3MucHVzaChgQCR7dGFnTmFtZX0gYW5ub3RhdGlvbnMgYXJlIHJlZHVuZGFudCB3aXRoIFR5cGVTY3JpcHQgZXF1aXZhbGVudHNgKTtcbiAgICAgICAgY29udGludWU7ICAvLyBEcm9wIHRoZSB0YWcgc28gQ2xvc3VyZSB3b24ndCBwcm9jZXNzIGl0LlxuICAgICAgfSBlbHNlIGlmIChKU0RPQ19UQUdTX1dJVEhfVFlQRVMuaGFzKHRhZ05hbWUpICYmIHRleHRbMF0gPT09ICd7Jykge1xuICAgICAgICB3YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgYHRoZSB0eXBlIGFubm90YXRpb24gb24gQCR7dGFnTmFtZX0gaXMgcmVkdW5kYW50IHdpdGggaXRzIFR5cGVTY3JpcHQgdHlwZSwgYCArXG4gICAgICAgICAgICBgcmVtb3ZlIHRoZSB7Li4ufSBwYXJ0YCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnc3VwcHJlc3MnKSB7XG4gICAgICAgIGNvbnN0IHN1cHByZXNzTWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eXFx7KC4qKVxcfSguKikkLyk7XG4gICAgICAgIGlmICghc3VwcHJlc3NNYXRjaCkge1xuICAgICAgICAgIHdhcm5pbmdzLnB1c2goYG1hbGZvcm1lZCBAc3VwcHJlc3MgdGFnOiBcIiR7dGV4dH1cImApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFssIHR5cGUsIHRleHRdID0gc3VwcHJlc3NNYXRjaDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnZGljdCcpIHtcbiAgICAgICAgd2FybmluZ3MucHVzaCgndXNlIGluZGV4IHNpZ25hdHVyZXMgKGBbazogc3RyaW5nXTogdHlwZWApIGluc3RlYWQgb2YgQGRpY3QnKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEdyYWIgdGhlIHBhcmFtZXRlciBuYW1lIGZyb20gQHBhcmFtIHRhZ3MuXG4gICAgICBsZXQgcGFyYW1ldGVyTmFtZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgICAgIGlmICh0YWdOYW1lID09PSAncGFyYW0nKSB7XG4gICAgICAgIG1hdGNoID0gdGV4dC5tYXRjaCgvXihcXFMrKSA/KC4qKS8pO1xuICAgICAgICBpZiAobWF0Y2gpIFtfLCBwYXJhbWV0ZXJOYW1lLCB0ZXh0XSA9IG1hdGNoO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YWc6IFRhZyA9IHt0YWdOYW1lfTtcbiAgICAgIGlmIChwYXJhbWV0ZXJOYW1lKSB0YWcucGFyYW1ldGVyTmFtZSA9IHBhcmFtZXRlck5hbWU7XG4gICAgICBpZiAodGV4dCkgdGFnLnRleHQgPSB0ZXh0O1xuICAgICAgaWYgKHR5cGUpIHRhZy50eXBlID0gdHlwZTtcbiAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUZXh0IHdpdGhvdXQgYSBwcmVjZWRpbmcgQHRhZyBvbiBpdCBpcyBlaXRoZXIgdGhlIHBsYWluIHRleHRcbiAgICAgIC8vIGRvY3VtZW50YXRpb24gb3IgYSBjb250aW51YXRpb24gb2YgYSBwcmV2aW91cyB0YWcuXG4gICAgICBpZiAodGFncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGFncy5wdXNoKHt0YWdOYW1lOiAnJywgdGV4dDogbGluZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGFzdFRhZyA9IHRhZ3NbdGFncy5sZW5ndGggLSAxXTtcbiAgICAgICAgbGFzdFRhZy50ZXh0ID0gKGxhc3RUYWcudGV4dCB8fCAnJykgKyAnXFxuJyArIGxpbmU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmICh3YXJuaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHt0YWdzLCB3YXJuaW5nc307XG4gIH1cbiAgcmV0dXJuIHt0YWdzfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgVGFnIGludG8gYSBzdHJpbmcgdXNhYmxlIGluIGEgY29tbWVudC5cbiAqIFJldHVybnMgYSBzdHJpbmcgbGlrZSBcIiBAZm9vIHtiYXJ9IGJhelwiIChub3RlIHRoZSB3aGl0ZXNwYWNlKS5cbiAqL1xuZnVuY3Rpb24gdGFnVG9TdHJpbmcodGFnOiBUYWcsIGVzY2FwZUV4dHJhVGFncyA9IG5ldyBTZXQ8c3RyaW5nPigpKTogc3RyaW5nIHtcbiAgbGV0IG91dCA9ICcnO1xuICBpZiAodGFnLnRhZ05hbWUpIHtcbiAgICBpZiAoIUpTRE9DX1RBR1NfV0hJVEVMSVNULmhhcyh0YWcudGFnTmFtZSkgfHwgZXNjYXBlRXh0cmFUYWdzLmhhcyh0YWcudGFnTmFtZSkpIHtcbiAgICAgIC8vIEVzY2FwZSB0YWdzIHdlIGRvbid0IHVuZGVyc3RhbmQuICBUaGlzIGlzIGEgc3VidGxlXG4gICAgICAvLyBjb21wcm9taXNlIGJldHdlZW4gbXVsdGlwbGUgaXNzdWVzLlxuICAgICAgLy8gMSkgSWYgd2UgcGFzcyB0aHJvdWdoIHRoZXNlIG5vbi1DbG9zdXJlIHRhZ3MsIHRoZSB1c2VyIHdpbGxcbiAgICAgIC8vICAgIGdldCBhIHdhcm5pbmcgZnJvbSBDbG9zdXJlLCBhbmQgdGhlIHBvaW50IG9mIHRzaWNrbGUgaXNcbiAgICAgIC8vICAgIHRvIGluc3VsYXRlIHRoZSB1c2VyIGZyb20gQ2xvc3VyZS5cbiAgICAgIC8vIDIpIFRoZSBvdXRwdXQgb2YgdHNpY2tsZSBpcyBmb3IgQ2xvc3VyZSBidXQgYWxzbyBtYXkgYmUgcmVhZFxuICAgICAgLy8gICAgYnkgaHVtYW5zLCBmb3IgZXhhbXBsZSBub24tVHlwZVNjcmlwdCB1c2VycyBvZiBBbmd1bGFyLlxuICAgICAgLy8gMykgRmluYWxseSwgd2UgZG9uJ3Qgd2FudCB0byB3YXJuIGJlY2F1c2UgdXNlcnMgc2hvdWxkIGJlXG4gICAgICAvLyAgICBmcmVlIHRvIGFkZCB3aGljaGV2ZXIgSlNEb2MgdGhleSBmZWVsIGxpa2UuICBJZiB0aGUgdXNlclxuICAgICAgLy8gICAgd2FudHMgaGVscCBlbnN1cmluZyB0aGV5IGRpZG4ndCB0eXBvIGEgdGFnLCB0aGF0IGlzIHRoZVxuICAgICAgLy8gICAgcmVzcG9uc2liaWxpdHkgb2YgYSBsaW50ZXIuXG4gICAgICBvdXQgKz0gYCBcXFxcQCR7dGFnLnRhZ05hbWV9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGAgQCR7dGFnLnRhZ05hbWV9YDtcbiAgICB9XG4gIH1cbiAgaWYgKHRhZy50eXBlKSB7XG4gICAgb3V0ICs9ICcgeyc7XG4gICAgaWYgKHRhZy5yZXN0UGFyYW0pIHtcbiAgICAgIG91dCArPSAnLi4uJztcbiAgICB9XG4gICAgb3V0ICs9IHRhZy50eXBlO1xuICAgIGlmICh0YWcub3B0aW9uYWwpIHtcbiAgICAgIG91dCArPSAnPSc7XG4gICAgfVxuICAgIG91dCArPSAnfSc7XG4gIH1cbiAgaWYgKHRhZy5wYXJhbWV0ZXJOYW1lKSB7XG4gICAgb3V0ICs9ICcgJyArIHRhZy5wYXJhbWV0ZXJOYW1lO1xuICB9XG4gIGlmICh0YWcudGV4dCkge1xuICAgIG91dCArPSAnICcgKyB0YWcudGV4dC5yZXBsYWNlKC9AL2csICdcXFxcQCcpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKiBUYWdzIHRoYXQgbXVzdCBvbmx5IG9jY3VyIG9uY2VzIGluIGEgY29tbWVudCAoZmlsdGVyZWQgYmVsb3cpLiAqL1xuY29uc3QgU0lOR0xFVE9OX1RBR1MgPSBuZXcgU2V0KFsnZGVwcmVjYXRlZCddKTtcblxuLyoqIFNlcmlhbGl6ZXMgYSBDb21tZW50IG91dCB0byBhIHN0cmluZywgYnV0IGRvZXMgbm90IGluY2x1ZGUgdGhlIHN0YXJ0IGFuZCBlbmQgY29tbWVudCB0b2tlbnMuICovXG5leHBvcnQgZnVuY3Rpb24gdG9TdHJpbmdXaXRob3V0U3RhcnRFbmQodGFnczogVGFnW10sIGVzY2FwZUV4dHJhVGFncyA9IG5ldyBTZXQ8c3RyaW5nPigpKTogc3RyaW5nIHtcbiAgcmV0dXJuIHNlcmlhbGl6ZSh0YWdzLCBmYWxzZSwgZXNjYXBlRXh0cmFUYWdzKTtcbn1cblxuLyoqIFNlcmlhbGl6ZXMgYSBDb21tZW50IG91dCB0byBhIHN0cmluZyB1c2FibGUgaW4gc291cmNlIGNvZGUuICovXG5leHBvcnQgZnVuY3Rpb24gdG9TdHJpbmcodGFnczogVGFnW10sIGVzY2FwZUV4dHJhVGFncyA9IG5ldyBTZXQ8c3RyaW5nPigpKTogc3RyaW5nIHtcbiAgcmV0dXJuIHNlcmlhbGl6ZSh0YWdzLCB0cnVlLCBlc2NhcGVFeHRyYVRhZ3MpO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemUoXG4gICAgdGFnczogVGFnW10sIGluY2x1ZGVTdGFydEVuZDogYm9vbGVhbiwgZXNjYXBlRXh0cmFUYWdzID0gbmV3IFNldDxzdHJpbmc+KCkpOiBzdHJpbmcge1xuICBpZiAodGFncy5sZW5ndGggPT09IDApIHJldHVybiAnJztcbiAgaWYgKHRhZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgY29uc3QgdGFnID0gdGFnc1swXTtcbiAgICBpZiAoKHRhZy50YWdOYW1lID09PSAndHlwZScgfHwgdGFnLnRhZ05hbWUgPT09ICdub2NvbGxhcHNlJykgJiZcbiAgICAgICAgKCF0YWcudGV4dCB8fCAhdGFnLnRleHQubWF0Y2goJ1xcbicpKSkge1xuICAgICAgLy8gU3BlY2lhbC1jYXNlIG9uZS1saW5lciBcInR5cGVcIiBhbmQgXCJub2NvbGxhcHNlXCIgdGFncyB0byBmaXQgb24gb25lIGxpbmUsIGUuZy5cbiAgICAgIC8vICAgLyoqIEB0eXBlIHtmb299ICovXG4gICAgICByZXR1cm4gJy8qKicgKyB0YWdUb1N0cmluZyh0YWcsIGVzY2FwZUV4dHJhVGFncykgKyAnICovXFxuJztcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlLCBmYWxsIHRocm91Z2ggdG8gdGhlIG11bHRpLWxpbmUgb3V0cHV0LlxuICB9XG5cbiAgbGV0IG91dCA9IGluY2x1ZGVTdGFydEVuZCA/ICcvKipcXG4nIDogJypcXG4nO1xuICBjb25zdCBlbWl0dGVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICBpZiAoZW1pdHRlZC5oYXModGFnLnRhZ05hbWUpICYmIFNJTkdMRVRPTl9UQUdTLmhhcyh0YWcudGFnTmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBlbWl0dGVkLmFkZCh0YWcudGFnTmFtZSk7XG4gICAgb3V0ICs9ICcgKic7XG4gICAgLy8gSWYgdGhlIHRhZ1RvU3RyaW5nIGlzIG11bHRpLWxpbmUsIGluc2VydCBcIiAqIFwiIHByZWZpeGVzIG9uIHN1YnNlcXVlbnQgbGluZXMuXG4gICAgb3V0ICs9IHRhZ1RvU3RyaW5nKHRhZywgZXNjYXBlRXh0cmFUYWdzKS5zcGxpdCgnXFxuJykuam9pbignXFxuICogJyk7XG4gICAgb3V0ICs9ICdcXG4nO1xuICB9XG4gIG91dCArPSBpbmNsdWRlU3RhcnRFbmQgPyAnICovXFxuJyA6ICcgJztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqIE1lcmdlcyBtdWx0aXBsZSB0YWdzIChvZiB0aGUgc2FtZSB0YWdOYW1lIHR5cGUpIGludG8gYSBzaW5nbGUgdW5pZmllZCB0YWcuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2UodGFnczogVGFnW10pOiBUYWcge1xuICBjb25zdCB0YWdOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBwYXJhbWV0ZXJOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCB0eXBlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCB0ZXh0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAvLyBJZiBhbnkgb2YgdGhlIHRhZ3MgYXJlIG9wdGlvbmFsL3Jlc3QsIHRoZW4gdGhlIG1lcmdlZCBvdXRwdXQgaXMgb3B0aW9uYWwvcmVzdC5cbiAgbGV0IG9wdGlvbmFsID0gZmFsc2U7XG4gIGxldCByZXN0UGFyYW0gPSBmYWxzZTtcbiAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgIGlmICh0YWcudGFnTmFtZSkgdGFnTmFtZXMuYWRkKHRhZy50YWdOYW1lKTtcbiAgICBpZiAodGFnLnBhcmFtZXRlck5hbWUpIHBhcmFtZXRlck5hbWVzLmFkZCh0YWcucGFyYW1ldGVyTmFtZSk7XG4gICAgaWYgKHRhZy50eXBlKSB0eXBlcy5hZGQodGFnLnR5cGUpO1xuICAgIGlmICh0YWcudGV4dCkgdGV4dHMuYWRkKHRhZy50ZXh0KTtcbiAgICBpZiAodGFnLm9wdGlvbmFsKSBvcHRpb25hbCA9IHRydWU7XG4gICAgaWYgKHRhZy5yZXN0UGFyYW0pIHJlc3RQYXJhbSA9IHRydWU7XG4gIH1cblxuICBpZiAodGFnTmFtZXMuc2l6ZSAhPT0gMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IG1lcmdlIGRpZmZlcmluZyB0YWdzOiAke0pTT04uc3RyaW5naWZ5KHRhZ3MpfWApO1xuICB9XG4gIGNvbnN0IHRhZ05hbWUgPSB0YWdOYW1lcy52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG4gIGNvbnN0IHBhcmFtZXRlck5hbWUgPVxuICAgICAgcGFyYW1ldGVyTmFtZXMuc2l6ZSA+IDAgPyBBcnJheS5mcm9tKHBhcmFtZXRlck5hbWVzKS5qb2luKCdfb3JfJykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHR5cGUgPSB0eXBlcy5zaXplID4gMCA/IEFycmF5LmZyb20odHlwZXMpLmpvaW4oJ3wnKSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgdGV4dCA9IHRleHRzLnNpemUgPiAwID8gQXJyYXkuZnJvbSh0ZXh0cykuam9pbignIC8gJykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHRhZzogVGFnID0ge3RhZ05hbWUsIHBhcmFtZXRlck5hbWUsIHR5cGUsIHRleHR9O1xuICAvLyBOb3RlOiBhIHBhcmFtIGNhbiBlaXRoZXIgYmUgb3B0aW9uYWwgb3IgYSByZXN0IHBhcmFtOyBpZiB3ZSBtZXJnZWQgYW5cbiAgLy8gb3B0aW9uYWwgYW5kIHJlc3QgcGFyYW0gdG9nZXRoZXIsIHByZWZlciBtYXJraW5nIGl0IGFzIGEgcmVzdCBwYXJhbS5cbiAgaWYgKHJlc3RQYXJhbSkge1xuICAgIHRhZy5yZXN0UGFyYW0gPSB0cnVlO1xuICB9IGVsc2UgaWYgKG9wdGlvbmFsKSB7XG4gICAgdGFnLm9wdGlvbmFsID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gdGFnO1xufVxuIl19