/**
 * @license Angular v5.2.5
 * (c) 2010-2018 Google, Inc. https://angular.io/
 * License: MIT
 */
import { ASTWithSource, AotSummaryResolver, AstPath, Attribute, CompileMetadataResolver, CompilerConfig, CssSelector, DEFAULT_INTERPOLATION_CONFIG, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, Element, ElementAst, HtmlParser, I18NHtmlParser, ImplicitReceiver, JitSummaryResolver, Lexer, NAMED_ENTITIES, NgModuleResolver, NullAstVisitor, NullTemplateVisitor, ParseSpan, ParseTreeResult, Parser, PipeResolver, PropertyRead, RecursiveTemplateAstVisitor, ResourceLoader, SelectorMatcher, StaticReflector, StaticSymbolCache, StaticSymbolResolver, TagContentType, TemplateParser, Text, analyzeNgModules, createOfflineCompileUrlResolver, findNode, getHtmlTagDefinition, identifierName, isFormattedError, splitNsName, templateVisitAll, tokenReference, visitAstChildren } from '@angular/compiler';
import { __extends } from 'tslib';
import { AstType, BuiltinType, MetadataCollector, createMetadataReaderCache, getClassMembersFromDeclaration, getExpressionScope, getPipesTable, getSymbolQuery, getTemplateExpressionDiagnostics, readMetadata } from '@angular/compiler-cli/src/language_services';
import { DiagnosticCategory, SyntaxKind, createModuleResolutionCache, forEachChild, getPositionOfLineAndCharacter, resolveModuleName } from 'typescript';
import { Version, ViewEncapsulation, ɵConsole } from '@angular/core';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * The kind of diagnostic message.
 *
 * @experimental
 */
var DiagnosticKind;
(function (DiagnosticKind) {
    DiagnosticKind[DiagnosticKind["Error"] = 0] = "Error";
    DiagnosticKind[DiagnosticKind["Warning"] = 1] = "Warning";
})(DiagnosticKind || (DiagnosticKind = {}));

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function isParseSourceSpan(value) {
    return value && !!value.start;
}
function spanOf(span) {
    if (!span)
        return undefined;
    if (isParseSourceSpan(span)) {
        return { start: span.start.offset, end: span.end.offset };
    }
    else {
        if (span.endSourceSpan) {
            return { start: span.sourceSpan.start.offset, end: span.endSourceSpan.end.offset };
        }
        else if (span.children && span.children.length) {
            return {
                start: span.sourceSpan.start.offset,
                end: spanOf(span.children[span.children.length - 1]).end
            };
        }
        return { start: span.sourceSpan.start.offset, end: span.sourceSpan.end.offset };
    }
}
function inSpan(position, span, exclusive) {
    return span != null && (exclusive ? position >= span.start && position < span.end :
        position >= span.start && position <= span.end);
}
function offsetSpan(span, amount) {
    return { start: span.start + amount, end: span.end + amount };
}
function isNarrower(spanA, spanB) {
    return spanA.start >= spanB.start && spanA.end <= spanB.end;
}
function hasTemplateReference(type) {
    if (type.diDeps) {
        for (var _i = 0, _a = type.diDeps; _i < _a.length; _i++) {
            var diDep = _a[_i];
            if (diDep.token && diDep.token.identifier &&
                identifierName(diDep.token.identifier) == 'TemplateRef')
                return true;
        }
    }
    return false;
}
function getSelectors(info) {
    var map = new Map();
    var selectors = flatten(info.directives.map(function (directive) {
        var selectors = CssSelector.parse(directive.selector);
        selectors.forEach(function (selector) { return map.set(selector, directive); });
        return selectors;
    }));
    return { selectors: selectors, map: map };
}
function flatten(a) {
    return (_a = []).concat.apply(_a, a);
    var _a;
}
function removeSuffix(value, suffix) {
    if (value.endsWith(suffix))
        return value.substring(0, value.length - suffix.length);
    return value;
}
function uniqueByName(elements) {
    if (elements) {
        var result = [];
        var set = new Set();
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (!set.has(element.name)) {
                set.add(element.name);
                result.push(element);
            }
        }
        return result;
    }
}

function diagnosticInfoFromTemplateInfo(info) {
    return {
        fileName: info.fileName,
        offset: info.template.span.start,
        query: info.template.query,
        members: info.template.members,
        htmlAst: info.htmlAst,
        templateAst: info.templateAst
    };
}
function findTemplateAstAt(ast, position, allowWidening) {
    if (allowWidening === void 0) { allowWidening = false; }
    var path$$1 = [];
    var visitor = new /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.visit = function (ast, context) {
            var span = spanOf(ast);
            if (inSpan(position, span)) {
                var len = path$$1.length;
                if (!len || allowWidening || isNarrower(span, spanOf(path$$1[len - 1]))) {
                    path$$1.push(ast);
                }
            }
            else {
                // Returning a value here will result in the children being skipped.
                return true;
            }
        };
        class_1.prototype.visitEmbeddedTemplate = function (ast, context) {
            return this.visitChildren(context, function (visit) {
                // Ignore reference, variable and providers
                visit(ast.attrs);
                visit(ast.directives);
                visit(ast.children);
            });
        };
        class_1.prototype.visitElement = function (ast, context) {
            return this.visitChildren(context, function (visit) {
                // Ingnore providers
                visit(ast.attrs);
                visit(ast.inputs);
                visit(ast.outputs);
                visit(ast.references);
                visit(ast.directives);
                visit(ast.children);
            });
        };
        class_1.prototype.visitDirective = function (ast, context) {
            // Ignore the host properties of a directive
            var result = this.visitChildren(context, function (visit) { visit(ast.inputs); });
            // We never care about the diretive itself, just its inputs.
            if (path$$1[path$$1.length - 1] == ast) {
                path$$1.pop();
            }
            return result;
        };
        return class_1;
    }(RecursiveTemplateAstVisitor));
    templateVisitAll(visitor, ast);
    return new AstPath(path$$1, position);
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function findAstAt(ast, position, excludeEmpty) {
    if (excludeEmpty === void 0) { excludeEmpty = false; }
    var path$$1 = [];
    var visitor = new /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        class_1.prototype.visit = function (ast) {
            if ((!excludeEmpty || ast.span.start < ast.span.end) && inSpan(position, ast.span)) {
                path$$1.push(ast);
                visitAstChildren(ast, this);
            }
        };
        return class_1;
    }(NullAstVisitor));
    // We never care about the ASTWithSource node and its visit() method calls its ast's visit so
    // the visit() method above would never see it.
    if (ast instanceof ASTWithSource) {
        ast = ast.ast;
    }
    visitor.visit(ast);
    return new AstPath(path$$1, position);
}
function getExpressionCompletions(scope, ast, position, query) {
    var path$$1 = findAstAt(ast, position);
    if (path$$1.empty)
        return undefined;
    var tail = path$$1.tail;
    var result = scope;
    function getType(ast) { return new AstType(scope, query, {}).getType(ast); }
    // If the completion request is in a not in a pipe or property access then the global scope
    // (that is the scope of the implicit receiver) is the right scope as the user is typing the
    // beginning of an expression.
    tail.visit({
        visitBinary: function (ast) { },
        visitChain: function (ast) { },
        visitConditional: function (ast) { },
        visitFunctionCall: function (ast) { },
        visitImplicitReceiver: function (ast) { },
        visitInterpolation: function (ast) { result = undefined; },
        visitKeyedRead: function (ast) { },
        visitKeyedWrite: function (ast) { },
        visitLiteralArray: function (ast) { },
        visitLiteralMap: function (ast) { },
        visitLiteralPrimitive: function (ast) { },
        visitMethodCall: function (ast) { },
        visitPipe: function (ast) {
            if (position >= ast.exp.span.end &&
                (!ast.args || !ast.args.length || position < ast.args[0].span.start)) {
                // We are in a position a pipe name is expected.
                result = query.getPipes();
            }
        },
        visitPrefixNot: function (ast) { },
        visitNonNullAssert: function (ast) { },
        visitPropertyRead: function (ast) {
            var receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
        visitPropertyWrite: function (ast) {
            var receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
        visitQuote: function (ast) {
            // For a quote, return the members of any (if there are any).
            result = query.getBuiltinType(BuiltinType.Any).members();
        },
        visitSafeMethodCall: function (ast) {
            var receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
        visitSafePropertyRead: function (ast) {
            var receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
    });
    return result && result.values();
}
function getExpressionSymbol(scope, ast, position, query) {
    var path$$1 = findAstAt(ast, position, /* excludeEmpty */ true);
    if (path$$1.empty)
        return undefined;
    var tail = path$$1.tail;
    function getType(ast) { return new AstType(scope, query, {}).getType(ast); }
    var symbol = undefined;
    var span = undefined;
    // If the completion request is in a not in a pipe or property access then the global scope
    // (that is the scope of the implicit receiver) is the right scope as the user is typing the
    // beginning of an expression.
    tail.visit({
        visitBinary: function (ast) { },
        visitChain: function (ast) { },
        visitConditional: function (ast) { },
        visitFunctionCall: function (ast) { },
        visitImplicitReceiver: function (ast) { },
        visitInterpolation: function (ast) { },
        visitKeyedRead: function (ast) { },
        visitKeyedWrite: function (ast) { },
        visitLiteralArray: function (ast) { },
        visitLiteralMap: function (ast) { },
        visitLiteralPrimitive: function (ast) { },
        visitMethodCall: function (ast) {
            var receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitPipe: function (ast) {
            if (position >= ast.exp.span.end &&
                (!ast.args || !ast.args.length || position < ast.args[0].span.start)) {
                // We are in a position a pipe name is expected.
                var pipes = query.getPipes();
                if (pipes) {
                    symbol = pipes.get(ast.name);
                    span = ast.span;
                }
            }
        },
        visitPrefixNot: function (ast) { },
        visitNonNullAssert: function (ast) { },
        visitPropertyRead: function (ast) {
            var receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitPropertyWrite: function (ast) {
            var receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitQuote: function (ast) { },
        visitSafeMethodCall: function (ast) {
            var receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitSafePropertyRead: function (ast) {
            var receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
    });
    if (symbol && span) {
        return { symbol: symbol, span: span };
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var values = [
    'ID',
    'CDATA',
    'NAME',
    ['ltr', 'rtl'],
    ['rect', 'circle', 'poly', 'default'],
    'NUMBER',
    ['nohref'],
    ['ismap'],
    ['declare'],
    ['DATA', 'REF', 'OBJECT'],
    ['GET', 'POST'],
    'IDREF',
    ['TEXT', 'PASSWORD', 'CHECKBOX', 'RADIO', 'SUBMIT', 'RESET', 'FILE', 'HIDDEN', 'IMAGE', 'BUTTON'],
    ['checked'],
    ['disabled'],
    ['readonly'],
    ['multiple'],
    ['selected'],
    ['button', 'submit', 'reset'],
    ['void', 'above', 'below', 'hsides', 'lhs', 'rhs', 'vsides', 'box', 'border'],
    ['none', 'groups', 'rows', 'cols', 'all'],
    ['left', 'center', 'right', 'justify', 'char'],
    ['top', 'middle', 'bottom', 'baseline'],
    'IDREFS',
    ['row', 'col', 'rowgroup', 'colgroup'],
    ['defer']
];
var groups = [
    { id: 0 },
    {
        onclick: 1,
        ondblclick: 1,
        onmousedown: 1,
        onmouseup: 1,
        onmouseover: 1,
        onmousemove: 1,
        onmouseout: 1,
        onkeypress: 1,
        onkeydown: 1,
        onkeyup: 1
    },
    { lang: 2, dir: 3 },
    { onload: 1, onunload: 1 },
    { name: 1 },
    { href: 1 },
    { type: 1 },
    { alt: 1 },
    { tabindex: 5 },
    { media: 1 },
    { nohref: 6 },
    { usemap: 1 },
    { src: 1 },
    { onfocus: 1, onblur: 1 },
    { charset: 1 },
    { declare: 8, classid: 1, codebase: 1, data: 1, codetype: 1, archive: 1, standby: 1 },
    { title: 1 },
    { value: 1 },
    { cite: 1 },
    { datetime: 1 },
    { accept: 1 },
    { shape: 4, coords: 1 },
    { for: 11
    },
    { action: 1, method: 10, enctype: 1, onsubmit: 1, onreset: 1, 'accept-charset': 1 },
    { valuetype: 9 },
    { longdesc: 1 },
    { width: 1 },
    { disabled: 14 },
    { readonly: 15, onselect: 1 },
    { accesskey: 1 },
    { size: 5, multiple: 16 },
    { onchange: 1 },
    { label: 1 },
    { selected: 17 },
    { type: 12, checked: 13, size: 1, maxlength: 5 },
    { rows: 5, cols: 5 },
    { type: 18 },
    { height: 1 },
    { summary: 1, border: 1, frame: 19, rules: 20, cellspacing: 1, cellpadding: 1, datapagesize: 1 },
    { align: 21, char: 1, charoff: 1, valign: 22 },
    { span: 5 },
    { abbr: 1, axis: 1, headers: 23, scope: 24, rowspan: 5, colspan: 5 },
    { profile: 1 },
    { 'http-equiv': 2, name: 2, content: 1, scheme: 1 },
    { class: 1, style: 1 },
    { hreflang: 2, rel: 1, rev: 1 },
    { ismap: 7 },
    { defer: 25, event: 1, for: 1 }
];
var elements = {
    TT: [0, 1, 2, 16, 44],
    I: [0, 1, 2, 16, 44],
    B: [0, 1, 2, 16, 44],
    BIG: [0, 1, 2, 16, 44],
    SMALL: [0, 1, 2, 16, 44],
    EM: [0, 1, 2, 16, 44],
    STRONG: [0, 1, 2, 16, 44],
    DFN: [0, 1, 2, 16, 44],
    CODE: [0, 1, 2, 16, 44],
    SAMP: [0, 1, 2, 16, 44],
    KBD: [0, 1, 2, 16, 44],
    VAR: [0, 1, 2, 16, 44],
    CITE: [0, 1, 2, 16, 44],
    ABBR: [0, 1, 2, 16, 44],
    ACRONYM: [0, 1, 2, 16, 44],
    SUB: [0, 1, 2, 16, 44],
    SUP: [0, 1, 2, 16, 44],
    SPAN: [0, 1, 2, 16, 44],
    BDO: [0, 2, 16, 44],
    BR: [0, 16, 44],
    BODY: [0, 1, 2, 3, 16, 44],
    ADDRESS: [0, 1, 2, 16, 44],
    DIV: [0, 1, 2, 16, 44],
    A: [0, 1, 2, 4, 5, 6, 8, 13, 14, 16, 21, 29, 44, 45],
    MAP: [0, 1, 2, 4, 16, 44],
    AREA: [0, 1, 2, 5, 7, 8, 10, 13, 16, 21, 29, 44],
    LINK: [0, 1, 2, 5, 6, 9, 14, 16, 44, 45],
    IMG: [0, 1, 2, 4, 7, 11, 12, 16, 25, 26, 37, 44, 46],
    OBJECT: [0, 1, 2, 4, 6, 8, 11, 15, 16, 26, 37, 44],
    PARAM: [0, 4, 6, 17, 24],
    HR: [0, 1, 2, 16, 44],
    P: [0, 1, 2, 16, 44],
    H1: [0, 1, 2, 16, 44],
    H2: [0, 1, 2, 16, 44],
    H3: [0, 1, 2, 16, 44],
    H4: [0, 1, 2, 16, 44],
    H5: [0, 1, 2, 16, 44],
    H6: [0, 1, 2, 16, 44],
    PRE: [0, 1, 2, 16, 44],
    Q: [0, 1, 2, 16, 18, 44],
    BLOCKQUOTE: [0, 1, 2, 16, 18, 44],
    INS: [0, 1, 2, 16, 18, 19, 44],
    DEL: [0, 1, 2, 16, 18, 19, 44],
    DL: [0, 1, 2, 16, 44],
    DT: [0, 1, 2, 16, 44],
    DD: [0, 1, 2, 16, 44],
    OL: [0, 1, 2, 16, 44],
    UL: [0, 1, 2, 16, 44],
    LI: [0, 1, 2, 16, 44],
    FORM: [0, 1, 2, 4, 16, 20, 23, 44],
    LABEL: [0, 1, 2, 13, 16, 22, 29, 44],
    INPUT: [0, 1, 2, 4, 7, 8, 11, 12, 13, 16, 17, 20, 27, 28, 29, 31, 34, 44, 46],
    SELECT: [0, 1, 2, 4, 8, 13, 16, 27, 30, 31, 44],
    OPTGROUP: [0, 1, 2, 16, 27, 32, 44],
    OPTION: [0, 1, 2, 16, 17, 27, 32, 33, 44],
    TEXTAREA: [0, 1, 2, 4, 8, 13, 16, 27, 28, 29, 31, 35, 44],
    FIELDSET: [0, 1, 2, 16, 44],
    LEGEND: [0, 1, 2, 16, 29, 44],
    BUTTON: [0, 1, 2, 4, 8, 13, 16, 17, 27, 29, 36, 44],
    TABLE: [0, 1, 2, 16, 26, 38, 44],
    CAPTION: [0, 1, 2, 16, 44],
    COLGROUP: [0, 1, 2, 16, 26, 39, 40, 44],
    COL: [0, 1, 2, 16, 26, 39, 40, 44],
    THEAD: [0, 1, 2, 16, 39, 44],
    TBODY: [0, 1, 2, 16, 39, 44],
    TFOOT: [0, 1, 2, 16, 39, 44],
    TR: [0, 1, 2, 16, 39, 44],
    TH: [0, 1, 2, 16, 39, 41, 44],
    TD: [0, 1, 2, 16, 39, 41, 44],
    HEAD: [2, 42],
    TITLE: [2],
    BASE: [5],
    META: [2, 43],
    STYLE: [2, 6, 9, 16],
    SCRIPT: [6, 12, 14, 47],
    NOSCRIPT: [0, 1, 2, 16, 44],
    HTML: [2]
};
var defaultAttributes = [0, 1, 2, 4];
function elementNames() {
    return Object.keys(elements).sort().map(function (v) { return v.toLowerCase(); });
}
function compose(indexes) {
    var result = {};
    if (indexes) {
        for (var _i = 0, indexes_1 = indexes; _i < indexes_1.length; _i++) {
            var index = indexes_1[_i];
            var group = groups[index];
            for (var name_1 in group)
                if (group.hasOwnProperty(name_1))
                    result[name_1] = values[group[name_1]];
        }
    }
    return result;
}
function attributeNames(element) {
    return Object.keys(compose(elements[element.toUpperCase()] || defaultAttributes)).sort();
}

// This section is describes the DOM property surface of a DOM element and is derivgulp formated
// from
// from the SCHEMA strings from the security context information. SCHEMA is copied here because
// it would be an unnecessary risk to allow this array to be imported from the security context
// schema registry.
var SCHEMA = [
    '[Element]|textContent,%classList,className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop,slot' +
        /* added manually to avoid breaking changes */
        ',*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored',
    '[HTMLElement]^[Element]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
    'abbr,address,article,aside,b,bdi,bdo,cite,code,dd,dfn,dt,em,figcaption,figure,footer,header,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
    'media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,src,%srcObject,#volume',
    ':svg:^[HTMLElement]|*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,%style,#tabIndex',
    ':svg:graphics^:svg:|',
    ':svg:animation^:svg:|*begin,*end,*repeat',
    ':svg:geometry^:svg:|',
    ':svg:componentTransferFunction^:svg:|',
    ':svg:gradient^:svg:|',
    ':svg:textContent^:svg:graphics|',
    ':svg:textPositioning^:svg:textContent|',
    'a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,rev,search,shape,target,text,type,username',
    'area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,search,shape,target,username',
    'audio^media|',
    'br^[HTMLElement]|clear',
    'base^[HTMLElement]|href,target',
    'body^[HTMLElement]|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
    'button^[HTMLElement]|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
    'canvas^[HTMLElement]|#height,#width',
    'content^[HTMLElement]|select',
    'dl^[HTMLElement]|!compact',
    'datalist^[HTMLElement]|',
    'details^[HTMLElement]|!open',
    'dialog^[HTMLElement]|!open,returnValue',
    'dir^[HTMLElement]|!compact',
    'div^[HTMLElement]|align',
    'embed^[HTMLElement]|align,height,name,src,type,width',
    'fieldset^[HTMLElement]|!disabled,name',
    'font^[HTMLElement]|color,face,size',
    'form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target',
    'frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src',
    'frameset^[HTMLElement]|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
    'hr^[HTMLElement]|align,color,!noShade,size,width',
    'head^[HTMLElement]|',
    'h1,h2,h3,h4,h5,h6^[HTMLElement]|align',
    'html^[HTMLElement]|version',
    'iframe^[HTMLElement]|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width',
    'img^[HTMLElement]|align,alt,border,%crossOrigin,#height,#hspace,!isMap,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width',
    'input^[HTMLElement]|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
    'li^[HTMLElement]|type,#value',
    'label^[HTMLElement]|htmlFor',
    'legend^[HTMLElement]|align',
    'link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type',
    'map^[HTMLElement]|name',
    'marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
    'menu^[HTMLElement]|!compact',
    'meta^[HTMLElement]|content,httpEquiv,name,scheme',
    'meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value',
    'ins,del^[HTMLElement]|cite,dateTime',
    'ol^[HTMLElement]|!compact,!reversed,#start,type',
    'object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width',
    'optgroup^[HTMLElement]|!disabled,label',
    'option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value',
    'output^[HTMLElement]|defaultValue,%htmlFor,name,value',
    'p^[HTMLElement]|align',
    'param^[HTMLElement]|name,type,value,valueType',
    'picture^[HTMLElement]|',
    'pre^[HTMLElement]|#width',
    'progress^[HTMLElement]|#max,#value',
    'q,blockquote,cite^[HTMLElement]|',
    'script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,src,text,type',
    'select^[HTMLElement]|!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
    'shadow^[HTMLElement]|',
    'slot^[HTMLElement]|name',
    'source^[HTMLElement]|media,sizes,src,srcset,type',
    'span^[HTMLElement]|',
    'style^[HTMLElement]|!disabled,media,type',
    'caption^[HTMLElement]|align',
    'th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
    'col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width',
    'table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
    'tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign',
    'tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign',
    'template^[HTMLElement]|',
    'textarea^[HTMLElement]|autocapitalize,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
    'title^[HTMLElement]|text',
    'track^[HTMLElement]|!default,kind,label,src,srclang',
    'ul^[HTMLElement]|!compact,type',
    'unknown^[HTMLElement]|',
    'video^media|#height,poster,#width',
    ':svg:a^:svg:graphics|',
    ':svg:animate^:svg:animation|',
    ':svg:animateMotion^:svg:animation|',
    ':svg:animateTransform^:svg:animation|',
    ':svg:circle^:svg:geometry|',
    ':svg:clipPath^:svg:graphics|',
    ':svg:defs^:svg:graphics|',
    ':svg:desc^:svg:|',
    ':svg:discard^:svg:|',
    ':svg:ellipse^:svg:geometry|',
    ':svg:feBlend^:svg:|',
    ':svg:feColorMatrix^:svg:|',
    ':svg:feComponentTransfer^:svg:|',
    ':svg:feComposite^:svg:|',
    ':svg:feConvolveMatrix^:svg:|',
    ':svg:feDiffuseLighting^:svg:|',
    ':svg:feDisplacementMap^:svg:|',
    ':svg:feDistantLight^:svg:|',
    ':svg:feDropShadow^:svg:|',
    ':svg:feFlood^:svg:|',
    ':svg:feFuncA^:svg:componentTransferFunction|',
    ':svg:feFuncB^:svg:componentTransferFunction|',
    ':svg:feFuncG^:svg:componentTransferFunction|',
    ':svg:feFuncR^:svg:componentTransferFunction|',
    ':svg:feGaussianBlur^:svg:|',
    ':svg:feImage^:svg:|',
    ':svg:feMerge^:svg:|',
    ':svg:feMergeNode^:svg:|',
    ':svg:feMorphology^:svg:|',
    ':svg:feOffset^:svg:|',
    ':svg:fePointLight^:svg:|',
    ':svg:feSpecularLighting^:svg:|',
    ':svg:feSpotLight^:svg:|',
    ':svg:feTile^:svg:|',
    ':svg:feTurbulence^:svg:|',
    ':svg:filter^:svg:|',
    ':svg:foreignObject^:svg:graphics|',
    ':svg:g^:svg:graphics|',
    ':svg:image^:svg:graphics|',
    ':svg:line^:svg:geometry|',
    ':svg:linearGradient^:svg:gradient|',
    ':svg:mpath^:svg:|',
    ':svg:marker^:svg:|',
    ':svg:mask^:svg:|',
    ':svg:metadata^:svg:|',
    ':svg:path^:svg:geometry|',
    ':svg:pattern^:svg:|',
    ':svg:polygon^:svg:geometry|',
    ':svg:polyline^:svg:geometry|',
    ':svg:radialGradient^:svg:gradient|',
    ':svg:rect^:svg:geometry|',
    ':svg:svg^:svg:graphics|#currentScale,#zoomAndPan',
    ':svg:script^:svg:|type',
    ':svg:set^:svg:animation|',
    ':svg:stop^:svg:|',
    ':svg:style^:svg:|!disabled,media,title,type',
    ':svg:switch^:svg:graphics|',
    ':svg:symbol^:svg:|',
    ':svg:tspan^:svg:textPositioning|',
    ':svg:text^:svg:textPositioning|',
    ':svg:textPath^:svg:textContent|',
    ':svg:title^:svg:|',
    ':svg:use^:svg:graphics|',
    ':svg:view^:svg:|#zoomAndPan',
    'data^[HTMLElement]|value',
    'keygen^[HTMLElement]|!autofocus,challenge,!disabled,form,keytype,name',
    'menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default',
    'summary^[HTMLElement]|',
    'time^[HTMLElement]|dateTime',
    ':svg:cursor^:svg:|',
];
var EVENT = 'event';
var BOOLEAN = 'boolean';
var NUMBER = 'number';
var STRING = 'string';
var OBJECT = 'object';
var SchemaInformation = /** @class */ (function () {
    function SchemaInformation() {
        var _this = this;
        this.schema = {};
        SCHEMA.forEach(function (encodedType) {
            var parts = encodedType.split('|');
            var properties = parts[1].split(',');
            var typeParts = (parts[0] + '^').split('^');
            var typeName = typeParts[0];
            var type = {};
            typeName.split(',').forEach(function (tag) { return _this.schema[tag.toLowerCase()] = type; });
            var superName = typeParts[1];
            var superType = superName && _this.schema[superName.toLowerCase()];
            if (superType) {
                for (var key in superType) {
                    type[key] = superType[key];
                }
            }
            properties.forEach(function (property) {
                if (property == '') {
                }
                else if (property.startsWith('*')) {
                    type[property.substring(1)] = EVENT;
                }
                else if (property.startsWith('!')) {
                    type[property.substring(1)] = BOOLEAN;
                }
                else if (property.startsWith('#')) {
                    type[property.substring(1)] = NUMBER;
                }
                else if (property.startsWith('%')) {
                    type[property.substring(1)] = OBJECT;
                }
                else {
                    type[property] = STRING;
                }
            });
        });
    }
    SchemaInformation.prototype.allKnownElements = function () { return Object.keys(this.schema); };
    SchemaInformation.prototype.eventsOf = function (elementName) {
        var elementType = this.schema[elementName.toLowerCase()] || {};
        return Object.keys(elementType).filter(function (property) { return elementType[property] === EVENT; });
    };
    SchemaInformation.prototype.propertiesOf = function (elementName) {
        var elementType = this.schema[elementName.toLowerCase()] || {};
        return Object.keys(elementType).filter(function (property) { return elementType[property] !== EVENT; });
    };
    SchemaInformation.prototype.typeOf = function (elementName, property) {
        return (this.schema[elementName.toLowerCase()] || {})[property];
    };
    Object.defineProperty(SchemaInformation, "instance", {
        get: function () {
            var result = SchemaInformation._instance;
            if (!result) {
                result = SchemaInformation._instance = new SchemaInformation();
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return SchemaInformation;
}());
function eventNames(elementName) {
    return SchemaInformation.instance.eventsOf(elementName);
}
function propertyNames(elementName) {
    return SchemaInformation.instance.propertiesOf(elementName);
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var TEMPLATE_ATTR_PREFIX = '*';
var hiddenHtmlElements = {
    html: true,
    script: true,
    noscript: true,
    base: true,
    body: true,
    title: true,
    head: true,
    link: true,
};
function getTemplateCompletions(templateInfo) {
    var result = undefined;
    var htmlAst = templateInfo.htmlAst, templateAst = templateInfo.templateAst, template = templateInfo.template;
    // The templateNode starts at the delimiter character so we add 1 to skip it.
    if (templateInfo.position != null) {
        var templatePosition_1 = templateInfo.position - template.span.start;
        var path_1 = findNode(htmlAst, templatePosition_1);
        var mostSpecific = path_1.tail;
        if (path_1.empty || !mostSpecific) {
            result = elementCompletions(templateInfo, path_1);
        }
        else {
            var astPosition_1 = templatePosition_1 - mostSpecific.sourceSpan.start.offset;
            mostSpecific.visit({
                visitElement: function (ast) {
                    var startTagSpan = spanOf(ast.sourceSpan);
                    var tagLen = ast.name.length;
                    if (templatePosition_1 <=
                        startTagSpan.start + tagLen + 1 /* 1 for the opening angle bracked */) {
                        // If we are in the tag then return the element completions.
                        result = elementCompletions(templateInfo, path_1);
                    }
                    else if (templatePosition_1 < startTagSpan.end) {
                        // We are in the attribute section of the element (but not in an attribute).
                        // Return the attribute completions.
                        result = attributeCompletions(templateInfo, path_1);
                    }
                },
                visitAttribute: function (ast) {
                    if (!ast.valueSpan || !inSpan(templatePosition_1, spanOf(ast.valueSpan))) {
                        // We are in the name of an attribute. Show attribute completions.
                        result = attributeCompletions(templateInfo, path_1);
                    }
                    else if (ast.valueSpan && inSpan(templatePosition_1, spanOf(ast.valueSpan))) {
                        result = attributeValueCompletions(templateInfo, templatePosition_1, ast);
                    }
                },
                visitText: function (ast) {
                    // Check if we are in a entity.
                    result = entityCompletions(getSourceText(template, spanOf(ast)), astPosition_1);
                    if (result)
                        return result;
                    result = interpolationCompletions(templateInfo, templatePosition_1);
                    if (result)
                        return result;
                    var element = path_1.first(Element);
                    if (element) {
                        var definition = getHtmlTagDefinition(element.name);
                        if (definition.contentType === TagContentType.PARSABLE_DATA) {
                            result = voidElementAttributeCompletions(templateInfo, path_1);
                            if (!result) {
                                // If the element can hold content Show element completions.
                                result = elementCompletions(templateInfo, path_1);
                            }
                        }
                    }
                    else {
                        // If no element container, implies parsable data so show elements.
                        result = voidElementAttributeCompletions(templateInfo, path_1);
                        if (!result) {
                            result = elementCompletions(templateInfo, path_1);
                        }
                    }
                },
                visitComment: function (ast) { },
                visitExpansion: function (ast) { },
                visitExpansionCase: function (ast) { }
            }, null);
        }
    }
    return result;
}
function attributeCompletions(info, path$$1) {
    var item = path$$1.tail instanceof Element ? path$$1.tail : path$$1.parentOf(path$$1.tail);
    if (item instanceof Element) {
        return attributeCompletionsForElement(info, item.name, item);
    }
    return undefined;
}
function attributeCompletionsForElement(info, elementName, element) {
    var attributes = getAttributeInfosForElement(info, elementName, element);
    // Map all the attributes to a completion
    return attributes.map(function (attr) { return ({
        kind: attr.fromHtml ? 'html attribute' : 'attribute',
        name: nameOfAttr(attr),
        sort: attr.name
    }); });
}
function getAttributeInfosForElement(info, elementName, element) {
    var attributes = [];
    // Add html attributes
    var htmlAttributes = attributeNames(elementName) || [];
    if (htmlAttributes) {
        attributes.push.apply(attributes, htmlAttributes.map(function (name) { return ({ name: name, fromHtml: true }); }));
    }
    // Add html properties
    var htmlProperties = propertyNames(elementName);
    if (htmlProperties) {
        attributes.push.apply(attributes, htmlProperties.map(function (name) { return ({ name: name, input: true }); }));
    }
    // Add html events
    var htmlEvents = eventNames(elementName);
    if (htmlEvents) {
        attributes.push.apply(attributes, htmlEvents.map(function (name) { return ({ name: name, output: true }); }));
    }
    var _a = getSelectors(info), selectors = _a.selectors, selectorMap = _a.map;
    if (selectors && selectors.length) {
        // All the attributes that are selectable should be shown.
        var applicableSelectors = selectors.filter(function (selector) { return !selector.element || selector.element == elementName; });
        var selectorAndAttributeNames = applicableSelectors.map(function (selector) { return ({ selector: selector, attrs: selector.attrs.filter(function (a) { return !!a; }) }); });
        var attrs_1 = flatten(selectorAndAttributeNames.map(function (selectorAndAttr) {
            var directive = selectorMap.get(selectorAndAttr.selector);
            var result = selectorAndAttr.attrs.map(function (name) { return ({ name: name, input: name in directive.inputs, output: name in directive.outputs }); });
            return result;
        }));
        // Add template attribute if a directive contains a template reference
        selectorAndAttributeNames.forEach(function (selectorAndAttr) {
            var selector = selectorAndAttr.selector;
            var directive = selectorMap.get(selector);
            if (directive && hasTemplateReference(directive.type) && selector.attrs.length &&
                selector.attrs[0]) {
                attrs_1.push({ name: selector.attrs[0], template: true });
            }
        });
        // All input and output properties of the matching directives should be added.
        var elementSelector = element ?
            createElementCssSelector(element) :
            createElementCssSelector(new Element(elementName, [], [], null, null, null));
        var matcher = new SelectorMatcher();
        matcher.addSelectables(selectors);
        matcher.match(elementSelector, function (selector) {
            var directive = selectorMap.get(selector);
            if (directive) {
                attrs_1.push.apply(attrs_1, Object.keys(directive.inputs).map(function (name) { return ({ name: name, input: true }); }));
                attrs_1.push.apply(attrs_1, Object.keys(directive.outputs).map(function (name) { return ({ name: name, output: true }); }));
            }
        });
        // If a name shows up twice, fold it into a single value.
        attrs_1 = foldAttrs(attrs_1);
        // Now expand them back out to ensure that input/output shows up as well as input and
        // output.
        attributes.push.apply(attributes, flatten(attrs_1.map(expandedAttr)));
    }
    return attributes;
}
function attributeValueCompletions(info, position, attr) {
    var path$$1 = findTemplateAstAt(info.templateAst, position);
    var mostSpecific = path$$1.tail;
    var dinfo = diagnosticInfoFromTemplateInfo(info);
    if (mostSpecific) {
        var visitor = new ExpressionVisitor(info, position, attr, function () { return getExpressionScope(dinfo, path$$1, false); });
        mostSpecific.visit(visitor, null);
        if (!visitor.result || !visitor.result.length) {
            // Try allwoing widening the path
            var widerPath_1 = findTemplateAstAt(info.templateAst, position, /* allowWidening */ true);
            if (widerPath_1.tail) {
                var widerVisitor = new ExpressionVisitor(info, position, attr, function () { return getExpressionScope(dinfo, widerPath_1, false); });
                widerPath_1.tail.visit(widerVisitor, null);
                return widerVisitor.result;
            }
        }
        return visitor.result;
    }
}
function elementCompletions(info, path$$1) {
    var htmlNames = elementNames().filter(function (name) { return !(name in hiddenHtmlElements); });
    // Collect the elements referenced by the selectors
    var directiveElements = getSelectors(info)
        .selectors.map(function (selector) { return selector.element; })
        .filter(function (name) { return !!name; });
    var components = directiveElements.map(function (name) { return ({ kind: 'component', name: name, sort: name }); });
    var htmlElements = htmlNames.map(function (name) { return ({ kind: 'element', name: name, sort: name }); });
    // Return components and html elements
    return uniqueByName(htmlElements.concat(components));
}
function entityCompletions(value, position) {
    // Look for entity completions
    var re = /&[A-Za-z]*;?(?!\d)/g;
    var found;
    var result = undefined;
    while (found = re.exec(value)) {
        var len = found[0].length;
        if (position >= found.index && position < (found.index + len)) {
            result = Object.keys(NAMED_ENTITIES)
                .map(function (name) { return ({ kind: 'entity', name: "&" + name + ";", sort: name }); });
            break;
        }
    }
    return result;
}
function interpolationCompletions(info, position) {
    // Look for an interpolation in at the position.
    var templatePath = findTemplateAstAt(info.templateAst, position);
    var mostSpecific = templatePath.tail;
    if (mostSpecific) {
        var visitor = new ExpressionVisitor(info, position, undefined, function () { return getExpressionScope(diagnosticInfoFromTemplateInfo(info), templatePath, false); });
        mostSpecific.visit(visitor, null);
        return uniqueByName(visitor.result);
    }
}
// There is a special case of HTML where text that contains a unclosed tag is treated as
// text. For exaple '<h1> Some <a text </h1>' produces a text nodes inside of the H1
// element "Some <a text". We, however, want to treat this as if the user was requesting
// the attributes of an "a" element, not requesting completion in the a text element. This
// code checks for this case and returns element completions if it is detected or undefined
// if it is not.
function voidElementAttributeCompletions(info, path$$1) {
    var tail = path$$1.tail;
    if (tail instanceof Text) {
        var match = tail.value.match(/<(\w(\w|\d|-)*:)?(\w(\w|\d|-)*)\s/);
        // The position must be after the match, otherwise we are still in a place where elements
        // are expected (such as `<|a` or `<a|`; we only want attributes for `<a |` or after).
        if (match &&
            path$$1.position >= (match.index || 0) + match[0].length + tail.sourceSpan.start.offset) {
            return attributeCompletionsForElement(info, match[3]);
        }
    }
}
var ExpressionVisitor = /** @class */ (function (_super) {
    __extends(ExpressionVisitor, _super);
    function ExpressionVisitor(info, position, attr, getExpressionScope$$1) {
        var _this = _super.call(this) || this;
        _this.info = info;
        _this.position = position;
        _this.attr = attr;
        _this.getExpressionScope = getExpressionScope$$1 || (function () { return info.template.members; });
        return _this;
    }
    ExpressionVisitor.prototype.visitDirectiveProperty = function (ast) {
        this.attributeValueCompletions(ast.value);
    };
    ExpressionVisitor.prototype.visitElementProperty = function (ast) {
        this.attributeValueCompletions(ast.value);
    };
    ExpressionVisitor.prototype.visitEvent = function (ast) { this.attributeValueCompletions(ast.handler); };
    ExpressionVisitor.prototype.visitElement = function (ast) {
        var _this = this;
        if (this.attr && getSelectors(this.info) && this.attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            // The value is a template expression but the expression AST was not produced when the
            // TemplateAst was produce so
            // do that now.
            var key_1 = this.attr.name.substr(TEMPLATE_ATTR_PREFIX.length);
            // Find the selector
            var selectorInfo = getSelectors(this.info);
            var selectors = selectorInfo.selectors;
            var selector_1 = selectors.filter(function (s) { return s.attrs.some(function (attr, i) { return i % 2 == 0 && attr == key_1; }); })[0];
            var templateBindingResult = this.info.expressionParser.parseTemplateBindings(key_1, this.attr.value, null);
            // find the template binding that contains the position
            if (!this.attr.valueSpan)
                return;
            var valueRelativePosition_1 = this.position - this.attr.valueSpan.start.offset - 1;
            var bindings = templateBindingResult.templateBindings;
            var binding = bindings.find(function (binding) { return inSpan(valueRelativePosition_1, binding.span, /* exclusive */ true); }) ||
                bindings.find(function (binding) { return inSpan(valueRelativePosition_1, binding.span); });
            var keyCompletions = function () {
                var keys = [];
                if (selector_1) {
                    var attrNames = selector_1.attrs.filter(function (_, i) { return i % 2 == 0; });
                    keys = attrNames.filter(function (name) { return name.startsWith(key_1) && name != key_1; })
                        .map(function (name) { return lowerName(name.substr(key_1.length)); });
                }
                keys.push('let');
                _this.result = keys.map(function (key) { return ({ kind: 'key', name: key, sort: key }); });
            };
            if (!binding || (binding.key == key_1 && !binding.expression)) {
                // We are in the root binding. We should return `let` and keys that are left in the
                // selector.
                keyCompletions();
            }
            else if (binding.keyIsVar) {
                var equalLocation = this.attr.value.indexOf('=');
                this.result = [];
                if (equalLocation >= 0 && valueRelativePosition_1 >= equalLocation) {
                    // We are after the '=' in a let clause. The valid values here are the members of the
                    // template reference's type parameter.
                    var directiveMetadata = selectorInfo.map.get(selector_1);
                    if (directiveMetadata) {
                        var contextTable = this.info.template.query.getTemplateContext(directiveMetadata.type.reference);
                        if (contextTable) {
                            this.result = this.symbolsToCompletions(contextTable.values());
                        }
                    }
                }
                else if (binding.key && valueRelativePosition_1 <= (binding.key.length - key_1.length)) {
                    keyCompletions();
                }
            }
            else {
                // If the position is in the expression or after the key or there is no key, return the
                // expression completions
                if ((binding.expression && inSpan(valueRelativePosition_1, binding.expression.ast.span)) ||
                    (binding.key &&
                        valueRelativePosition_1 > binding.span.start + (binding.key.length - key_1.length)) ||
                    !binding.key) {
                    var span = new ParseSpan(0, this.attr.value.length);
                    this.attributeValueCompletions(binding.expression ? binding.expression.ast :
                        new PropertyRead(span, new ImplicitReceiver(span), ''), valueRelativePosition_1);
                }
                else {
                    keyCompletions();
                }
            }
        }
    };
    ExpressionVisitor.prototype.visitBoundText = function (ast) {
        var expressionPosition = this.position - ast.sourceSpan.start.offset;
        if (inSpan(expressionPosition, ast.value.span)) {
            var completions = getExpressionCompletions(this.getExpressionScope(), ast.value, expressionPosition, this.info.template.query);
            if (completions) {
                this.result = this.symbolsToCompletions(completions);
            }
        }
    };
    ExpressionVisitor.prototype.attributeValueCompletions = function (value, position) {
        var symbols = getExpressionCompletions(this.getExpressionScope(), value, position == null ? this.attributeValuePosition : position, this.info.template.query);
        if (symbols) {
            this.result = this.symbolsToCompletions(symbols);
        }
    };
    ExpressionVisitor.prototype.symbolsToCompletions = function (symbols) {
        return symbols.filter(function (s) { return !s.name.startsWith('__') && s.public; })
            .map(function (symbol) { return ({ kind: symbol.kind, name: symbol.name, sort: symbol.name }); });
    };
    Object.defineProperty(ExpressionVisitor.prototype, "attributeValuePosition", {
        get: function () {
            if (this.attr && this.attr.valueSpan) {
                return this.position - this.attr.valueSpan.start.offset - 1;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    return ExpressionVisitor;
}(NullTemplateVisitor));
function getSourceText(template, span) {
    return template.source.substring(span.start, span.end);
}
function nameOfAttr(attr) {
    var name = attr.name;
    if (attr.output) {
        name = removeSuffix(name, 'Events');
        name = removeSuffix(name, 'Changed');
    }
    var result = [name];
    if (attr.input) {
        result.unshift('[');
        result.push(']');
    }
    if (attr.output) {
        result.unshift('(');
        result.push(')');
    }
    if (attr.template) {
        result.unshift('*');
    }
    return result.join('');
}
var templateAttr = /^(\w+:)?(template$|^\*)/;
function createElementCssSelector(element) {
    var cssSelector = new CssSelector();
    var elNameNoNs = splitNsName(element.name)[1];
    cssSelector.setElement(elNameNoNs);
    for (var _i = 0, _a = element.attrs; _i < _a.length; _i++) {
        var attr = _a[_i];
        if (!attr.name.match(templateAttr)) {
            var _b = splitNsName(attr.name), _ = _b[0], attrNameNoNs = _b[1];
            cssSelector.addAttribute(attrNameNoNs, attr.value);
            if (attr.name.toLowerCase() == 'class') {
                var classes = attr.value.split(/s+/g);
                classes.forEach(function (className) { return cssSelector.addClassName(className); });
            }
        }
    }
    return cssSelector;
}
function foldAttrs(attrs) {
    var inputOutput = new Map();
    var templates = new Map();
    var result = [];
    attrs.forEach(function (attr) {
        if (attr.fromHtml) {
            return attr;
        }
        if (attr.template) {
            var duplicate = templates.get(attr.name);
            if (!duplicate) {
                result.push({ name: attr.name, template: true });
                templates.set(attr.name, attr);
            }
        }
        if (attr.input || attr.output) {
            var duplicate = inputOutput.get(attr.name);
            if (duplicate) {
                duplicate.input = duplicate.input || attr.input;
                duplicate.output = duplicate.output || attr.output;
            }
            else {
                var cloneAttr = { name: attr.name };
                if (attr.input)
                    cloneAttr.input = true;
                if (attr.output)
                    cloneAttr.output = true;
                result.push(cloneAttr);
                inputOutput.set(attr.name, cloneAttr);
            }
        }
    });
    return result;
}
function expandedAttr(attr) {
    if (attr.input && attr.output) {
        return [
            attr, { name: attr.name, input: true, output: false },
            { name: attr.name, input: false, output: true }
        ];
    }
    return [attr];
}
function lowerName(name) {
    return name && (name[0].toLowerCase() + name.substr(1));
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function locateSymbol(info) {
    if (!info.position)
        return undefined;
    var templatePosition = info.position - info.template.span.start;
    var path$$1 = findTemplateAstAt(info.templateAst, templatePosition);
    if (path$$1.tail) {
        var symbol_1 = undefined;
        var span_1 = undefined;
        var attributeValueSymbol_1 = function (ast, inEvent) {
            if (inEvent === void 0) { inEvent = false; }
            var attribute = findAttribute(info);
            if (attribute) {
                if (inSpan(templatePosition, spanOf(attribute.valueSpan))) {
                    var dinfo = diagnosticInfoFromTemplateInfo(info);
                    var scope = getExpressionScope(dinfo, path$$1, inEvent);
                    if (attribute.valueSpan) {
                        var expressionOffset = attribute.valueSpan.start.offset + 1;
                        var result = getExpressionSymbol(scope, ast, templatePosition - expressionOffset, info.template.query);
                        if (result) {
                            symbol_1 = result.symbol;
                            span_1 = offsetSpan(result.span, expressionOffset);
                        }
                    }
                    return true;
                }
            }
            return false;
        };
        path$$1.tail.visit({
            visitNgContent: function (ast) { },
            visitEmbeddedTemplate: function (ast) { },
            visitElement: function (ast) {
                var component = ast.directives.find(function (d) { return d.directive.isComponent; });
                if (component) {
                    symbol_1 = info.template.query.getTypeSymbol(component.directive.type.reference);
                    symbol_1 = symbol_1 && new OverrideKindSymbol(symbol_1, 'component');
                    span_1 = spanOf(ast);
                }
                else {
                    // Find a directive that matches the element name
                    var directive = ast.directives.find(function (d) { return d.directive.selector != null && d.directive.selector.indexOf(ast.name) >= 0; });
                    if (directive) {
                        symbol_1 = info.template.query.getTypeSymbol(directive.directive.type.reference);
                        symbol_1 = symbol_1 && new OverrideKindSymbol(symbol_1, 'directive');
                        span_1 = spanOf(ast);
                    }
                }
            },
            visitReference: function (ast) {
                symbol_1 = ast.value && info.template.query.getTypeSymbol(tokenReference(ast.value));
                span_1 = spanOf(ast);
            },
            visitVariable: function (ast) { },
            visitEvent: function (ast) {
                if (!attributeValueSymbol_1(ast.handler, /* inEvent */ true)) {
                    symbol_1 = findOutputBinding(info, path$$1, ast);
                    symbol_1 = symbol_1 && new OverrideKindSymbol(symbol_1, 'event');
                    span_1 = spanOf(ast);
                }
            },
            visitElementProperty: function (ast) { attributeValueSymbol_1(ast.value); },
            visitAttr: function (ast) { },
            visitBoundText: function (ast) {
                var expressionPosition = templatePosition - ast.sourceSpan.start.offset;
                if (inSpan(expressionPosition, ast.value.span)) {
                    var dinfo = diagnosticInfoFromTemplateInfo(info);
                    var scope = getExpressionScope(dinfo, path$$1, /* includeEvent */ false);
                    var result = getExpressionSymbol(scope, ast.value, expressionPosition, info.template.query);
                    if (result) {
                        symbol_1 = result.symbol;
                        span_1 = offsetSpan(result.span, ast.sourceSpan.start.offset);
                    }
                }
            },
            visitText: function (ast) { },
            visitDirective: function (ast) {
                symbol_1 = info.template.query.getTypeSymbol(ast.directive.type.reference);
                span_1 = spanOf(ast);
            },
            visitDirectiveProperty: function (ast) {
                if (!attributeValueSymbol_1(ast.value)) {
                    symbol_1 = findInputBinding(info, path$$1, ast);
                    span_1 = spanOf(ast);
                }
            }
        }, null);
        if (symbol_1 && span_1) {
            return { symbol: symbol_1, span: offsetSpan(span_1, info.template.span.start) };
        }
    }
}
function findAttribute(info) {
    if (info.position) {
        var templatePosition = info.position - info.template.span.start;
        var path$$1 = findNode(info.htmlAst, templatePosition);
        return path$$1.first(Attribute);
    }
}
function findInputBinding(info, path$$1, binding) {
    var element = path$$1.first(ElementAst);
    if (element) {
        for (var _i = 0, _a = element.directives; _i < _a.length; _i++) {
            var directive = _a[_i];
            var invertedInput = invertMap(directive.directive.inputs);
            var fieldName = invertedInput[binding.templateName];
            if (fieldName) {
                var classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                if (classSymbol) {
                    return classSymbol.members().get(fieldName);
                }
            }
        }
    }
}
function findOutputBinding(info, path$$1, binding) {
    var element = path$$1.first(ElementAst);
    if (element) {
        for (var _i = 0, _a = element.directives; _i < _a.length; _i++) {
            var directive = _a[_i];
            var invertedOutputs = invertMap(directive.directive.outputs);
            var fieldName = invertedOutputs[binding.name];
            if (fieldName) {
                var classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                if (classSymbol) {
                    return classSymbol.members().get(fieldName);
                }
            }
        }
    }
}
function invertMap(obj) {
    var result = {};
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        var v = obj[name_1];
        result[v] = name_1;
    }
    return result;
}
/**
 * Wrap a symbol and change its kind to component.
 */
var OverrideKindSymbol = /** @class */ (function () {
    function OverrideKindSymbol(sym, kindOverride) {
        this.sym = sym;
        this.kind = kindOverride;
    }
    Object.defineProperty(OverrideKindSymbol.prototype, "name", {
        get: function () { return this.sym.name; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OverrideKindSymbol.prototype, "language", {
        get: function () { return this.sym.language; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OverrideKindSymbol.prototype, "type", {
        get: function () { return this.sym.type; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OverrideKindSymbol.prototype, "container", {
        get: function () { return this.sym.container; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OverrideKindSymbol.prototype, "public", {
        get: function () { return this.sym.public; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OverrideKindSymbol.prototype, "callable", {
        get: function () { return this.sym.callable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OverrideKindSymbol.prototype, "nullable", {
        get: function () { return this.sym.nullable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OverrideKindSymbol.prototype, "definition", {
        get: function () { return this.sym.definition; },
        enumerable: true,
        configurable: true
    });
    OverrideKindSymbol.prototype.members = function () { return this.sym.members(); };
    OverrideKindSymbol.prototype.signatures = function () { return this.sym.signatures(); };
    OverrideKindSymbol.prototype.selectSignature = function (types) { return this.sym.selectSignature(types); };
    OverrideKindSymbol.prototype.indexed = function (argument) { return this.sym.indexed(argument); };
    return OverrideKindSymbol;
}());

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getDefinition(info) {
    var result = locateSymbol(info);
    return result && result.symbol.definition;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getTemplateDiagnostics(fileName, astProvider, templates) {
    var results = [];
    var _loop_1 = function (template) {
        var ast = astProvider.getTemplateAst(template, fileName);
        if (ast) {
            if (ast.parseErrors && ast.parseErrors.length) {
                results.push.apply(results, ast.parseErrors.map(function (e) { return ({
                    kind: DiagnosticKind.Error,
                    span: offsetSpan(spanOf(e.span), template.span.start),
                    message: e.msg
                }); }));
            }
            else if (ast.templateAst && ast.htmlAst) {
                var info = {
                    templateAst: ast.templateAst,
                    htmlAst: ast.htmlAst,
                    offset: template.span.start,
                    query: template.query,
                    members: template.members
                };
                var expressionDiagnostics = getTemplateExpressionDiagnostics(info);
                results.push.apply(results, expressionDiagnostics);
            }
            if (ast.errors) {
                results.push.apply(results, ast.errors.map(function (e) { return ({ kind: e.kind, span: e.span || template.span, message: e.message }); }));
            }
        }
    };
    for (var _i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
        var template = templates_1[_i];
        _loop_1(template);
    }
    return results;
}
function getDeclarationDiagnostics(declarations, modules) {
    var results = [];
    var directives = undefined;
    var _loop_2 = function (declaration) {
        var report = function (message, span) {
            results.push({
                kind: DiagnosticKind.Error,
                span: span || declaration.declarationSpan, message: message
            });
        };
        for (var _i = 0, _a = declaration.errors; _i < _a.length; _i++) {
            var error = _a[_i];
            report(error.message, error.span);
        }
        if (declaration.metadata) {
            if (declaration.metadata.isComponent) {
                if (!modules.ngModuleByPipeOrDirective.has(declaration.type)) {
                    report("Component '" + declaration.type.name + "' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration");
                }
                var _b = declaration.metadata.template, template = _b.template, templateUrl = _b.templateUrl;
                if (template === null && !templateUrl) {
                    report("Component '" + declaration.type.name + "' must have a template or templateUrl");
                }
                else if (template && templateUrl) {
                    report("Component '" + declaration.type.name + "' must not have both template and templateUrl");
                }
            }
            else {
                if (!directives) {
                    directives = new Set();
                    modules.ngModules.forEach(function (module) {
                        module.declaredDirectives.forEach(function (directive) { directives.add(directive.reference); });
                    });
                }
                if (!directives.has(declaration.type)) {
                    report("Directive '" + declaration.type.name + "' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration");
                }
            }
        }
    };
    for (var _i = 0, declarations_1 = declarations; _i < declarations_1.length; _i++) {
        var declaration = declarations_1[_i];
        _loop_2(declaration);
    }
    return results;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getHover(info) {
    var result = locateSymbol(info);
    if (result) {
        return { text: hoverTextOf(result.symbol), span: result.span };
    }
}
function hoverTextOf(symbol) {
    var result = [{ text: symbol.kind }, { text: ' ' }, { text: symbol.name, language: symbol.language }];
    var container = symbol.container;
    if (container) {
        result.push({ text: ' of ' }, { text: container.name, language: container.language });
    }
    return result;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Create an instance of an Angular `LanguageService`.
 *
 * @experimental
 */
function createLanguageService(host) {
    return new LanguageServiceImpl(host);
}
var LanguageServiceImpl = /** @class */ (function () {
    function LanguageServiceImpl(host) {
        this.host = host;
    }
    Object.defineProperty(LanguageServiceImpl.prototype, "metadataResolver", {
        get: function () { return this.host.resolver; },
        enumerable: true,
        configurable: true
    });
    LanguageServiceImpl.prototype.getTemplateReferences = function () { return this.host.getTemplateReferences(); };
    LanguageServiceImpl.prototype.getDiagnostics = function (fileName) {
        var results = [];
        var templates = this.host.getTemplates(fileName);
        if (templates && templates.length) {
            results.push.apply(results, getTemplateDiagnostics(fileName, this, templates));
        }
        var declarations = this.host.getDeclarations(fileName);
        if (declarations && declarations.length) {
            var summary = this.host.getAnalyzedModules();
            results.push.apply(results, getDeclarationDiagnostics(declarations, summary));
        }
        return uniqueBySpan(results);
    };
    LanguageServiceImpl.prototype.getPipesAt = function (fileName, position) {
        var templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return templateInfo.pipes;
        }
        return [];
    };
    LanguageServiceImpl.prototype.getCompletionsAt = function (fileName, position) {
        var templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return getTemplateCompletions(templateInfo);
        }
    };
    LanguageServiceImpl.prototype.getDefinitionAt = function (fileName, position) {
        var templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return getDefinition(templateInfo);
        }
    };
    LanguageServiceImpl.prototype.getHoverAt = function (fileName, position) {
        var templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return getHover(templateInfo);
        }
    };
    LanguageServiceImpl.prototype.getTemplateAstAtPosition = function (fileName, position) {
        var template = this.host.getTemplateAt(fileName, position);
        if (template) {
            var astResult = this.getTemplateAst(template, fileName);
            if (astResult && astResult.htmlAst && astResult.templateAst && astResult.directive &&
                astResult.directives && astResult.pipes && astResult.expressionParser)
                return {
                    position: position,
                    fileName: fileName,
                    template: template,
                    htmlAst: astResult.htmlAst,
                    directive: astResult.directive,
                    directives: astResult.directives,
                    pipes: astResult.pipes,
                    templateAst: astResult.templateAst,
                    expressionParser: astResult.expressionParser
                };
        }
        return undefined;
    };
    LanguageServiceImpl.prototype.getTemplateAst = function (template, contextFile) {
        var _this = this;
        var result = undefined;
        try {
            var resolvedMetadata = this.metadataResolver.getNonNormalizedDirectiveMetadata(template.type);
            var metadata = resolvedMetadata && resolvedMetadata.metadata;
            if (metadata) {
                var rawHtmlParser = new HtmlParser();
                var htmlParser = new I18NHtmlParser(rawHtmlParser);
                var expressionParser = new Parser(new Lexer());
                var config = new CompilerConfig();
                var parser = new TemplateParser(config, this.host.resolver.getReflector(), expressionParser, new DomElementSchemaRegistry(), htmlParser, null, []);
                var htmlResult = htmlParser.parse(template.source, '', true);
                var analyzedModules = this.host.getAnalyzedModules();
                var errors = undefined;
                var ngModule = analyzedModules.ngModuleByPipeOrDirective.get(template.type);
                if (!ngModule) {
                    // Reported by the the declaration diagnostics.
                    ngModule = findSuitableDefaultModule(analyzedModules);
                }
                if (ngModule) {
                    var resolvedDirectives = ngModule.transitiveModule.directives.map(function (d) { return _this.host.resolver.getNonNormalizedDirectiveMetadata(d.reference); });
                    var directives = removeMissing(resolvedDirectives).map(function (d) { return d.metadata.toSummary(); });
                    var pipes = ngModule.transitiveModule.pipes.map(function (p) { return _this.host.resolver.getOrLoadPipeMetadata(p.reference).toSummary(); });
                    var schemas = ngModule.schemas;
                    var parseResult = parser.tryParseHtml(htmlResult, metadata, directives, pipes, schemas);
                    result = {
                        htmlAst: htmlResult.rootNodes,
                        templateAst: parseResult.templateAst,
                        directive: metadata, directives: directives, pipes: pipes,
                        parseErrors: parseResult.errors, expressionParser: expressionParser, errors: errors
                    };
                }
            }
        }
        catch (e) {
            var span = template.span;
            if (e.fileName == contextFile) {
                span = template.query.getSpanAt(e.line, e.column) || span;
            }
            result = { errors: [{ kind: DiagnosticKind.Error, message: e.message, span: span }] };
        }
        return result || {};
    };
    return LanguageServiceImpl;
}());
function removeMissing(values) {
    return values.filter(function (e) { return !!e; });
}
function uniqueBySpan(elements) {
    if (elements) {
        var result = [];
        var map = new Map();
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            var span = element.span;
            var set = map.get(span.start);
            if (!set) {
                set = new Set();
                map.set(span.start, set);
            }
            if (!set.has(span.end)) {
                set.add(span.end);
                result.push(element);
            }
        }
        return result;
    }
}
function findSuitableDefaultModule(modules) {
    var result = undefined;
    var resultSize = 0;
    for (var _i = 0, _a = modules.ngModules; _i < _a.length; _i++) {
        var module_1 = _a[_i];
        var moduleSize = module_1.transitiveModule.directives.length;
        if (moduleSize > resultSize) {
            result = module_1;
            resultSize = moduleSize;
        }
    }
    return result;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var ReflectorModuleModuleResolutionHost = /** @class */ (function () {
    function ReflectorModuleModuleResolutionHost(host, getProgram) {
        var _this = this;
        this.host = host;
        this.getProgram = getProgram;
        // Note: verboseInvalidExpressions is important so that
        // the collector will collect errors instead of throwing
        this.metadataCollector = new MetadataCollector({ verboseInvalidExpression: true });
        if (host.directoryExists)
            this.directoryExists = function (directoryName) { return _this.host.directoryExists(directoryName); };
    }
    ReflectorModuleModuleResolutionHost.prototype.fileExists = function (fileName) { return !!this.host.getScriptSnapshot(fileName); };
    ReflectorModuleModuleResolutionHost.prototype.readFile = function (fileName) {
        var snapshot = this.host.getScriptSnapshot(fileName);
        if (snapshot) {
            return snapshot.getText(0, snapshot.getLength());
        }
        // Typescript readFile() declaration should be `readFile(fileName: string): string | undefined
        return undefined;
    };
    ReflectorModuleModuleResolutionHost.prototype.getSourceFileMetadata = function (fileName) {
        var sf = this.getProgram().getSourceFile(fileName);
        return sf ? this.metadataCollector.getMetadata(sf) : undefined;
    };
    ReflectorModuleModuleResolutionHost.prototype.cacheMetadata = function (fileName) {
        // Don't cache the metadata for .ts files as they might change in the editor!
        return fileName.endsWith('.d.ts');
    };
    return ReflectorModuleModuleResolutionHost;
}());
var ReflectorHost = /** @class */ (function () {
    function ReflectorHost(getProgram, serviceHost, options) {
        this.options = options;
        this.metadataReaderCache = createMetadataReaderCache();
        this.hostAdapter = new ReflectorModuleModuleResolutionHost(serviceHost, getProgram);
        this.moduleResolutionCache =
            createModuleResolutionCache(serviceHost.getCurrentDirectory(), function (s) { return s; });
    }
    ReflectorHost.prototype.getMetadataFor = function (modulePath) {
        return readMetadata(modulePath, this.hostAdapter, this.metadataReaderCache);
    };
    ReflectorHost.prototype.moduleNameToFileName = function (moduleName, containingFile) {
        if (!containingFile) {
            if (moduleName.indexOf('.') === 0) {
                throw new Error('Resolution of relative paths requires a containing file.');
            }
            // Any containing file gives the same result for absolute imports
            containingFile = join(this.options.basePath, 'index.ts').replace(/\\/g, '/');
        }
        var resolved = resolveModuleName(moduleName, containingFile, this.options, this.hostAdapter)
            .resolvedModule;
        return resolved ? resolved.resolvedFileName : null;
    };
    ReflectorHost.prototype.getOutputName = function (filePath) { return filePath; };
    return ReflectorHost;
}());

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Create a `LanguageServiceHost`
 */
function createLanguageServiceFromTypescript(host, service) {
    var ngHost = new TypeScriptServiceHost(host, service);
    var ngServer = createLanguageService(ngHost);
    ngHost.setSite(ngServer);
    return ngServer;
}
/**
 * The language service never needs the normalized versions of the metadata. To avoid parsing
 * the content and resolving references, return an empty file. This also allows normalizing
 * template that are syntatically incorrect which is required to provide completions in
 * syntactically incorrect templates.
 */
var DummyHtmlParser = /** @class */ (function (_super) {
    __extends(DummyHtmlParser, _super);
    function DummyHtmlParser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DummyHtmlParser.prototype.parse = function (source, url, parseExpansionForms, interpolationConfig) {
        if (parseExpansionForms === void 0) { parseExpansionForms = false; }
        if (interpolationConfig === void 0) { interpolationConfig = DEFAULT_INTERPOLATION_CONFIG; }
        return new ParseTreeResult([], []);
    };
    return DummyHtmlParser;
}(HtmlParser));
/**
 * Avoid loading resources in the language servcie by using a dummy loader.
 */
var DummyResourceLoader = /** @class */ (function (_super) {
    __extends(DummyResourceLoader, _super);
    function DummyResourceLoader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DummyResourceLoader.prototype.get = function (url) { return Promise.resolve(''); };
    return DummyResourceLoader;
}(ResourceLoader));
/**
 * An implemntation of a `LanguageServiceHost` for a TypeScript project.
 *
 * The `TypeScriptServiceHost` implements the Angular `LanguageServiceHost` using
 * the TypeScript language services.
 *
 * @experimental
 */
var TypeScriptServiceHost = /** @class */ (function () {
    function TypeScriptServiceHost(host, tsService) {
        this.host = host;
        this.tsService = tsService;
        this._staticSymbolCache = new StaticSymbolCache();
        this._typeCache = [];
        this.modulesOutOfDate = true;
        this.fileVersions = new Map();
    }
    TypeScriptServiceHost.prototype.setSite = function (service) { this.service = service; };
    Object.defineProperty(TypeScriptServiceHost.prototype, "resolver", {
        /**
         * Angular LanguageServiceHost implementation
         */
        get: function () {
            var _this = this;
            this.validate();
            var result = this._resolver;
            if (!result) {
                var moduleResolver = new NgModuleResolver(this.reflector);
                var directiveResolver = new DirectiveResolver(this.reflector);
                var pipeResolver = new PipeResolver(this.reflector);
                var elementSchemaRegistry = new DomElementSchemaRegistry();
                var resourceLoader = new DummyResourceLoader();
                var urlResolver = createOfflineCompileUrlResolver();
                var htmlParser = new DummyHtmlParser();
                // This tracks the CompileConfig in codegen.ts. Currently these options
                // are hard-coded.
                var config = new CompilerConfig({ defaultEncapsulation: ViewEncapsulation.Emulated, useJit: false });
                var directiveNormalizer = new DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
                result = this._resolver = new CompileMetadataResolver(config, htmlParser, moduleResolver, directiveResolver, pipeResolver, new JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new ɵConsole(), this._staticSymbolCache, this.reflector, function (error, type) { return _this.collectError(error, type && type.filePath); });
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptServiceHost.prototype.getTemplateReferences = function () {
        this.ensureTemplateMap();
        return this.templateReferences || [];
    };
    TypeScriptServiceHost.prototype.getTemplateAt = function (fileName, position) {
        var sourceFile = this.getSourceFile(fileName);
        if (sourceFile) {
            this.context = sourceFile.fileName;
            var node = this.findNode(sourceFile, position);
            if (node) {
                return this.getSourceFromNode(fileName, this.host.getScriptVersion(sourceFile.fileName), node);
            }
        }
        else {
            this.ensureTemplateMap();
            // TODO: Cannocalize the file?
            var componentType = this.fileToComponent.get(fileName);
            if (componentType) {
                return this.getSourceFromType(fileName, this.host.getScriptVersion(fileName), componentType);
            }
        }
        return undefined;
    };
    TypeScriptServiceHost.prototype.getAnalyzedModules = function () {
        this.updateAnalyzedModules();
        return this.ensureAnalyzedModules();
    };
    TypeScriptServiceHost.prototype.ensureAnalyzedModules = function () {
        var analyzedModules = this.analyzedModules;
        if (!analyzedModules) {
            if (this.host.getScriptFileNames().length === 0) {
                analyzedModules = {
                    files: [],
                    ngModuleByPipeOrDirective: new Map(),
                    ngModules: [],
                };
            }
            else {
                var analyzeHost = { isSourceFile: function (filePath) { return true; } };
                var programFiles = this.program.getSourceFiles().map(function (sf) { return sf.fileName; });
                analyzedModules =
                    analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
            }
            this.analyzedModules = analyzedModules;
        }
        return analyzedModules;
    };
    TypeScriptServiceHost.prototype.getTemplates = function (fileName) {
        var _this = this;
        this.ensureTemplateMap();
        var componentType = this.fileToComponent.get(fileName);
        if (componentType) {
            var templateSource = this.getTemplateAt(fileName, 0);
            if (templateSource) {
                return [templateSource];
            }
        }
        else {
            var version_1 = this.host.getScriptVersion(fileName);
            var result_1 = [];
            // Find each template string in the file
            var visit_1 = function (child) {
                var templateSource = _this.getSourceFromNode(fileName, version_1, child);
                if (templateSource) {
                    result_1.push(templateSource);
                }
                else {
                    forEachChild(child, visit_1);
                }
            };
            var sourceFile = this.getSourceFile(fileName);
            if (sourceFile) {
                this.context = sourceFile.path || sourceFile.fileName;
                forEachChild(sourceFile, visit_1);
            }
            return result_1.length ? result_1 : undefined;
        }
    };
    TypeScriptServiceHost.prototype.getDeclarations = function (fileName) {
        var _this = this;
        var result = [];
        var sourceFile = this.getSourceFile(fileName);
        if (sourceFile) {
            var visit_2 = function (child) {
                var declaration = _this.getDeclarationFromNode(sourceFile, child);
                if (declaration) {
                    result.push(declaration);
                }
                else {
                    forEachChild(child, visit_2);
                }
            };
            forEachChild(sourceFile, visit_2);
        }
        return result;
    };
    TypeScriptServiceHost.prototype.getSourceFile = function (fileName) {
        return this.tsService.getProgram().getSourceFile(fileName);
    };
    TypeScriptServiceHost.prototype.updateAnalyzedModules = function () {
        this.validate();
        if (this.modulesOutOfDate) {
            this.analyzedModules = null;
            this._reflector = null;
            this.templateReferences = null;
            this.fileToComponent = null;
            this.ensureAnalyzedModules();
            this.modulesOutOfDate = false;
        }
    };
    Object.defineProperty(TypeScriptServiceHost.prototype, "program", {
        get: function () { return this.tsService.getProgram(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeScriptServiceHost.prototype, "checker", {
        get: function () {
            var checker = this._checker;
            if (!checker) {
                checker = this._checker = this.program.getTypeChecker();
            }
            return checker;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptServiceHost.prototype.validate = function () {
        var _this = this;
        var program = this.program;
        if (this.lastProgram !== program) {
            // Invalidate file that have changed in the static symbol resolver
            var invalidateFile = function (fileName) {
                return _this._staticSymbolResolver.invalidateFile(fileName);
            };
            this.clearCaches();
            var seen_1 = new Set();
            for (var _i = 0, _a = this.program.getSourceFiles(); _i < _a.length; _i++) {
                var sourceFile = _a[_i];
                var fileName = sourceFile.fileName;
                seen_1.add(fileName);
                var version$$1 = this.host.getScriptVersion(fileName);
                var lastVersion = this.fileVersions.get(fileName);
                if (version$$1 != lastVersion) {
                    this.fileVersions.set(fileName, version$$1);
                    if (this._staticSymbolResolver) {
                        invalidateFile(fileName);
                    }
                }
            }
            // Remove file versions that are no longer in the file and invalidate them.
            var missing = Array.from(this.fileVersions.keys()).filter(function (f) { return !seen_1.has(f); });
            missing.forEach(function (f) { return _this.fileVersions.delete(f); });
            if (this._staticSymbolResolver) {
                missing.forEach(invalidateFile);
            }
            this.lastProgram = program;
        }
    };
    TypeScriptServiceHost.prototype.clearCaches = function () {
        this._checker = null;
        this._typeCache = [];
        this._resolver = null;
        this.collectedErrors = null;
        this.modulesOutOfDate = true;
    };
    TypeScriptServiceHost.prototype.ensureTemplateMap = function () {
        if (!this.fileToComponent || !this.templateReferences) {
            var fileToComponent = new Map();
            var templateReference = [];
            var ngModuleSummary = this.getAnalyzedModules();
            var urlResolver = createOfflineCompileUrlResolver();
            for (var _i = 0, _a = ngModuleSummary.ngModules; _i < _a.length; _i++) {
                var module_1 = _a[_i];
                for (var _b = 0, _c = module_1.declaredDirectives; _b < _c.length; _b++) {
                    var directive = _c[_b];
                    var metadata = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference).metadata;
                    if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
                        var templateName = urlResolver.resolve(this.reflector.componentModuleUrl(directive.reference), metadata.template.templateUrl);
                        fileToComponent.set(templateName, directive.reference);
                        templateReference.push(templateName);
                    }
                }
            }
            this.fileToComponent = fileToComponent;
            this.templateReferences = templateReference;
        }
    };
    TypeScriptServiceHost.prototype.getSourceFromDeclaration = function (fileName, version$$1, source, span, type, declaration, node, sourceFile) {
        var queryCache = undefined;
        var t = this;
        if (declaration) {
            return {
                version: version$$1,
                source: source,
                span: span,
                type: type,
                get members() {
                    return getClassMembersFromDeclaration(t.program, t.checker, sourceFile, declaration);
                },
                get query() {
                    if (!queryCache) {
                        var pipes_1 = t.service.getPipesAt(fileName, node.getStart());
                        queryCache = getSymbolQuery(t.program, t.checker, sourceFile, function () { return getPipesTable(sourceFile, t.program, t.checker, pipes_1); });
                    }
                    return queryCache;
                }
            };
        }
    };
    TypeScriptServiceHost.prototype.getSourceFromNode = function (fileName, version$$1, node) {
        var result = undefined;
        var t = this;
        switch (node.kind) {
            case SyntaxKind.NoSubstitutionTemplateLiteral:
            case SyntaxKind.StringLiteral:
                var _a = this.getTemplateClassDeclFromNode(node), declaration = _a[0], decorator = _a[1];
                if (declaration && declaration.name) {
                    var sourceFile = this.getSourceFile(fileName);
                    return this.getSourceFromDeclaration(fileName, version$$1, this.stringOf(node) || '', shrink(spanOf$1(node)), this.reflector.getStaticSymbol(sourceFile.fileName, declaration.name.text), declaration, node, sourceFile);
                }
                break;
        }
        return result;
    };
    TypeScriptServiceHost.prototype.getSourceFromType = function (fileName, version$$1, type) {
        var result = undefined;
        var declaration = this.getTemplateClassFromStaticSymbol(type);
        if (declaration) {
            var snapshot = this.host.getScriptSnapshot(fileName);
            if (snapshot) {
                var source = snapshot.getText(0, snapshot.getLength());
                result = this.getSourceFromDeclaration(fileName, version$$1, source, { start: 0, end: source.length }, type, declaration, declaration, declaration.getSourceFile());
            }
        }
        return result;
    };
    Object.defineProperty(TypeScriptServiceHost.prototype, "reflectorHost", {
        get: function () {
            var _this = this;
            var result = this._reflectorHost;
            if (!result) {
                if (!this.context) {
                    // Make up a context by finding the first script and using that as the base dir.
                    var scriptFileNames = this.host.getScriptFileNames();
                    if (0 === scriptFileNames.length) {
                        throw new Error('Internal error: no script file names found');
                    }
                    this.context = scriptFileNames[0];
                }
                // Use the file context's directory as the base directory.
                // The host's getCurrentDirectory() is not reliable as it is always "" in
                // tsserver. We don't need the exact base directory, just one that contains
                // a source file.
                var source = this.tsService.getProgram().getSourceFile(this.context);
                if (!source) {
                    throw new Error('Internal error: no context could be determined');
                }
                var tsConfigPath = findTsConfig(source.fileName);
                var basePath = dirname(tsConfigPath || this.context);
                var options = { basePath: basePath, genDir: basePath };
                var compilerOptions = this.host.getCompilationSettings();
                if (compilerOptions && compilerOptions.baseUrl) {
                    options.baseUrl = compilerOptions.baseUrl;
                }
                if (compilerOptions && compilerOptions.paths) {
                    options.paths = compilerOptions.paths;
                }
                result = this._reflectorHost =
                    new ReflectorHost(function () { return _this.tsService.getProgram(); }, this.host, options);
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptServiceHost.prototype.collectError = function (error, filePath) {
        if (filePath) {
            var errorMap = this.collectedErrors;
            if (!errorMap || !this.collectedErrors) {
                errorMap = this.collectedErrors = new Map();
            }
            var errors = errorMap.get(filePath);
            if (!errors) {
                errors = [];
                this.collectedErrors.set(filePath, errors);
            }
            errors.push(error);
        }
    };
    Object.defineProperty(TypeScriptServiceHost.prototype, "staticSymbolResolver", {
        get: function () {
            var _this = this;
            var result = this._staticSymbolResolver;
            if (!result) {
                this._summaryResolver = new AotSummaryResolver({
                    loadSummary: function (filePath) { return null; },
                    isSourceFile: function (sourceFilePath) { return true; },
                    toSummaryFileName: function (sourceFilePath) { return sourceFilePath; },
                    fromSummaryFileName: function (filePath) { return filePath; },
                }, this._staticSymbolCache);
                result = this._staticSymbolResolver = new StaticSymbolResolver(this.reflectorHost, this._staticSymbolCache, this._summaryResolver, function (e, filePath) { return _this.collectError(e, filePath); });
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TypeScriptServiceHost.prototype, "reflector", {
        get: function () {
            var _this = this;
            var result = this._reflector;
            if (!result) {
                var ssr = this.staticSymbolResolver;
                result = this._reflector = new StaticReflector(this._summaryResolver, ssr, [], [], function (e, filePath) { return _this.collectError(e, filePath); });
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    TypeScriptServiceHost.prototype.getTemplateClassFromStaticSymbol = function (type) {
        var source = this.getSourceFile(type.filePath);
        if (source) {
            var declarationNode = forEachChild(source, function (child) {
                if (child.kind === SyntaxKind.ClassDeclaration) {
                    var classDeclaration = child;
                    if (classDeclaration.name != null && classDeclaration.name.text === type.name) {
                        return classDeclaration;
                    }
                }
            });
            return declarationNode;
        }
        return undefined;
    };
    /**
     * Given a template string node, see if it is an Angular template string, and if so return the
     * containing class.
     */
    TypeScriptServiceHost.prototype.getTemplateClassDeclFromNode = function (currentToken) {
        // Verify we are in a 'template' property assignment, in an object literal, which is an call
        // arg, in a decorator
        var parentNode = currentToken.parent; // PropertyAssignment
        if (!parentNode) {
            return TypeScriptServiceHost.missingTemplate;
        }
        if (parentNode.kind !== SyntaxKind.PropertyAssignment) {
            return TypeScriptServiceHost.missingTemplate;
        }
        else {
            // TODO: Is this different for a literal, i.e. a quoted property name like "template"?
            if (parentNode.name.text !== 'template') {
                return TypeScriptServiceHost.missingTemplate;
            }
        }
        parentNode = parentNode.parent; // ObjectLiteralExpression
        if (!parentNode || parentNode.kind !== SyntaxKind.ObjectLiteralExpression) {
            return TypeScriptServiceHost.missingTemplate;
        }
        parentNode = parentNode.parent; // CallExpression
        if (!parentNode || parentNode.kind !== SyntaxKind.CallExpression) {
            return TypeScriptServiceHost.missingTemplate;
        }
        var callTarget = parentNode.expression;
        var decorator = parentNode.parent; // Decorator
        if (!decorator || decorator.kind !== SyntaxKind.Decorator) {
            return TypeScriptServiceHost.missingTemplate;
        }
        var declaration = decorator.parent; // ClassDeclaration
        if (!declaration || declaration.kind !== SyntaxKind.ClassDeclaration) {
            return TypeScriptServiceHost.missingTemplate;
        }
        return [declaration, callTarget];
    };
    TypeScriptServiceHost.prototype.getCollectedErrors = function (defaultSpan, sourceFile) {
        var errors = (this.collectedErrors && this.collectedErrors.get(sourceFile.fileName));
        return (errors && errors.map(function (e) {
            var line = e.line || (e.position && e.position.line);
            var column = e.column || (e.position && e.position.column);
            var span = spanAt(sourceFile, line, column) || defaultSpan;
            if (isFormattedError(e)) {
                return errorToDiagnosticWithChain(e, span);
            }
            return { message: e.message, span: span };
        })) ||
            [];
    };
    TypeScriptServiceHost.prototype.getDeclarationFromNode = function (sourceFile, node) {
        if (node.kind == SyntaxKind.ClassDeclaration && node.decorators &&
            node.name) {
            for (var _i = 0, _a = node.decorators; _i < _a.length; _i++) {
                var decorator = _a[_i];
                if (decorator.expression && decorator.expression.kind == SyntaxKind.CallExpression) {
                    var classDeclaration = node;
                    if (classDeclaration.name) {
                        var call = decorator.expression;
                        var target = call.expression;
                        var type = this.checker.getTypeAtLocation(target);
                        if (type) {
                            var staticSymbol = this.reflector.getStaticSymbol(sourceFile.fileName, classDeclaration.name.text);
                            try {
                                if (this.resolver.isDirective(staticSymbol)) {
                                    var metadata = this.resolver.getNonNormalizedDirectiveMetadata(staticSymbol).metadata;
                                    var declarationSpan = spanOf$1(target);
                                    return {
                                        type: staticSymbol,
                                        declarationSpan: declarationSpan,
                                        metadata: metadata,
                                        errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                    };
                                }
                            }
                            catch (e) {
                                if (e.message) {
                                    this.collectError(e, sourceFile.fileName);
                                    var declarationSpan = spanOf$1(target);
                                    return {
                                        type: staticSymbol,
                                        declarationSpan: declarationSpan,
                                        errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    TypeScriptServiceHost.prototype.stringOf = function (node) {
        switch (node.kind) {
            case SyntaxKind.NoSubstitutionTemplateLiteral:
                return node.text;
            case SyntaxKind.StringLiteral:
                return node.text;
        }
    };
    TypeScriptServiceHost.prototype.findNode = function (sourceFile, position) {
        function find(node) {
            if (position >= node.getStart() && position < node.getEnd()) {
                return forEachChild(node, find) || node;
            }
        }
        return find(sourceFile);
    };
    TypeScriptServiceHost.missingTemplate = [undefined, undefined];
    return TypeScriptServiceHost;
}());
function findTsConfig(fileName) {
    var dir = dirname(fileName);
    while (existsSync(dir)) {
        var candidate = join(dir, 'tsconfig.json');
        if (existsSync(candidate))
            return candidate;
        var parentDir = dirname(dir);
        if (parentDir === dir)
            break;
        dir = parentDir;
    }
}
function spanOf$1(node) {
    return { start: node.getStart(), end: node.getEnd() };
}
function shrink(span, offset) {
    if (offset == null)
        offset = 1;
    return { start: span.start + offset, end: span.end - offset };
}
function spanAt(sourceFile, line, column) {
    if (line != null && column != null) {
        var position_1 = getPositionOfLineAndCharacter(sourceFile, line, column);
        var findChild = function findChild(node) {
            if (node.kind > SyntaxKind.LastToken && node.pos <= position_1 && node.end > position_1) {
                var betterNode = forEachChild(node, findChild);
                return betterNode || node;
            }
        };
        var node = forEachChild(sourceFile, findChild);
        if (node) {
            return { start: node.getStart(), end: node.getEnd() };
        }
    }
}
function convertChain(chain) {
    return { message: chain.message, next: chain.next ? convertChain(chain.next) : undefined };
}
function errorToDiagnosticWithChain(error, span) {
    return { message: error.chain ? convertChain(error.chain) : error.message, span: span };
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var projectHostMap = new WeakMap();
function getExternalFiles(project) {
    var host = projectHostMap.get(project);
    if (host) {
        return host.getTemplateReferences();
    }
}
var angularOnlyResults = process.argv.indexOf('--angularOnlyResults') >= 0;
function angularOnlyFilter(ls) {
    return {
        cleanupSemanticCache: function () { return ls.cleanupSemanticCache(); },
        getSyntacticDiagnostics: function (fileName) { return []; },
        getSemanticDiagnostics: function (fileName) { return []; },
        getCompilerOptionsDiagnostics: function () { return []; },
        getSyntacticClassifications: function (fileName, span) { return []; },
        getSemanticClassifications: function (fileName, span) { return []; },
        getEncodedSyntacticClassifications: function (fileName, span) { return ({ undefined: undefined }); },
        getEncodedSemanticClassifications: function (fileName, span) { return undefined; },
        getCompletionsAtPosition: function (fileName, position) { return undefined; },
        getCompletionEntryDetails: function (fileName, position, entryName) {
            return undefined;
        },
        getCompletionEntrySymbol: function (fileName, position, entryName) { return undefined; },
        getQuickInfoAtPosition: function (fileName, position) { return undefined; },
        getNameOrDottedNameSpan: function (fileName, startPos, endPos) { return undefined; },
        getBreakpointStatementAtPosition: function (fileName, position) { return undefined; },
        getSignatureHelpItems: function (fileName, position) { return undefined; },
        getRenameInfo: function (fileName, position) { return undefined; },
        findRenameLocations: function (fileName, position, findInStrings, findInComments) {
            return [];
        },
        getDefinitionAtPosition: function (fileName, position) { return []; },
        getTypeDefinitionAtPosition: function (fileName, position) { return []; },
        getImplementationAtPosition: function (fileName, position) { return []; },
        getReferencesAtPosition: function (fileName, position) { return []; },
        findReferences: function (fileName, position) { return []; },
        getDocumentHighlights: function (fileName, position, filesToSearch) { return []; },
        /** @deprecated */
        getOccurrencesAtPosition: function (fileName, position) { return []; },
        getNavigateToItems: function (searchValue) { return []; },
        getNavigationBarItems: function (fileName) { return []; },
        getNavigationTree: function (fileName) { return undefined; },
        getOutliningSpans: function (fileName) { return []; },
        getTodoComments: function (fileName, descriptors) { return []; },
        getBraceMatchingAtPosition: function (fileName, position) { return []; },
        getIndentationAtPosition: function (fileName, position, options) { return undefined; },
        getFormattingEditsForRange: function (fileName, start, end, options) { return []; },
        getFormattingEditsForDocument: function (fileName, options) { return []; },
        getFormattingEditsAfterKeystroke: function (fileName, position, key, options) { return []; },
        getDocCommentTemplateAtPosition: function (fileName, position) { return undefined; },
        isValidBraceCompletionAtPosition: function (fileName, position, openingBrace) { return undefined; },
        getSpanOfEnclosingComment: function (fileName, position, onlyMultiLine) { return undefined; },
        getCodeFixesAtPosition: function (fileName, start, end, errorCodes) { return []; },
        applyCodeActionCommand: function (action) { return Promise.resolve(undefined); },
        getEmitOutput: function (fileName) { return undefined; },
        getProgram: function () { return ls.getProgram(); },
        dispose: function () { return ls.dispose(); },
        getApplicableRefactors: function (fileName, positionOrRaneg) { return []; },
        getEditsForRefactor: function (fileName, formatOptions, positionOrRange, refactorName, actionName) {
            return undefined;
        }
    };
}
function create(info /* ts.server.PluginCreateInfo */) {
    // Create the proxy
    var proxy = Object.create(null);
    var oldLS = info.languageService;
    if (angularOnlyResults) {
        oldLS = angularOnlyFilter(oldLS);
    }
    function tryCall(fileName, callback) {
        if (fileName && !oldLS.getProgram().getSourceFile(fileName)) {
            return undefined;
        }
        try {
            return callback();
        }
        catch (e) {
            return undefined;
        }
    }
    function tryFilenameCall(m) {
        return function (fileName) { return tryCall(fileName, function () { return (m.call(ls, fileName)); }); };
    }
    function tryFilenameOneCall(m) {
        return function (fileName, p) { return tryCall(fileName, function () { return (m.call(ls, fileName, p)); }); };
    }
    function tryFilenameTwoCall(m) {
        return function (fileName, p1, p2) { return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2)); }); };
    }
    function tryFilenameThreeCall(m) {
        return function (fileName, p1, p2, p3) { return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2, p3)); }); };
    }
    function tryFilenameFourCall(m) {
        return function (fileName, p1, p2, p3, p4) {
            return tryCall(fileName, function () { return (m.call(ls, fileName, p1, p2, p3, p4)); });
        };
    }
    function typescriptOnly(ls) {
        return {
            cleanupSemanticCache: function () { return ls.cleanupSemanticCache(); },
            getSyntacticDiagnostics: tryFilenameCall(ls.getSyntacticDiagnostics),
            getSemanticDiagnostics: tryFilenameCall(ls.getSemanticDiagnostics),
            getCompilerOptionsDiagnostics: function () { return ls.getCompilerOptionsDiagnostics(); },
            getSyntacticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
            getSemanticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
            getEncodedSyntacticClassifications: tryFilenameOneCall(ls.getEncodedSyntacticClassifications),
            getEncodedSemanticClassifications: tryFilenameOneCall(ls.getEncodedSemanticClassifications),
            getCompletionsAtPosition: tryFilenameTwoCall(ls.getCompletionsAtPosition),
            getCompletionEntryDetails: tryFilenameFourCall(ls.getCompletionEntryDetails),
            getCompletionEntrySymbol: tryFilenameThreeCall(ls.getCompletionEntrySymbol),
            getQuickInfoAtPosition: tryFilenameOneCall(ls.getQuickInfoAtPosition),
            getNameOrDottedNameSpan: tryFilenameTwoCall(ls.getNameOrDottedNameSpan),
            getBreakpointStatementAtPosition: tryFilenameOneCall(ls.getBreakpointStatementAtPosition),
            getSignatureHelpItems: tryFilenameOneCall(ls.getSignatureHelpItems),
            getRenameInfo: tryFilenameOneCall(ls.getRenameInfo),
            findRenameLocations: tryFilenameThreeCall(ls.findRenameLocations),
            getDefinitionAtPosition: tryFilenameOneCall(ls.getDefinitionAtPosition),
            getTypeDefinitionAtPosition: tryFilenameOneCall(ls.getTypeDefinitionAtPosition),
            getImplementationAtPosition: tryFilenameOneCall(ls.getImplementationAtPosition),
            getReferencesAtPosition: tryFilenameOneCall(ls.getReferencesAtPosition),
            findReferences: tryFilenameOneCall(ls.findReferences),
            getDocumentHighlights: tryFilenameTwoCall(ls.getDocumentHighlights),
            /** @deprecated */
            getOccurrencesAtPosition: tryFilenameOneCall(ls.getOccurrencesAtPosition),
            getNavigateToItems: function (searchValue, maxResultCount, fileName, excludeDtsFiles) { return tryCall(fileName, function () { return ls.getNavigateToItems(searchValue, maxResultCount, fileName, excludeDtsFiles); }); },
            getNavigationBarItems: tryFilenameCall(ls.getNavigationBarItems),
            getNavigationTree: tryFilenameCall(ls.getNavigationTree),
            getOutliningSpans: tryFilenameCall(ls.getOutliningSpans),
            getTodoComments: tryFilenameOneCall(ls.getTodoComments),
            getBraceMatchingAtPosition: tryFilenameOneCall(ls.getBraceMatchingAtPosition),
            getIndentationAtPosition: tryFilenameTwoCall(ls.getIndentationAtPosition),
            getFormattingEditsForRange: tryFilenameThreeCall(ls.getFormattingEditsForRange),
            getFormattingEditsForDocument: tryFilenameOneCall(ls.getFormattingEditsForDocument),
            getFormattingEditsAfterKeystroke: tryFilenameThreeCall(ls.getFormattingEditsAfterKeystroke),
            getDocCommentTemplateAtPosition: tryFilenameOneCall(ls.getDocCommentTemplateAtPosition),
            isValidBraceCompletionAtPosition: tryFilenameTwoCall(ls.isValidBraceCompletionAtPosition),
            getSpanOfEnclosingComment: tryFilenameTwoCall(ls.getSpanOfEnclosingComment),
            getCodeFixesAtPosition: tryFilenameFourCall(ls.getCodeFixesAtPosition),
            applyCodeActionCommand: (function (action) { return tryCall(undefined, function () { return ls.applyCodeActionCommand(action); }); }),
            getEmitOutput: tryFilenameCall(ls.getEmitOutput),
            getProgram: function () { return ls.getProgram(); },
            dispose: function () { return ls.dispose(); },
            getApplicableRefactors: tryFilenameOneCall(ls.getApplicableRefactors),
            getEditsForRefactor: tryFilenameFourCall(ls.getEditsForRefactor)
        };
    }
    oldLS = typescriptOnly(oldLS);
    var _loop_1 = function (k) {
        proxy[k] = function () { return oldLS[k].apply(oldLS, arguments); };
    };
    for (var k in oldLS) {
        _loop_1(k);
    }
    function completionToEntry(c) {
        return {
            // TODO: remove any and fix type error.
            kind: c.kind,
            name: c.name,
            sortText: c.sort,
            kindModifiers: ''
        };
    }
    function diagnosticChainToDiagnosticChain(chain) {
        return {
            messageText: chain.message,
            category: DiagnosticCategory.Error,
            code: 0,
            next: chain.next ? diagnosticChainToDiagnosticChain(chain.next) : undefined
        };
    }
    function diagnosticMessageToDiagnosticMessageText(message) {
        if (typeof message === 'string') {
            return message;
        }
        return diagnosticChainToDiagnosticChain(message);
    }
    function diagnosticToDiagnostic(d, file) {
        var result = {
            file: file,
            start: d.span.start,
            length: d.span.end - d.span.start,
            messageText: diagnosticMessageToDiagnosticMessageText(d.message),
            category: DiagnosticCategory.Error,
            code: 0,
            source: 'ng'
        };
        return result;
    }
    function tryOperation(attempting, callback) {
        try {
            return callback();
        }
        catch (e) {
            info.project.projectService.logger.info("Failed to " + attempting + ": " + e.toString());
            info.project.projectService.logger.info("Stack trace: " + e.stack);
            return null;
        }
    }
    var serviceHost = new TypeScriptServiceHost(info.languageServiceHost, info.languageService);
    var ls = createLanguageService(serviceHost);
    serviceHost.setSite(ls);
    projectHostMap.set(info.project, serviceHost);
    proxy.getCompletionsAtPosition = function (fileName, position, options) {
        var base = oldLS.getCompletionsAtPosition(fileName, position, options) || {
            isGlobalCompletion: false,
            isMemberCompletion: false,
            isNewIdentifierLocation: false,
            entries: []
        };
        tryOperation('get completions', function () {
            var results = ls.getCompletionsAt(fileName, position);
            if (results && results.length) {
                if (base === undefined) {
                    base = {
                        isGlobalCompletion: false,
                        isMemberCompletion: false,
                        isNewIdentifierLocation: false,
                        entries: []
                    };
                }
                for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
                    var entry = results_1[_i];
                    base.entries.push(completionToEntry(entry));
                }
            }
        });
        return base;
    };
    proxy.getQuickInfoAtPosition = function (fileName, position) {
        var base = oldLS.getQuickInfoAtPosition(fileName, position);
        // TODO(vicb): the tags property has been removed in TS 2.2
        tryOperation('get quick info', function () {
            var ours = ls.getHoverAt(fileName, position);
            if (ours) {
                var displayParts = [];
                for (var _i = 0, _a = ours.text; _i < _a.length; _i++) {
                    var part = _a[_i];
                    displayParts.push({ kind: part.language || 'angular', text: part.text });
                }
                var tags = base && base.tags;
                base = {
                    displayParts: displayParts,
                    documentation: [],
                    kind: 'angular',
                    kindModifiers: 'what does this do?',
                    textSpan: { start: ours.span.start, length: ours.span.end - ours.span.start },
                };
                if (tags) {
                    base.tags = tags;
                }
            }
        });
        return base;
    };
    proxy.getSemanticDiagnostics = function (fileName) {
        var result = oldLS.getSemanticDiagnostics(fileName);
        var base = result || [];
        tryOperation('get diagnostics', function () {
            info.project.projectService.logger.info("Computing Angular semantic diagnostics...");
            var ours = ls.getDiagnostics(fileName);
            if (ours && ours.length) {
                var file_1 = oldLS.getProgram().getSourceFile(fileName);
                base.push.apply(base, ours.map(function (d) { return diagnosticToDiagnostic(d, file_1); }));
            }
        });
        return base;
    };
    proxy.getDefinitionAtPosition = function (fileName, position) {
        var base = oldLS.getDefinitionAtPosition(fileName, position);
        if (base && base.length) {
            return base;
        }
        return tryOperation('get definition', function () {
            var ours = ls.getDefinitionAt(fileName, position);
            if (ours && ours.length) {
                base = base || [];
                for (var _i = 0, ours_1 = ours; _i < ours_1.length; _i++) {
                    var loc = ours_1[_i];
                    base.push({
                        fileName: loc.fileName,
                        textSpan: { start: loc.span.start, length: loc.span.end - loc.span.start },
                        name: '',
                        // TODO: remove any and fix type error.
                        kind: 'definition',
                        containerName: loc.fileName,
                        containerKind: 'file',
                    });
                }
            }
            return base;
        }) || [];
    };
    return proxy;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */
/**
 * @stable
 */
var VERSION = new Version('5.2.5');

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the language service package.
 */

export { createLanguageService, TypeScriptServiceHost, createLanguageServiceFromTypescript, VERSION, getExternalFiles, create };
//# sourceMappingURL=language-service.js.map
