/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/fileoverview_comment_transformer", ["require", "exports", "tsickle/src/jsdoc", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jsdoc = require("tsickle/src/jsdoc");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * A set of JSDoc tags that mark a comment as a fileoverview comment. These are recognized by other
     * pieces of infrastructure (Closure Compiler, module system, ...).
     */
    var FILEOVERVIEW_COMMENT_MARKERS = new Set(['fileoverview', 'externs', 'modName', 'mods', 'pintomodule']);
    /**
     * Returns true if the given comment is a \@fileoverview style comment in the Closure sense, i.e. a
     * comment that has JSDoc tags marking it as a fileoverview comment.
     * Note that this is different from TypeScript's understanding of the concept, where a file comment
     * is a comment separated from the rest of the file by a double newline.
     */
    function isClosureFileoverviewComment(text) {
        var current = jsdoc.parse(text);
        return current !== null && current.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); });
    }
    exports.isClosureFileoverviewComment = isClosureFileoverviewComment;
    /**
     * A transformer that ensures the emitted JS file has an \@fileoverview comment that contains an
     * \@suppress {checkTypes} annotation by either adding or updating an existing comment.
     */
    function transformFileoverviewComment(context) {
        return function (sf) {
            var comments = [];
            // Use trailing comments because that's what transformer_util.ts creates (i.e. by convention).
            if (sf.statements.length && sf.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
                comments = ts.getSyntheticTrailingComments(sf.statements[0]) || [];
            }
            var fileoverviewIdx = -1;
            var parsed = null;
            for (var i = comments.length - 1; i >= 0; i--) {
                var current = jsdoc.parseContents(comments[i].text);
                if (current !== null && current.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); })) {
                    fileoverviewIdx = i;
                    parsed = current;
                    break;
                }
            }
            // Add a @suppress {checkTypes} tag to each source file's JSDoc comment,
            // being careful to retain existing comments and their @suppress'ions.
            // Closure Compiler considers the *last* comment with @fileoverview (or @externs or @nocompile)
            // that has not been attached to some other tree node to be the file overview comment, and
            // only applies @suppress tags from it.
            // AJD considers *any* comment mentioning @fileoverview.
            if (!parsed) {
                // No existing comment to merge with, just emit a new one.
                return addNewFileoverviewComment(sf);
            }
            // Add @suppress {checkTypes}, or add to the list in an existing @suppress tag.
            // Closure compiler barfs if there's a duplicated @suppress tag in a file, so the tag must
            // only appear once and be merged.
            var tags = parsed.tags;
            var suppressTag = tags.find(function (t) { return t.tagName === 'suppress'; });
            if (suppressTag) {
                var suppressions = suppressTag.type || '';
                var suppressionsList = suppressions.split(',').map(function (s) { return s.trim(); });
                if (suppressionsList.indexOf('checkTypes') === -1) {
                    suppressionsList.push('checkTypes');
                }
                suppressTag.type = suppressionsList.join(',');
            }
            else {
                tags.push({
                    tagName: 'suppress',
                    type: 'checkTypes',
                    text: 'checked by tsc',
                });
            }
            var commentText = jsdoc.toStringWithoutStartEnd(tags);
            comments[fileoverviewIdx].text = commentText;
            // sf does not need to be updated, synthesized comments are mutable.
            return sf;
        };
    }
    exports.transformFileoverviewComment = transformFileoverviewComment;
    function addNewFileoverviewComment(sf) {
        var commentText = jsdoc.toStringWithoutStartEnd([
            { tagName: 'fileoverview', text: 'added by tsickle' },
            { tagName: 'suppress', type: 'checkTypes', text: 'checked by tsc' },
        ]);
        var syntheticFirstStatement = transformer_util_1.createNotEmittedStatement(sf);
        syntheticFirstStatement = ts.addSyntheticTrailingComment(syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
        return transformer_util_1.updateSourceFileNode(sf, ts.createNodeArray(__spread([syntheticFirstStatement], sf.statements)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUFpQztJQUNqQyxpRUFBbUY7SUFDbkYsMkNBQW1DO0lBRW5DOzs7T0FHRztJQUNILElBQU0sNEJBQTRCLEdBQzlCLElBQUksR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFFM0U7Ozs7O09BS0c7SUFDSCxzQ0FBNkMsSUFBWTtRQUN2RCxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFIRCxvRUFHQztJQUVEOzs7T0FHRztJQUNILHNDQUE2QyxPQUFpQztRQUU1RSxNQUFNLENBQUMsVUFBQyxFQUFpQjtZQUN2QixJQUFJLFFBQVEsR0FBNEIsRUFBRSxDQUFDO1lBQzNDLDhGQUE4RjtZQUM5RixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztnQkFDeEYsUUFBUSxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsQ0FB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QUFrQixFQUFDO1lBQ25ELEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztTQUNsRSxDQUFDLENBQUM7UUFDSCxJQUFJLHVCQUF1QixHQUFHLDRDQUF5QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVELHVCQUF1QixHQUFHLEVBQUUsQ0FBQywyQkFBMkIsQ0FDcEQsdUJBQXVCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEYsTUFBTSxDQUFDLHVDQUFvQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsZUFBZSxXQUFFLHVCQUF1QixHQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ25HLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGpzZG9jIGZyb20gJy4vanNkb2MnO1xuaW1wb3J0IHtjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50LCB1cGRhdGVTb3VyY2VGaWxlTm9kZX0gZnJvbSAnLi90cmFuc2Zvcm1lcl91dGlsJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogQSBzZXQgb2YgSlNEb2MgdGFncyB0aGF0IG1hcmsgYSBjb21tZW50IGFzIGEgZmlsZW92ZXJ2aWV3IGNvbW1lbnQuIFRoZXNlIGFyZSByZWNvZ25pemVkIGJ5IG90aGVyXG4gKiBwaWVjZXMgb2YgaW5mcmFzdHJ1Y3R1cmUgKENsb3N1cmUgQ29tcGlsZXIsIG1vZHVsZSBzeXN0ZW0sIC4uLikuXG4gKi9cbmNvbnN0IEZJTEVPVkVSVklFV19DT01NRU5UX01BUktFUlM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPVxuICAgIG5ldyBTZXQoWydmaWxlb3ZlcnZpZXcnLCAnZXh0ZXJucycsICdtb2ROYW1lJywgJ21vZHMnLCAncGludG9tb2R1bGUnXSk7XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBjb21tZW50IGlzIGEgXFxAZmlsZW92ZXJ2aWV3IHN0eWxlIGNvbW1lbnQgaW4gdGhlIENsb3N1cmUgc2Vuc2UsIGkuZS4gYVxuICogY29tbWVudCB0aGF0IGhhcyBKU0RvYyB0YWdzIG1hcmtpbmcgaXQgYXMgYSBmaWxlb3ZlcnZpZXcgY29tbWVudC5cbiAqIE5vdGUgdGhhdCB0aGlzIGlzIGRpZmZlcmVudCBmcm9tIFR5cGVTY3JpcHQncyB1bmRlcnN0YW5kaW5nIG9mIHRoZSBjb25jZXB0LCB3aGVyZSBhIGZpbGUgY29tbWVudFxuICogaXMgYSBjb21tZW50IHNlcGFyYXRlZCBmcm9tIHRoZSByZXN0IG9mIHRoZSBmaWxlIGJ5IGEgZG91YmxlIG5ld2xpbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nsb3N1cmVGaWxlb3ZlcnZpZXdDb21tZW50KHRleHQ6IHN0cmluZykge1xuICBjb25zdCBjdXJyZW50ID0ganNkb2MucGFyc2UodGV4dCk7XG4gIHJldHVybiBjdXJyZW50ICE9PSBudWxsICYmIGN1cnJlbnQudGFncy5zb21lKHQgPT4gRklMRU9WRVJWSUVXX0NPTU1FTlRfTUFSS0VSUy5oYXModC50YWdOYW1lKSk7XG59XG5cbi8qKlxuICogQSB0cmFuc2Zvcm1lciB0aGF0IGVuc3VyZXMgdGhlIGVtaXR0ZWQgSlMgZmlsZSBoYXMgYW4gXFxAZmlsZW92ZXJ2aWV3IGNvbW1lbnQgdGhhdCBjb250YWlucyBhblxuICogXFxAc3VwcHJlc3Mge2NoZWNrVHlwZXN9IGFubm90YXRpb24gYnkgZWl0aGVyIGFkZGluZyBvciB1cGRhdGluZyBhbiBleGlzdGluZyBjb21tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtRmlsZW92ZXJ2aWV3Q29tbWVudChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOlxuICAgIChzZjogdHMuU291cmNlRmlsZSkgPT4gdHMuU291cmNlRmlsZSB7XG4gIHJldHVybiAoc2Y6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICBsZXQgY29tbWVudHM6IHRzLlN5bnRoZXNpemVkQ29tbWVudFtdID0gW107XG4gICAgLy8gVXNlIHRyYWlsaW5nIGNvbW1lbnRzIGJlY2F1c2UgdGhhdCdzIHdoYXQgdHJhbnNmb3JtZXJfdXRpbC50cyBjcmVhdGVzIChpLmUuIGJ5IGNvbnZlbnRpb24pLlxuICAgIGlmIChzZi5zdGF0ZW1lbnRzLmxlbmd0aCAmJiBzZi5zdGF0ZW1lbnRzWzBdLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTm90RW1pdHRlZFN0YXRlbWVudCkge1xuICAgICAgY29tbWVudHMgPSB0cy5nZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzKHNmLnN0YXRlbWVudHNbMF0pIHx8IFtdO1xuICAgIH1cblxuICAgIGxldCBmaWxlb3ZlcnZpZXdJZHggPSAtMTtcbiAgICBsZXQgcGFyc2VkOiB7dGFnczoganNkb2MuVGFnW119fG51bGwgPSBudWxsO1xuICAgIGZvciAobGV0IGkgPSBjb21tZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgY3VycmVudCA9IGpzZG9jLnBhcnNlQ29udGVudHMoY29tbWVudHNbaV0udGV4dCk7XG4gICAgICBpZiAoY3VycmVudCAhPT0gbnVsbCAmJiBjdXJyZW50LnRhZ3Muc29tZSh0ID0+IEZJTEVPVkVSVklFV19DT01NRU5UX01BUktFUlMuaGFzKHQudGFnTmFtZSkpKSB7XG4gICAgICAgIGZpbGVvdmVydmlld0lkeCA9IGk7XG4gICAgICAgIHBhcnNlZCA9IGN1cnJlbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBZGQgYSBAc3VwcHJlc3Mge2NoZWNrVHlwZXN9IHRhZyB0byBlYWNoIHNvdXJjZSBmaWxlJ3MgSlNEb2MgY29tbWVudCxcbiAgICAvLyBiZWluZyBjYXJlZnVsIHRvIHJldGFpbiBleGlzdGluZyBjb21tZW50cyBhbmQgdGhlaXIgQHN1cHByZXNzJ2lvbnMuXG4gICAgLy8gQ2xvc3VyZSBDb21waWxlciBjb25zaWRlcnMgdGhlICpsYXN0KiBjb21tZW50IHdpdGggQGZpbGVvdmVydmlldyAob3IgQGV4dGVybnMgb3IgQG5vY29tcGlsZSlcbiAgICAvLyB0aGF0IGhhcyBub3QgYmVlbiBhdHRhY2hlZCB0byBzb21lIG90aGVyIHRyZWUgbm9kZSB0byBiZSB0aGUgZmlsZSBvdmVydmlldyBjb21tZW50LCBhbmRcbiAgICAvLyBvbmx5IGFwcGxpZXMgQHN1cHByZXNzIHRhZ3MgZnJvbSBpdC5cbiAgICAvLyBBSkQgY29uc2lkZXJzICphbnkqIGNvbW1lbnQgbWVudGlvbmluZyBAZmlsZW92ZXJ2aWV3LlxuICAgIGlmICghcGFyc2VkKSB7XG4gICAgICAvLyBObyBleGlzdGluZyBjb21tZW50IHRvIG1lcmdlIHdpdGgsIGp1c3QgZW1pdCBhIG5ldyBvbmUuXG4gICAgICByZXR1cm4gYWRkTmV3RmlsZW92ZXJ2aWV3Q29tbWVudChzZik7XG4gICAgfVxuXG4gICAgLy8gQWRkIEBzdXBwcmVzcyB7Y2hlY2tUeXBlc30sIG9yIGFkZCB0byB0aGUgbGlzdCBpbiBhbiBleGlzdGluZyBAc3VwcHJlc3MgdGFnLlxuICAgIC8vIENsb3N1cmUgY29tcGlsZXIgYmFyZnMgaWYgdGhlcmUncyBhIGR1cGxpY2F0ZWQgQHN1cHByZXNzIHRhZyBpbiBhIGZpbGUsIHNvIHRoZSB0YWcgbXVzdFxuICAgIC8vIG9ubHkgYXBwZWFyIG9uY2UgYW5kIGJlIG1lcmdlZC5cbiAgICBjb25zdCB7dGFnc30gPSBwYXJzZWQ7XG4gICAgY29uc3Qgc3VwcHJlc3NUYWcgPSB0YWdzLmZpbmQodCA9PiB0LnRhZ05hbWUgPT09ICdzdXBwcmVzcycpO1xuICAgIGlmIChzdXBwcmVzc1RhZykge1xuICAgICAgY29uc3Qgc3VwcHJlc3Npb25zID0gc3VwcHJlc3NUYWcudHlwZSB8fCAnJztcbiAgICAgIGNvbnN0IHN1cHByZXNzaW9uc0xpc3QgPSBzdXBwcmVzc2lvbnMuc3BsaXQoJywnKS5tYXAocyA9PiBzLnRyaW0oKSk7XG4gICAgICBpZiAoc3VwcHJlc3Npb25zTGlzdC5pbmRleE9mKCdjaGVja1R5cGVzJykgPT09IC0xKSB7XG4gICAgICAgIHN1cHByZXNzaW9uc0xpc3QucHVzaCgnY2hlY2tUeXBlcycpO1xuICAgICAgfVxuICAgICAgc3VwcHJlc3NUYWcudHlwZSA9IHN1cHByZXNzaW9uc0xpc3Quam9pbignLCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YWdzLnB1c2goe1xuICAgICAgICB0YWdOYW1lOiAnc3VwcHJlc3MnLFxuICAgICAgICB0eXBlOiAnY2hlY2tUeXBlcycsXG4gICAgICAgIHRleHQ6ICdjaGVja2VkIGJ5IHRzYycsXG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgY29tbWVudFRleHQgPSBqc2RvYy50b1N0cmluZ1dpdGhvdXRTdGFydEVuZCh0YWdzKTtcbiAgICBjb21tZW50c1tmaWxlb3ZlcnZpZXdJZHhdLnRleHQgPSBjb21tZW50VGV4dDtcbiAgICAvLyBzZiBkb2VzIG5vdCBuZWVkIHRvIGJlIHVwZGF0ZWQsIHN5bnRoZXNpemVkIGNvbW1lbnRzIGFyZSBtdXRhYmxlLlxuICAgIHJldHVybiBzZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkTmV3RmlsZW92ZXJ2aWV3Q29tbWVudChzZjogdHMuU291cmNlRmlsZSk6IHRzLlNvdXJjZUZpbGUge1xuICBjb25zdCBjb21tZW50VGV4dCA9IGpzZG9jLnRvU3RyaW5nV2l0aG91dFN0YXJ0RW5kKFtcbiAgICB7dGFnTmFtZTogJ2ZpbGVvdmVydmlldycsIHRleHQ6ICdhZGRlZCBieSB0c2lja2xlJ30sXG4gICAge3RhZ05hbWU6ICdzdXBwcmVzcycsIHR5cGU6ICdjaGVja1R5cGVzJywgdGV4dDogJ2NoZWNrZWQgYnkgdHNjJ30sXG4gIF0pO1xuICBsZXQgc3ludGhldGljRmlyc3RTdGF0ZW1lbnQgPSBjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50KHNmKTtcbiAgc3ludGhldGljRmlyc3RTdGF0ZW1lbnQgPSB0cy5hZGRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnQoXG4gICAgICBzeW50aGV0aWNGaXJzdFN0YXRlbWVudCwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLCBjb21tZW50VGV4dCwgdHJ1ZSk7XG4gIHJldHVybiB1cGRhdGVTb3VyY2VGaWxlTm9kZShzZiwgdHMuY3JlYXRlTm9kZUFycmF5KFtzeW50aGV0aWNGaXJzdFN0YXRlbWVudCwgLi4uc2Yuc3RhdGVtZW50c10pKTtcbn1cbiJdfQ==