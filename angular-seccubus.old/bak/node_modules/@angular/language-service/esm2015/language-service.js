/**
 * @license Angular v5.2.5
 * (c) 2010-2018 Google, Inc. https://angular.io/
 * License: MIT
 */
import { ASTWithSource, AotSummaryResolver, AstPath, Attribute, CompileMetadataResolver, CompilerConfig, CssSelector, DEFAULT_INTERPOLATION_CONFIG, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, Element, ElementAst, HtmlParser, I18NHtmlParser, ImplicitReceiver, JitSummaryResolver, Lexer, NAMED_ENTITIES, NgModuleResolver, NullAstVisitor, NullTemplateVisitor, ParseSpan, ParseTreeResult, Parser, PipeResolver, PropertyRead, RecursiveTemplateAstVisitor, ResourceLoader, SelectorMatcher, StaticReflector, StaticSymbolCache, StaticSymbolResolver, TagContentType, TemplateParser, Text, analyzeNgModules, createOfflineCompileUrlResolver, findNode, getHtmlTagDefinition, identifierName, isFormattedError, splitNsName, templateVisitAll, tokenReference, visitAstChildren } from '@angular/compiler';
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
        for (let diDep of type.diDeps) {
            if (diDep.token && diDep.token.identifier &&
                identifierName(diDep.token.identifier) == 'TemplateRef')
                return true;
        }
    }
    return false;
}
function getSelectors(info) {
    const map = new Map();
    const selectors = flatten(info.directives.map(directive => {
        const selectors = CssSelector.parse(directive.selector);
        selectors.forEach(selector => map.set(selector, directive));
        return selectors;
    }));
    return { selectors, map };
}
function flatten(a) {
    return [].concat(...a);
}
function removeSuffix(value, suffix) {
    if (value.endsWith(suffix))
        return value.substring(0, value.length - suffix.length);
    return value;
}
function uniqueByName(elements) {
    if (elements) {
        const result = [];
        const set = new Set();
        for (const element of elements) {
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
function findTemplateAstAt(ast, position, allowWidening = false) {
    const path$$1 = [];
    const visitor = new class extends RecursiveTemplateAstVisitor {
        visit(ast, context) {
            let span = spanOf(ast);
            if (inSpan(position, span)) {
                const len = path$$1.length;
                if (!len || allowWidening || isNarrower(span, spanOf(path$$1[len - 1]))) {
                    path$$1.push(ast);
                }
            }
            else {
                // Returning a value here will result in the children being skipped.
                return true;
            }
        }
        visitEmbeddedTemplate(ast, context) {
            return this.visitChildren(context, visit => {
                // Ignore reference, variable and providers
                visit(ast.attrs);
                visit(ast.directives);
                visit(ast.children);
            });
        }
        visitElement(ast, context) {
            return this.visitChildren(context, visit => {
                // Ingnore providers
                visit(ast.attrs);
                visit(ast.inputs);
                visit(ast.outputs);
                visit(ast.references);
                visit(ast.directives);
                visit(ast.children);
            });
        }
        visitDirective(ast, context) {
            // Ignore the host properties of a directive
            const result = this.visitChildren(context, visit => { visit(ast.inputs); });
            // We never care about the diretive itself, just its inputs.
            if (path$$1[path$$1.length - 1] == ast) {
                path$$1.pop();
            }
            return result;
        }
    };
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
function findAstAt(ast, position, excludeEmpty = false) {
    const path$$1 = [];
    const visitor = new class extends NullAstVisitor {
        visit(ast) {
            if ((!excludeEmpty || ast.span.start < ast.span.end) && inSpan(position, ast.span)) {
                path$$1.push(ast);
                visitAstChildren(ast, this);
            }
        }
    };
    // We never care about the ASTWithSource node and its visit() method calls its ast's visit so
    // the visit() method above would never see it.
    if (ast instanceof ASTWithSource) {
        ast = ast.ast;
    }
    visitor.visit(ast);
    return new AstPath(path$$1, position);
}
function getExpressionCompletions(scope, ast, position, query) {
    const path$$1 = findAstAt(ast, position);
    if (path$$1.empty)
        return undefined;
    const tail = path$$1.tail;
    let result = scope;
    function getType(ast) { return new AstType(scope, query, {}).getType(ast); }
    // If the completion request is in a not in a pipe or property access then the global scope
    // (that is the scope of the implicit receiver) is the right scope as the user is typing the
    // beginning of an expression.
    tail.visit({
        visitBinary(ast) { },
        visitChain(ast) { },
        visitConditional(ast) { },
        visitFunctionCall(ast) { },
        visitImplicitReceiver(ast) { },
        visitInterpolation(ast) { result = undefined; },
        visitKeyedRead(ast) { },
        visitKeyedWrite(ast) { },
        visitLiteralArray(ast) { },
        visitLiteralMap(ast) { },
        visitLiteralPrimitive(ast) { },
        visitMethodCall(ast) { },
        visitPipe(ast) {
            if (position >= ast.exp.span.end &&
                (!ast.args || !ast.args.length || position < ast.args[0].span.start)) {
                // We are in a position a pipe name is expected.
                result = query.getPipes();
            }
        },
        visitPrefixNot(ast) { },
        visitNonNullAssert(ast) { },
        visitPropertyRead(ast) {
            const receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
        visitPropertyWrite(ast) {
            const receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
        visitQuote(ast) {
            // For a quote, return the members of any (if there are any).
            result = query.getBuiltinType(BuiltinType.Any).members();
        },
        visitSafeMethodCall(ast) {
            const receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
        visitSafePropertyRead(ast) {
            const receiverType = getType(ast.receiver);
            result = receiverType ? receiverType.members() : scope;
        },
    });
    return result && result.values();
}
function getExpressionSymbol(scope, ast, position, query) {
    const path$$1 = findAstAt(ast, position, /* excludeEmpty */ true);
    if (path$$1.empty)
        return undefined;
    const tail = path$$1.tail;
    function getType(ast) { return new AstType(scope, query, {}).getType(ast); }
    let symbol = undefined;
    let span = undefined;
    // If the completion request is in a not in a pipe or property access then the global scope
    // (that is the scope of the implicit receiver) is the right scope as the user is typing the
    // beginning of an expression.
    tail.visit({
        visitBinary(ast) { },
        visitChain(ast) { },
        visitConditional(ast) { },
        visitFunctionCall(ast) { },
        visitImplicitReceiver(ast) { },
        visitInterpolation(ast) { },
        visitKeyedRead(ast) { },
        visitKeyedWrite(ast) { },
        visitLiteralArray(ast) { },
        visitLiteralMap(ast) { },
        visitLiteralPrimitive(ast) { },
        visitMethodCall(ast) {
            const receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitPipe(ast) {
            if (position >= ast.exp.span.end &&
                (!ast.args || !ast.args.length || position < ast.args[0].span.start)) {
                // We are in a position a pipe name is expected.
                const pipes = query.getPipes();
                if (pipes) {
                    symbol = pipes.get(ast.name);
                    span = ast.span;
                }
            }
        },
        visitPrefixNot(ast) { },
        visitNonNullAssert(ast) { },
        visitPropertyRead(ast) {
            const receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitPropertyWrite(ast) {
            const receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitQuote(ast) { },
        visitSafeMethodCall(ast) {
            const receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
        visitSafePropertyRead(ast) {
            const receiverType = getType(ast.receiver);
            symbol = receiverType && receiverType.members().get(ast.name);
            span = ast.span;
        },
    });
    if (symbol && span) {
        return { symbol, span };
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const values = [
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
const groups = [
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
const elements = {
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
const defaultAttributes = [0, 1, 2, 4];
function elementNames() {
    return Object.keys(elements).sort().map(v => v.toLowerCase());
}
function compose(indexes) {
    const result = {};
    if (indexes) {
        for (let index of indexes) {
            const group = groups[index];
            for (let name in group)
                if (group.hasOwnProperty(name))
                    result[name] = values[group[name]];
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
const SCHEMA = [
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
const EVENT = 'event';
const BOOLEAN = 'boolean';
const NUMBER = 'number';
const STRING = 'string';
const OBJECT = 'object';
class SchemaInformation {
    constructor() {
        this.schema = {};
        SCHEMA.forEach(encodedType => {
            const parts = encodedType.split('|');
            const properties = parts[1].split(',');
            const typeParts = (parts[0] + '^').split('^');
            const typeName = typeParts[0];
            const type = {};
            typeName.split(',').forEach(tag => this.schema[tag.toLowerCase()] = type);
            const superName = typeParts[1];
            const superType = superName && this.schema[superName.toLowerCase()];
            if (superType) {
                for (const key in superType) {
                    type[key] = superType[key];
                }
            }
            properties.forEach((property) => {
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
    allKnownElements() { return Object.keys(this.schema); }
    eventsOf(elementName) {
        const elementType = this.schema[elementName.toLowerCase()] || {};
        return Object.keys(elementType).filter(property => elementType[property] === EVENT);
    }
    propertiesOf(elementName) {
        const elementType = this.schema[elementName.toLowerCase()] || {};
        return Object.keys(elementType).filter(property => elementType[property] !== EVENT);
    }
    typeOf(elementName, property) {
        return (this.schema[elementName.toLowerCase()] || {})[property];
    }
    static get instance() {
        let result = SchemaInformation._instance;
        if (!result) {
            result = SchemaInformation._instance = new SchemaInformation();
        }
        return result;
    }
}
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
const TEMPLATE_ATTR_PREFIX = '*';
const hiddenHtmlElements = {
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
    let result = undefined;
    let { htmlAst, templateAst, template } = templateInfo;
    // The templateNode starts at the delimiter character so we add 1 to skip it.
    if (templateInfo.position != null) {
        let templatePosition = templateInfo.position - template.span.start;
        let path$$1 = findNode(htmlAst, templatePosition);
        let mostSpecific = path$$1.tail;
        if (path$$1.empty || !mostSpecific) {
            result = elementCompletions(templateInfo, path$$1);
        }
        else {
            let astPosition = templatePosition - mostSpecific.sourceSpan.start.offset;
            mostSpecific.visit({
                visitElement(ast) {
                    let startTagSpan = spanOf(ast.sourceSpan);
                    let tagLen = ast.name.length;
                    if (templatePosition <=
                        startTagSpan.start + tagLen + 1 /* 1 for the opening angle bracked */) {
                        // If we are in the tag then return the element completions.
                        result = elementCompletions(templateInfo, path$$1);
                    }
                    else if (templatePosition < startTagSpan.end) {
                        // We are in the attribute section of the element (but not in an attribute).
                        // Return the attribute completions.
                        result = attributeCompletions(templateInfo, path$$1);
                    }
                },
                visitAttribute(ast) {
                    if (!ast.valueSpan || !inSpan(templatePosition, spanOf(ast.valueSpan))) {
                        // We are in the name of an attribute. Show attribute completions.
                        result = attributeCompletions(templateInfo, path$$1);
                    }
                    else if (ast.valueSpan && inSpan(templatePosition, spanOf(ast.valueSpan))) {
                        result = attributeValueCompletions(templateInfo, templatePosition, ast);
                    }
                },
                visitText(ast) {
                    // Check if we are in a entity.
                    result = entityCompletions(getSourceText(template, spanOf(ast)), astPosition);
                    if (result)
                        return result;
                    result = interpolationCompletions(templateInfo, templatePosition);
                    if (result)
                        return result;
                    let element = path$$1.first(Element);
                    if (element) {
                        let definition = getHtmlTagDefinition(element.name);
                        if (definition.contentType === TagContentType.PARSABLE_DATA) {
                            result = voidElementAttributeCompletions(templateInfo, path$$1);
                            if (!result) {
                                // If the element can hold content Show element completions.
                                result = elementCompletions(templateInfo, path$$1);
                            }
                        }
                    }
                    else {
                        // If no element container, implies parsable data so show elements.
                        result = voidElementAttributeCompletions(templateInfo, path$$1);
                        if (!result) {
                            result = elementCompletions(templateInfo, path$$1);
                        }
                    }
                },
                visitComment(ast) { },
                visitExpansion(ast) { },
                visitExpansionCase(ast) { }
            }, null);
        }
    }
    return result;
}
function attributeCompletions(info, path$$1) {
    let item = path$$1.tail instanceof Element ? path$$1.tail : path$$1.parentOf(path$$1.tail);
    if (item instanceof Element) {
        return attributeCompletionsForElement(info, item.name, item);
    }
    return undefined;
}
function attributeCompletionsForElement(info, elementName, element) {
    const attributes = getAttributeInfosForElement(info, elementName, element);
    // Map all the attributes to a completion
    return attributes.map(attr => ({
        kind: attr.fromHtml ? 'html attribute' : 'attribute',
        name: nameOfAttr(attr),
        sort: attr.name
    }));
}
function getAttributeInfosForElement(info, elementName, element) {
    let attributes = [];
    // Add html attributes
    let htmlAttributes = attributeNames(elementName) || [];
    if (htmlAttributes) {
        attributes.push(...htmlAttributes.map(name => ({ name, fromHtml: true })));
    }
    // Add html properties
    let htmlProperties = propertyNames(elementName);
    if (htmlProperties) {
        attributes.push(...htmlProperties.map(name => ({ name, input: true })));
    }
    // Add html events
    let htmlEvents = eventNames(elementName);
    if (htmlEvents) {
        attributes.push(...htmlEvents.map(name => ({ name, output: true })));
    }
    let { selectors, map: selectorMap } = getSelectors(info);
    if (selectors && selectors.length) {
        // All the attributes that are selectable should be shown.
        const applicableSelectors = selectors.filter(selector => !selector.element || selector.element == elementName);
        const selectorAndAttributeNames = applicableSelectors.map(selector => ({ selector, attrs: selector.attrs.filter(a => !!a) }));
        let attrs = flatten(selectorAndAttributeNames.map(selectorAndAttr => {
            const directive = selectorMap.get(selectorAndAttr.selector);
            const result = selectorAndAttr.attrs.map(name => ({ name, input: name in directive.inputs, output: name in directive.outputs }));
            return result;
        }));
        // Add template attribute if a directive contains a template reference
        selectorAndAttributeNames.forEach(selectorAndAttr => {
            const selector = selectorAndAttr.selector;
            const directive = selectorMap.get(selector);
            if (directive && hasTemplateReference(directive.type) && selector.attrs.length &&
                selector.attrs[0]) {
                attrs.push({ name: selector.attrs[0], template: true });
            }
        });
        // All input and output properties of the matching directives should be added.
        let elementSelector = element ?
            createElementCssSelector(element) :
            createElementCssSelector(new Element(elementName, [], [], null, null, null));
        let matcher = new SelectorMatcher();
        matcher.addSelectables(selectors);
        matcher.match(elementSelector, selector => {
            let directive = selectorMap.get(selector);
            if (directive) {
                attrs.push(...Object.keys(directive.inputs).map(name => ({ name, input: true })));
                attrs.push(...Object.keys(directive.outputs).map(name => ({ name, output: true })));
            }
        });
        // If a name shows up twice, fold it into a single value.
        attrs = foldAttrs(attrs);
        // Now expand them back out to ensure that input/output shows up as well as input and
        // output.
        attributes.push(...flatten(attrs.map(expandedAttr)));
    }
    return attributes;
}
function attributeValueCompletions(info, position, attr) {
    const path$$1 = findTemplateAstAt(info.templateAst, position);
    const mostSpecific = path$$1.tail;
    const dinfo = diagnosticInfoFromTemplateInfo(info);
    if (mostSpecific) {
        const visitor = new ExpressionVisitor(info, position, attr, () => getExpressionScope(dinfo, path$$1, false));
        mostSpecific.visit(visitor, null);
        if (!visitor.result || !visitor.result.length) {
            // Try allwoing widening the path
            const widerPath = findTemplateAstAt(info.templateAst, position, /* allowWidening */ true);
            if (widerPath.tail) {
                const widerVisitor = new ExpressionVisitor(info, position, attr, () => getExpressionScope(dinfo, widerPath, false));
                widerPath.tail.visit(widerVisitor, null);
                return widerVisitor.result;
            }
        }
        return visitor.result;
    }
}
function elementCompletions(info, path$$1) {
    let htmlNames = elementNames().filter(name => !(name in hiddenHtmlElements));
    // Collect the elements referenced by the selectors
    let directiveElements = getSelectors(info)
        .selectors.map(selector => selector.element)
        .filter(name => !!name);
    let components = directiveElements.map(name => ({ kind: 'component', name, sort: name }));
    let htmlElements = htmlNames.map(name => ({ kind: 'element', name: name, sort: name }));
    // Return components and html elements
    return uniqueByName(htmlElements.concat(components));
}
function entityCompletions(value, position) {
    // Look for entity completions
    const re = /&[A-Za-z]*;?(?!\d)/g;
    let found;
    let result = undefined;
    while (found = re.exec(value)) {
        let len = found[0].length;
        if (position >= found.index && position < (found.index + len)) {
            result = Object.keys(NAMED_ENTITIES)
                .map(name => ({ kind: 'entity', name: `&${name};`, sort: name }));
            break;
        }
    }
    return result;
}
function interpolationCompletions(info, position) {
    // Look for an interpolation in at the position.
    const templatePath = findTemplateAstAt(info.templateAst, position);
    const mostSpecific = templatePath.tail;
    if (mostSpecific) {
        let visitor = new ExpressionVisitor(info, position, undefined, () => getExpressionScope(diagnosticInfoFromTemplateInfo(info), templatePath, false));
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
    let tail = path$$1.tail;
    if (tail instanceof Text) {
        let match = tail.value.match(/<(\w(\w|\d|-)*:)?(\w(\w|\d|-)*)\s/);
        // The position must be after the match, otherwise we are still in a place where elements
        // are expected (such as `<|a` or `<a|`; we only want attributes for `<a |` or after).
        if (match &&
            path$$1.position >= (match.index || 0) + match[0].length + tail.sourceSpan.start.offset) {
            return attributeCompletionsForElement(info, match[3]);
        }
    }
}
class ExpressionVisitor extends NullTemplateVisitor {
    constructor(info, position, attr, getExpressionScope$$1) {
        super();
        this.info = info;
        this.position = position;
        this.attr = attr;
        this.getExpressionScope = getExpressionScope$$1 || (() => info.template.members);
    }
    visitDirectiveProperty(ast) {
        this.attributeValueCompletions(ast.value);
    }
    visitElementProperty(ast) {
        this.attributeValueCompletions(ast.value);
    }
    visitEvent(ast) { this.attributeValueCompletions(ast.handler); }
    visitElement(ast) {
        if (this.attr && getSelectors(this.info) && this.attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            // The value is a template expression but the expression AST was not produced when the
            // TemplateAst was produce so
            // do that now.
            const key = this.attr.name.substr(TEMPLATE_ATTR_PREFIX.length);
            // Find the selector
            const selectorInfo = getSelectors(this.info);
            const selectors = selectorInfo.selectors;
            const selector = selectors.filter(s => s.attrs.some((attr, i) => i % 2 == 0 && attr == key))[0];
            const templateBindingResult = this.info.expressionParser.parseTemplateBindings(key, this.attr.value, null);
            // find the template binding that contains the position
            if (!this.attr.valueSpan)
                return;
            const valueRelativePosition = this.position - this.attr.valueSpan.start.offset - 1;
            const bindings = templateBindingResult.templateBindings;
            const binding = bindings.find(binding => inSpan(valueRelativePosition, binding.span, /* exclusive */ true)) ||
                bindings.find(binding => inSpan(valueRelativePosition, binding.span));
            const keyCompletions = () => {
                let keys = [];
                if (selector) {
                    const attrNames = selector.attrs.filter((_, i) => i % 2 == 0);
                    keys = attrNames.filter(name => name.startsWith(key) && name != key)
                        .map(name => lowerName(name.substr(key.length)));
                }
                keys.push('let');
                this.result = keys.map(key => ({ kind: 'key', name: key, sort: key }));
            };
            if (!binding || (binding.key == key && !binding.expression)) {
                // We are in the root binding. We should return `let` and keys that are left in the
                // selector.
                keyCompletions();
            }
            else if (binding.keyIsVar) {
                const equalLocation = this.attr.value.indexOf('=');
                this.result = [];
                if (equalLocation >= 0 && valueRelativePosition >= equalLocation) {
                    // We are after the '=' in a let clause. The valid values here are the members of the
                    // template reference's type parameter.
                    const directiveMetadata = selectorInfo.map.get(selector);
                    if (directiveMetadata) {
                        const contextTable = this.info.template.query.getTemplateContext(directiveMetadata.type.reference);
                        if (contextTable) {
                            this.result = this.symbolsToCompletions(contextTable.values());
                        }
                    }
                }
                else if (binding.key && valueRelativePosition <= (binding.key.length - key.length)) {
                    keyCompletions();
                }
            }
            else {
                // If the position is in the expression or after the key or there is no key, return the
                // expression completions
                if ((binding.expression && inSpan(valueRelativePosition, binding.expression.ast.span)) ||
                    (binding.key &&
                        valueRelativePosition > binding.span.start + (binding.key.length - key.length)) ||
                    !binding.key) {
                    const span = new ParseSpan(0, this.attr.value.length);
                    this.attributeValueCompletions(binding.expression ? binding.expression.ast :
                        new PropertyRead(span, new ImplicitReceiver(span), ''), valueRelativePosition);
                }
                else {
                    keyCompletions();
                }
            }
        }
    }
    visitBoundText(ast) {
        const expressionPosition = this.position - ast.sourceSpan.start.offset;
        if (inSpan(expressionPosition, ast.value.span)) {
            const completions = getExpressionCompletions(this.getExpressionScope(), ast.value, expressionPosition, this.info.template.query);
            if (completions) {
                this.result = this.symbolsToCompletions(completions);
            }
        }
    }
    attributeValueCompletions(value, position) {
        const symbols = getExpressionCompletions(this.getExpressionScope(), value, position == null ? this.attributeValuePosition : position, this.info.template.query);
        if (symbols) {
            this.result = this.symbolsToCompletions(symbols);
        }
    }
    symbolsToCompletions(symbols) {
        return symbols.filter(s => !s.name.startsWith('__') && s.public)
            .map(symbol => ({ kind: symbol.kind, name: symbol.name, sort: symbol.name }));
    }
    get attributeValuePosition() {
        if (this.attr && this.attr.valueSpan) {
            return this.position - this.attr.valueSpan.start.offset - 1;
        }
        return 0;
    }
}
function getSourceText(template, span) {
    return template.source.substring(span.start, span.end);
}
function nameOfAttr(attr) {
    let name = attr.name;
    if (attr.output) {
        name = removeSuffix(name, 'Events');
        name = removeSuffix(name, 'Changed');
    }
    let result = [name];
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
const templateAttr = /^(\w+:)?(template$|^\*)/;
function createElementCssSelector(element) {
    const cssSelector = new CssSelector();
    let elNameNoNs = splitNsName(element.name)[1];
    cssSelector.setElement(elNameNoNs);
    for (let attr of element.attrs) {
        if (!attr.name.match(templateAttr)) {
            let [_, attrNameNoNs] = splitNsName(attr.name);
            cssSelector.addAttribute(attrNameNoNs, attr.value);
            if (attr.name.toLowerCase() == 'class') {
                const classes = attr.value.split(/s+/g);
                classes.forEach(className => cssSelector.addClassName(className));
            }
        }
    }
    return cssSelector;
}
function foldAttrs(attrs) {
    let inputOutput = new Map();
    let templates = new Map();
    let result = [];
    attrs.forEach(attr => {
        if (attr.fromHtml) {
            return attr;
        }
        if (attr.template) {
            let duplicate = templates.get(attr.name);
            if (!duplicate) {
                result.push({ name: attr.name, template: true });
                templates.set(attr.name, attr);
            }
        }
        if (attr.input || attr.output) {
            let duplicate = inputOutput.get(attr.name);
            if (duplicate) {
                duplicate.input = duplicate.input || attr.input;
                duplicate.output = duplicate.output || attr.output;
            }
            else {
                let cloneAttr = { name: attr.name };
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
    const templatePosition = info.position - info.template.span.start;
    const path$$1 = findTemplateAstAt(info.templateAst, templatePosition);
    if (path$$1.tail) {
        let symbol = undefined;
        let span = undefined;
        const attributeValueSymbol = (ast, inEvent = false) => {
            const attribute = findAttribute(info);
            if (attribute) {
                if (inSpan(templatePosition, spanOf(attribute.valueSpan))) {
                    const dinfo = diagnosticInfoFromTemplateInfo(info);
                    const scope = getExpressionScope(dinfo, path$$1, inEvent);
                    if (attribute.valueSpan) {
                        const expressionOffset = attribute.valueSpan.start.offset + 1;
                        const result = getExpressionSymbol(scope, ast, templatePosition - expressionOffset, info.template.query);
                        if (result) {
                            symbol = result.symbol;
                            span = offsetSpan(result.span, expressionOffset);
                        }
                    }
                    return true;
                }
            }
            return false;
        };
        path$$1.tail.visit({
            visitNgContent(ast) { },
            visitEmbeddedTemplate(ast) { },
            visitElement(ast) {
                const component = ast.directives.find(d => d.directive.isComponent);
                if (component) {
                    symbol = info.template.query.getTypeSymbol(component.directive.type.reference);
                    symbol = symbol && new OverrideKindSymbol(symbol, 'component');
                    span = spanOf(ast);
                }
                else {
                    // Find a directive that matches the element name
                    const directive = ast.directives.find(d => d.directive.selector != null && d.directive.selector.indexOf(ast.name) >= 0);
                    if (directive) {
                        symbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                        symbol = symbol && new OverrideKindSymbol(symbol, 'directive');
                        span = spanOf(ast);
                    }
                }
            },
            visitReference(ast) {
                symbol = ast.value && info.template.query.getTypeSymbol(tokenReference(ast.value));
                span = spanOf(ast);
            },
            visitVariable(ast) { },
            visitEvent(ast) {
                if (!attributeValueSymbol(ast.handler, /* inEvent */ true)) {
                    symbol = findOutputBinding(info, path$$1, ast);
                    symbol = symbol && new OverrideKindSymbol(symbol, 'event');
                    span = spanOf(ast);
                }
            },
            visitElementProperty(ast) { attributeValueSymbol(ast.value); },
            visitAttr(ast) { },
            visitBoundText(ast) {
                const expressionPosition = templatePosition - ast.sourceSpan.start.offset;
                if (inSpan(expressionPosition, ast.value.span)) {
                    const dinfo = diagnosticInfoFromTemplateInfo(info);
                    const scope = getExpressionScope(dinfo, path$$1, /* includeEvent */ false);
                    const result = getExpressionSymbol(scope, ast.value, expressionPosition, info.template.query);
                    if (result) {
                        symbol = result.symbol;
                        span = offsetSpan(result.span, ast.sourceSpan.start.offset);
                    }
                }
            },
            visitText(ast) { },
            visitDirective(ast) {
                symbol = info.template.query.getTypeSymbol(ast.directive.type.reference);
                span = spanOf(ast);
            },
            visitDirectiveProperty(ast) {
                if (!attributeValueSymbol(ast.value)) {
                    symbol = findInputBinding(info, path$$1, ast);
                    span = spanOf(ast);
                }
            }
        }, null);
        if (symbol && span) {
            return { symbol, span: offsetSpan(span, info.template.span.start) };
        }
    }
}
function findAttribute(info) {
    if (info.position) {
        const templatePosition = info.position - info.template.span.start;
        const path$$1 = findNode(info.htmlAst, templatePosition);
        return path$$1.first(Attribute);
    }
}
function findInputBinding(info, path$$1, binding) {
    const element = path$$1.first(ElementAst);
    if (element) {
        for (const directive of element.directives) {
            const invertedInput = invertMap(directive.directive.inputs);
            const fieldName = invertedInput[binding.templateName];
            if (fieldName) {
                const classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                if (classSymbol) {
                    return classSymbol.members().get(fieldName);
                }
            }
        }
    }
}
function findOutputBinding(info, path$$1, binding) {
    const element = path$$1.first(ElementAst);
    if (element) {
        for (const directive of element.directives) {
            const invertedOutputs = invertMap(directive.directive.outputs);
            const fieldName = invertedOutputs[binding.name];
            if (fieldName) {
                const classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
                if (classSymbol) {
                    return classSymbol.members().get(fieldName);
                }
            }
        }
    }
}
function invertMap(obj) {
    const result = {};
    for (const name of Object.keys(obj)) {
        const v = obj[name];
        result[v] = name;
    }
    return result;
}
/**
 * Wrap a symbol and change its kind to component.
 */
class OverrideKindSymbol {
    constructor(sym, kindOverride) {
        this.sym = sym;
        this.kind = kindOverride;
    }
    get name() { return this.sym.name; }
    get language() { return this.sym.language; }
    get type() { return this.sym.type; }
    get container() { return this.sym.container; }
    get public() { return this.sym.public; }
    get callable() { return this.sym.callable; }
    get nullable() { return this.sym.nullable; }
    get definition() { return this.sym.definition; }
    members() { return this.sym.members(); }
    signatures() { return this.sym.signatures(); }
    selectSignature(types) { return this.sym.selectSignature(types); }
    indexed(argument) { return this.sym.indexed(argument); }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getDefinition(info) {
    const result = locateSymbol(info);
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
    const results = [];
    for (const template of templates) {
        const ast = astProvider.getTemplateAst(template, fileName);
        if (ast) {
            if (ast.parseErrors && ast.parseErrors.length) {
                results.push(...ast.parseErrors.map(e => ({
                    kind: DiagnosticKind.Error,
                    span: offsetSpan(spanOf(e.span), template.span.start),
                    message: e.msg
                })));
            }
            else if (ast.templateAst && ast.htmlAst) {
                const info = {
                    templateAst: ast.templateAst,
                    htmlAst: ast.htmlAst,
                    offset: template.span.start,
                    query: template.query,
                    members: template.members
                };
                const expressionDiagnostics = getTemplateExpressionDiagnostics(info);
                results.push(...expressionDiagnostics);
            }
            if (ast.errors) {
                results.push(...ast.errors.map(e => ({ kind: e.kind, span: e.span || template.span, message: e.message })));
            }
        }
    }
    return results;
}
function getDeclarationDiagnostics(declarations, modules) {
    const results = [];
    let directives = undefined;
    for (const declaration of declarations) {
        const report = (message, span) => {
            results.push({
                kind: DiagnosticKind.Error,
                span: span || declaration.declarationSpan, message
            });
        };
        for (const error of declaration.errors) {
            report(error.message, error.span);
        }
        if (declaration.metadata) {
            if (declaration.metadata.isComponent) {
                if (!modules.ngModuleByPipeOrDirective.has(declaration.type)) {
                    report(`Component '${declaration.type.name}' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration`);
                }
                const { template, templateUrl } = declaration.metadata.template;
                if (template === null && !templateUrl) {
                    report(`Component '${declaration.type.name}' must have a template or templateUrl`);
                }
                else if (template && templateUrl) {
                    report(`Component '${declaration.type.name}' must not have both template and templateUrl`);
                }
            }
            else {
                if (!directives) {
                    directives = new Set();
                    modules.ngModules.forEach(module => {
                        module.declaredDirectives.forEach(directive => { directives.add(directive.reference); });
                    });
                }
                if (!directives.has(declaration.type)) {
                    report(`Directive '${declaration.type.name}' is not included in a module and will not be available inside a template. Consider adding it to a NgModule declaration`);
                }
            }
        }
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
    const result = locateSymbol(info);
    if (result) {
        return { text: hoverTextOf(result.symbol), span: result.span };
    }
}
function hoverTextOf(symbol) {
    const result = [{ text: symbol.kind }, { text: ' ' }, { text: symbol.name, language: symbol.language }];
    const container = symbol.container;
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
class LanguageServiceImpl {
    constructor(host) {
        this.host = host;
    }
    get metadataResolver() { return this.host.resolver; }
    getTemplateReferences() { return this.host.getTemplateReferences(); }
    getDiagnostics(fileName) {
        let results = [];
        let templates = this.host.getTemplates(fileName);
        if (templates && templates.length) {
            results.push(...getTemplateDiagnostics(fileName, this, templates));
        }
        let declarations = this.host.getDeclarations(fileName);
        if (declarations && declarations.length) {
            const summary = this.host.getAnalyzedModules();
            results.push(...getDeclarationDiagnostics(declarations, summary));
        }
        return uniqueBySpan(results);
    }
    getPipesAt(fileName, position) {
        let templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return templateInfo.pipes;
        }
        return [];
    }
    getCompletionsAt(fileName, position) {
        let templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return getTemplateCompletions(templateInfo);
        }
    }
    getDefinitionAt(fileName, position) {
        let templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return getDefinition(templateInfo);
        }
    }
    getHoverAt(fileName, position) {
        let templateInfo = this.getTemplateAstAtPosition(fileName, position);
        if (templateInfo) {
            return getHover(templateInfo);
        }
    }
    getTemplateAstAtPosition(fileName, position) {
        let template = this.host.getTemplateAt(fileName, position);
        if (template) {
            let astResult = this.getTemplateAst(template, fileName);
            if (astResult && astResult.htmlAst && astResult.templateAst && astResult.directive &&
                astResult.directives && astResult.pipes && astResult.expressionParser)
                return {
                    position,
                    fileName,
                    template,
                    htmlAst: astResult.htmlAst,
                    directive: astResult.directive,
                    directives: astResult.directives,
                    pipes: astResult.pipes,
                    templateAst: astResult.templateAst,
                    expressionParser: astResult.expressionParser
                };
        }
        return undefined;
    }
    getTemplateAst(template, contextFile) {
        let result = undefined;
        try {
            const resolvedMetadata = this.metadataResolver.getNonNormalizedDirectiveMetadata(template.type);
            const metadata = resolvedMetadata && resolvedMetadata.metadata;
            if (metadata) {
                const rawHtmlParser = new HtmlParser();
                const htmlParser = new I18NHtmlParser(rawHtmlParser);
                const expressionParser = new Parser(new Lexer());
                const config = new CompilerConfig();
                const parser = new TemplateParser(config, this.host.resolver.getReflector(), expressionParser, new DomElementSchemaRegistry(), htmlParser, null, []);
                const htmlResult = htmlParser.parse(template.source, '', true);
                const analyzedModules = this.host.getAnalyzedModules();
                let errors = undefined;
                let ngModule = analyzedModules.ngModuleByPipeOrDirective.get(template.type);
                if (!ngModule) {
                    // Reported by the the declaration diagnostics.
                    ngModule = findSuitableDefaultModule(analyzedModules);
                }
                if (ngModule) {
                    const resolvedDirectives = ngModule.transitiveModule.directives.map(d => this.host.resolver.getNonNormalizedDirectiveMetadata(d.reference));
                    const directives = removeMissing(resolvedDirectives).map(d => d.metadata.toSummary());
                    const pipes = ngModule.transitiveModule.pipes.map(p => this.host.resolver.getOrLoadPipeMetadata(p.reference).toSummary());
                    const schemas = ngModule.schemas;
                    const parseResult = parser.tryParseHtml(htmlResult, metadata, directives, pipes, schemas);
                    result = {
                        htmlAst: htmlResult.rootNodes,
                        templateAst: parseResult.templateAst,
                        directive: metadata, directives, pipes,
                        parseErrors: parseResult.errors, expressionParser, errors
                    };
                }
            }
        }
        catch (e) {
            let span = template.span;
            if (e.fileName == contextFile) {
                span = template.query.getSpanAt(e.line, e.column) || span;
            }
            result = { errors: [{ kind: DiagnosticKind.Error, message: e.message, span }] };
        }
        return result || {};
    }
}
function removeMissing(values) {
    return values.filter(e => !!e);
}
function uniqueBySpan(elements) {
    if (elements) {
        const result = [];
        const map = new Map();
        for (const element of elements) {
            let span = element.span;
            let set = map.get(span.start);
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
    let result = undefined;
    let resultSize = 0;
    for (const module of modules.ngModules) {
        const moduleSize = module.transitiveModule.directives.length;
        if (moduleSize > resultSize) {
            result = module;
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
class ReflectorModuleModuleResolutionHost {
    constructor(host, getProgram) {
        this.host = host;
        this.getProgram = getProgram;
        // Note: verboseInvalidExpressions is important so that
        // the collector will collect errors instead of throwing
        this.metadataCollector = new MetadataCollector({ verboseInvalidExpression: true });
        if (host.directoryExists)
            this.directoryExists = directoryName => this.host.directoryExists(directoryName);
    }
    fileExists(fileName) { return !!this.host.getScriptSnapshot(fileName); }
    readFile(fileName) {
        let snapshot = this.host.getScriptSnapshot(fileName);
        if (snapshot) {
            return snapshot.getText(0, snapshot.getLength());
        }
        // Typescript readFile() declaration should be `readFile(fileName: string): string | undefined
        return undefined;
    }
    getSourceFileMetadata(fileName) {
        const sf = this.getProgram().getSourceFile(fileName);
        return sf ? this.metadataCollector.getMetadata(sf) : undefined;
    }
    cacheMetadata(fileName) {
        // Don't cache the metadata for .ts files as they might change in the editor!
        return fileName.endsWith('.d.ts');
    }
}
class ReflectorHost {
    constructor(getProgram, serviceHost, options) {
        this.options = options;
        this.metadataReaderCache = createMetadataReaderCache();
        this.hostAdapter = new ReflectorModuleModuleResolutionHost(serviceHost, getProgram);
        this.moduleResolutionCache =
            createModuleResolutionCache(serviceHost.getCurrentDirectory(), (s) => s);
    }
    getMetadataFor(modulePath) {
        return readMetadata(modulePath, this.hostAdapter, this.metadataReaderCache);
    }
    moduleNameToFileName(moduleName, containingFile) {
        if (!containingFile) {
            if (moduleName.indexOf('.') === 0) {
                throw new Error('Resolution of relative paths requires a containing file.');
            }
            // Any containing file gives the same result for absolute imports
            containingFile = join(this.options.basePath, 'index.ts').replace(/\\/g, '/');
        }
        const resolved = resolveModuleName(moduleName, containingFile, this.options, this.hostAdapter)
            .resolvedModule;
        return resolved ? resolved.resolvedFileName : null;
    }
    getOutputName(filePath) { return filePath; }
}

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
    const ngHost = new TypeScriptServiceHost(host, service);
    const ngServer = createLanguageService(ngHost);
    ngHost.setSite(ngServer);
    return ngServer;
}
/**
 * The language service never needs the normalized versions of the metadata. To avoid parsing
 * the content and resolving references, return an empty file. This also allows normalizing
 * template that are syntatically incorrect which is required to provide completions in
 * syntactically incorrect templates.
 */
class DummyHtmlParser extends HtmlParser {
    parse(source, url, parseExpansionForms = false, interpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
        return new ParseTreeResult([], []);
    }
}
/**
 * Avoid loading resources in the language servcie by using a dummy loader.
 */
class DummyResourceLoader extends ResourceLoader {
    get(url) { return Promise.resolve(''); }
}
/**
 * An implemntation of a `LanguageServiceHost` for a TypeScript project.
 *
 * The `TypeScriptServiceHost` implements the Angular `LanguageServiceHost` using
 * the TypeScript language services.
 *
 * @experimental
 */
class TypeScriptServiceHost {
    constructor(host, tsService) {
        this.host = host;
        this.tsService = tsService;
        this._staticSymbolCache = new StaticSymbolCache();
        this._typeCache = [];
        this.modulesOutOfDate = true;
        this.fileVersions = new Map();
    }
    setSite(service) { this.service = service; }
    /**
     * Angular LanguageServiceHost implementation
     */
    get resolver() {
        this.validate();
        let result = this._resolver;
        if (!result) {
            const moduleResolver = new NgModuleResolver(this.reflector);
            const directiveResolver = new DirectiveResolver(this.reflector);
            const pipeResolver = new PipeResolver(this.reflector);
            const elementSchemaRegistry = new DomElementSchemaRegistry();
            const resourceLoader = new DummyResourceLoader();
            const urlResolver = createOfflineCompileUrlResolver();
            const htmlParser = new DummyHtmlParser();
            // This tracks the CompileConfig in codegen.ts. Currently these options
            // are hard-coded.
            const config = new CompilerConfig({ defaultEncapsulation: ViewEncapsulation.Emulated, useJit: false });
            const directiveNormalizer = new DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
            result = this._resolver = new CompileMetadataResolver(config, htmlParser, moduleResolver, directiveResolver, pipeResolver, new JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new ɵConsole(), this._staticSymbolCache, this.reflector, (error, type) => this.collectError(error, type && type.filePath));
        }
        return result;
    }
    getTemplateReferences() {
        this.ensureTemplateMap();
        return this.templateReferences || [];
    }
    getTemplateAt(fileName, position) {
        let sourceFile = this.getSourceFile(fileName);
        if (sourceFile) {
            this.context = sourceFile.fileName;
            let node = this.findNode(sourceFile, position);
            if (node) {
                return this.getSourceFromNode(fileName, this.host.getScriptVersion(sourceFile.fileName), node);
            }
        }
        else {
            this.ensureTemplateMap();
            // TODO: Cannocalize the file?
            const componentType = this.fileToComponent.get(fileName);
            if (componentType) {
                return this.getSourceFromType(fileName, this.host.getScriptVersion(fileName), componentType);
            }
        }
        return undefined;
    }
    getAnalyzedModules() {
        this.updateAnalyzedModules();
        return this.ensureAnalyzedModules();
    }
    ensureAnalyzedModules() {
        let analyzedModules = this.analyzedModules;
        if (!analyzedModules) {
            if (this.host.getScriptFileNames().length === 0) {
                analyzedModules = {
                    files: [],
                    ngModuleByPipeOrDirective: new Map(),
                    ngModules: [],
                };
            }
            else {
                const analyzeHost = { isSourceFile(filePath) { return true; } };
                const programFiles = this.program.getSourceFiles().map(sf => sf.fileName);
                analyzedModules =
                    analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
            }
            this.analyzedModules = analyzedModules;
        }
        return analyzedModules;
    }
    getTemplates(fileName) {
        this.ensureTemplateMap();
        const componentType = this.fileToComponent.get(fileName);
        if (componentType) {
            const templateSource = this.getTemplateAt(fileName, 0);
            if (templateSource) {
                return [templateSource];
            }
        }
        else {
            let version$$1 = this.host.getScriptVersion(fileName);
            let result = [];
            // Find each template string in the file
            let visit = (child) => {
                let templateSource = this.getSourceFromNode(fileName, version$$1, child);
                if (templateSource) {
                    result.push(templateSource);
                }
                else {
                    forEachChild(child, visit);
                }
            };
            let sourceFile = this.getSourceFile(fileName);
            if (sourceFile) {
                this.context = sourceFile.path || sourceFile.fileName;
                forEachChild(sourceFile, visit);
            }
            return result.length ? result : undefined;
        }
    }
    getDeclarations(fileName) {
        const result = [];
        const sourceFile = this.getSourceFile(fileName);
        if (sourceFile) {
            let visit = (child) => {
                let declaration = this.getDeclarationFromNode(sourceFile, child);
                if (declaration) {
                    result.push(declaration);
                }
                else {
                    forEachChild(child, visit);
                }
            };
            forEachChild(sourceFile, visit);
        }
        return result;
    }
    getSourceFile(fileName) {
        return this.tsService.getProgram().getSourceFile(fileName);
    }
    updateAnalyzedModules() {
        this.validate();
        if (this.modulesOutOfDate) {
            this.analyzedModules = null;
            this._reflector = null;
            this.templateReferences = null;
            this.fileToComponent = null;
            this.ensureAnalyzedModules();
            this.modulesOutOfDate = false;
        }
    }
    get program() { return this.tsService.getProgram(); }
    get checker() {
        let checker = this._checker;
        if (!checker) {
            checker = this._checker = this.program.getTypeChecker();
        }
        return checker;
    }
    validate() {
        const program = this.program;
        if (this.lastProgram !== program) {
            // Invalidate file that have changed in the static symbol resolver
            const invalidateFile = (fileName) => this._staticSymbolResolver.invalidateFile(fileName);
            this.clearCaches();
            const seen = new Set();
            for (let sourceFile of this.program.getSourceFiles()) {
                const fileName = sourceFile.fileName;
                seen.add(fileName);
                const version$$1 = this.host.getScriptVersion(fileName);
                const lastVersion = this.fileVersions.get(fileName);
                if (version$$1 != lastVersion) {
                    this.fileVersions.set(fileName, version$$1);
                    if (this._staticSymbolResolver) {
                        invalidateFile(fileName);
                    }
                }
            }
            // Remove file versions that are no longer in the file and invalidate them.
            const missing = Array.from(this.fileVersions.keys()).filter(f => !seen.has(f));
            missing.forEach(f => this.fileVersions.delete(f));
            if (this._staticSymbolResolver) {
                missing.forEach(invalidateFile);
            }
            this.lastProgram = program;
        }
    }
    clearCaches() {
        this._checker = null;
        this._typeCache = [];
        this._resolver = null;
        this.collectedErrors = null;
        this.modulesOutOfDate = true;
    }
    ensureTemplateMap() {
        if (!this.fileToComponent || !this.templateReferences) {
            const fileToComponent = new Map();
            const templateReference = [];
            const ngModuleSummary = this.getAnalyzedModules();
            const urlResolver = createOfflineCompileUrlResolver();
            for (const module of ngModuleSummary.ngModules) {
                for (const directive of module.declaredDirectives) {
                    const { metadata } = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference);
                    if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
                        const templateName = urlResolver.resolve(this.reflector.componentModuleUrl(directive.reference), metadata.template.templateUrl);
                        fileToComponent.set(templateName, directive.reference);
                        templateReference.push(templateName);
                    }
                }
            }
            this.fileToComponent = fileToComponent;
            this.templateReferences = templateReference;
        }
    }
    getSourceFromDeclaration(fileName, version$$1, source, span, type, declaration, node, sourceFile) {
        let queryCache = undefined;
        const t = this;
        if (declaration) {
            return {
                version: version$$1,
                source,
                span,
                type,
                get members() {
                    return getClassMembersFromDeclaration(t.program, t.checker, sourceFile, declaration);
                },
                get query() {
                    if (!queryCache) {
                        const pipes = t.service.getPipesAt(fileName, node.getStart());
                        queryCache = getSymbolQuery(t.program, t.checker, sourceFile, () => getPipesTable(sourceFile, t.program, t.checker, pipes));
                    }
                    return queryCache;
                }
            };
        }
    }
    getSourceFromNode(fileName, version$$1, node) {
        let result = undefined;
        const t = this;
        switch (node.kind) {
            case SyntaxKind.NoSubstitutionTemplateLiteral:
            case SyntaxKind.StringLiteral:
                let [declaration, decorator] = this.getTemplateClassDeclFromNode(node);
                if (declaration && declaration.name) {
                    const sourceFile = this.getSourceFile(fileName);
                    return this.getSourceFromDeclaration(fileName, version$$1, this.stringOf(node) || '', shrink(spanOf$1(node)), this.reflector.getStaticSymbol(sourceFile.fileName, declaration.name.text), declaration, node, sourceFile);
                }
                break;
        }
        return result;
    }
    getSourceFromType(fileName, version$$1, type) {
        let result = undefined;
        const declaration = this.getTemplateClassFromStaticSymbol(type);
        if (declaration) {
            const snapshot = this.host.getScriptSnapshot(fileName);
            if (snapshot) {
                const source = snapshot.getText(0, snapshot.getLength());
                result = this.getSourceFromDeclaration(fileName, version$$1, source, { start: 0, end: source.length }, type, declaration, declaration, declaration.getSourceFile());
            }
        }
        return result;
    }
    get reflectorHost() {
        let result = this._reflectorHost;
        if (!result) {
            if (!this.context) {
                // Make up a context by finding the first script and using that as the base dir.
                const scriptFileNames = this.host.getScriptFileNames();
                if (0 === scriptFileNames.length) {
                    throw new Error('Internal error: no script file names found');
                }
                this.context = scriptFileNames[0];
            }
            // Use the file context's directory as the base directory.
            // The host's getCurrentDirectory() is not reliable as it is always "" in
            // tsserver. We don't need the exact base directory, just one that contains
            // a source file.
            const source = this.tsService.getProgram().getSourceFile(this.context);
            if (!source) {
                throw new Error('Internal error: no context could be determined');
            }
            const tsConfigPath = findTsConfig(source.fileName);
            const basePath = dirname(tsConfigPath || this.context);
            const options = { basePath, genDir: basePath };
            const compilerOptions = this.host.getCompilationSettings();
            if (compilerOptions && compilerOptions.baseUrl) {
                options.baseUrl = compilerOptions.baseUrl;
            }
            if (compilerOptions && compilerOptions.paths) {
                options.paths = compilerOptions.paths;
            }
            result = this._reflectorHost =
                new ReflectorHost(() => this.tsService.getProgram(), this.host, options);
        }
        return result;
    }
    collectError(error, filePath) {
        if (filePath) {
            let errorMap = this.collectedErrors;
            if (!errorMap || !this.collectedErrors) {
                errorMap = this.collectedErrors = new Map();
            }
            let errors = errorMap.get(filePath);
            if (!errors) {
                errors = [];
                this.collectedErrors.set(filePath, errors);
            }
            errors.push(error);
        }
    }
    get staticSymbolResolver() {
        let result = this._staticSymbolResolver;
        if (!result) {
            this._summaryResolver = new AotSummaryResolver({
                loadSummary(filePath) { return null; },
                isSourceFile(sourceFilePath) { return true; },
                toSummaryFileName(sourceFilePath) { return sourceFilePath; },
                fromSummaryFileName(filePath) { return filePath; },
            }, this._staticSymbolCache);
            result = this._staticSymbolResolver = new StaticSymbolResolver(this.reflectorHost, this._staticSymbolCache, this._summaryResolver, (e, filePath) => this.collectError(e, filePath));
        }
        return result;
    }
    get reflector() {
        let result = this._reflector;
        if (!result) {
            const ssr = this.staticSymbolResolver;
            result = this._reflector = new StaticReflector(this._summaryResolver, ssr, [], [], (e, filePath) => this.collectError(e, filePath));
        }
        return result;
    }
    getTemplateClassFromStaticSymbol(type) {
        const source = this.getSourceFile(type.filePath);
        if (source) {
            const declarationNode = forEachChild(source, child => {
                if (child.kind === SyntaxKind.ClassDeclaration) {
                    const classDeclaration = child;
                    if (classDeclaration.name != null && classDeclaration.name.text === type.name) {
                        return classDeclaration;
                    }
                }
            });
            return declarationNode;
        }
        return undefined;
    }
    /**
     * Given a template string node, see if it is an Angular template string, and if so return the
     * containing class.
     */
    getTemplateClassDeclFromNode(currentToken) {
        // Verify we are in a 'template' property assignment, in an object literal, which is an call
        // arg, in a decorator
        let parentNode = currentToken.parent; // PropertyAssignment
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
        const callTarget = parentNode.expression;
        let decorator = parentNode.parent; // Decorator
        if (!decorator || decorator.kind !== SyntaxKind.Decorator) {
            return TypeScriptServiceHost.missingTemplate;
        }
        let declaration = decorator.parent; // ClassDeclaration
        if (!declaration || declaration.kind !== SyntaxKind.ClassDeclaration) {
            return TypeScriptServiceHost.missingTemplate;
        }
        return [declaration, callTarget];
    }
    getCollectedErrors(defaultSpan, sourceFile) {
        const errors = (this.collectedErrors && this.collectedErrors.get(sourceFile.fileName));
        return (errors && errors.map((e) => {
            const line = e.line || (e.position && e.position.line);
            const column = e.column || (e.position && e.position.column);
            const span = spanAt(sourceFile, line, column) || defaultSpan;
            if (isFormattedError(e)) {
                return errorToDiagnosticWithChain(e, span);
            }
            return { message: e.message, span };
        })) ||
            [];
    }
    getDeclarationFromNode(sourceFile, node) {
        if (node.kind == SyntaxKind.ClassDeclaration && node.decorators &&
            node.name) {
            for (const decorator of node.decorators) {
                if (decorator.expression && decorator.expression.kind == SyntaxKind.CallExpression) {
                    const classDeclaration = node;
                    if (classDeclaration.name) {
                        const call = decorator.expression;
                        const target = call.expression;
                        const type = this.checker.getTypeAtLocation(target);
                        if (type) {
                            const staticSymbol = this.reflector.getStaticSymbol(sourceFile.fileName, classDeclaration.name.text);
                            try {
                                if (this.resolver.isDirective(staticSymbol)) {
                                    const { metadata } = this.resolver.getNonNormalizedDirectiveMetadata(staticSymbol);
                                    const declarationSpan = spanOf$1(target);
                                    return {
                                        type: staticSymbol,
                                        declarationSpan,
                                        metadata,
                                        errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                    };
                                }
                            }
                            catch (e) {
                                if (e.message) {
                                    this.collectError(e, sourceFile.fileName);
                                    const declarationSpan = spanOf$1(target);
                                    return {
                                        type: staticSymbol,
                                        declarationSpan,
                                        errors: this.getCollectedErrors(declarationSpan, sourceFile)
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    stringOf(node) {
        switch (node.kind) {
            case SyntaxKind.NoSubstitutionTemplateLiteral:
                return node.text;
            case SyntaxKind.StringLiteral:
                return node.text;
        }
    }
    findNode(sourceFile, position) {
        function find(node) {
            if (position >= node.getStart() && position < node.getEnd()) {
                return forEachChild(node, find) || node;
            }
        }
        return find(sourceFile);
    }
}
TypeScriptServiceHost.missingTemplate = [undefined, undefined];
function findTsConfig(fileName) {
    let dir = dirname(fileName);
    while (existsSync(dir)) {
        const candidate = join(dir, 'tsconfig.json');
        if (existsSync(candidate))
            return candidate;
        const parentDir = dirname(dir);
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
        const position = getPositionOfLineAndCharacter(sourceFile, line, column);
        const findChild = function findChild(node) {
            if (node.kind > SyntaxKind.LastToken && node.pos <= position && node.end > position) {
                const betterNode = forEachChild(node, findChild);
                return betterNode || node;
            }
        };
        const node = forEachChild(sourceFile, findChild);
        if (node) {
            return { start: node.getStart(), end: node.getEnd() };
        }
    }
}
function convertChain(chain) {
    return { message: chain.message, next: chain.next ? convertChain(chain.next) : undefined };
}
function errorToDiagnosticWithChain(error, span) {
    return { message: error.chain ? convertChain(error.chain) : error.message, span };
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const projectHostMap = new WeakMap();
function getExternalFiles(project) {
    const host = projectHostMap.get(project);
    if (host) {
        return host.getTemplateReferences();
    }
}
const angularOnlyResults = process.argv.indexOf('--angularOnlyResults') >= 0;
function angularOnlyFilter(ls) {
    return {
        cleanupSemanticCache: () => ls.cleanupSemanticCache(),
        getSyntacticDiagnostics: fileName => [],
        getSemanticDiagnostics: fileName => [],
        getCompilerOptionsDiagnostics: () => [],
        getSyntacticClassifications: (fileName, span) => [],
        getSemanticClassifications: (fileName, span) => [],
        getEncodedSyntacticClassifications: (fileName, span) => ({ undefined }),
        getEncodedSemanticClassifications: (fileName, span) => undefined,
        getCompletionsAtPosition: (fileName, position) => undefined,
        getCompletionEntryDetails: (fileName, position, entryName) => undefined,
        getCompletionEntrySymbol: (fileName, position, entryName) => undefined,
        getQuickInfoAtPosition: (fileName, position) => undefined,
        getNameOrDottedNameSpan: (fileName, startPos, endPos) => undefined,
        getBreakpointStatementAtPosition: (fileName, position) => undefined,
        getSignatureHelpItems: (fileName, position) => undefined,
        getRenameInfo: (fileName, position) => undefined,
        findRenameLocations: (fileName, position, findInStrings, findInComments) => [],
        getDefinitionAtPosition: (fileName, position) => [],
        getTypeDefinitionAtPosition: (fileName, position) => [],
        getImplementationAtPosition: (fileName, position) => [],
        getReferencesAtPosition: (fileName, position) => [],
        findReferences: (fileName, position) => [],
        getDocumentHighlights: (fileName, position, filesToSearch) => [],
        /** @deprecated */
        getOccurrencesAtPosition: (fileName, position) => [],
        getNavigateToItems: searchValue => [],
        getNavigationBarItems: fileName => [],
        getNavigationTree: fileName => undefined,
        getOutliningSpans: fileName => [],
        getTodoComments: (fileName, descriptors) => [],
        getBraceMatchingAtPosition: (fileName, position) => [],
        getIndentationAtPosition: (fileName, position, options) => undefined,
        getFormattingEditsForRange: (fileName, start, end, options) => [],
        getFormattingEditsForDocument: (fileName, options) => [],
        getFormattingEditsAfterKeystroke: (fileName, position, key, options) => [],
        getDocCommentTemplateAtPosition: (fileName, position) => undefined,
        isValidBraceCompletionAtPosition: (fileName, position, openingBrace) => undefined,
        getSpanOfEnclosingComment: (fileName, position, onlyMultiLine) => undefined,
        getCodeFixesAtPosition: (fileName, start, end, errorCodes) => [],
        applyCodeActionCommand: (action) => Promise.resolve(undefined),
        getEmitOutput: fileName => undefined,
        getProgram: () => ls.getProgram(),
        dispose: () => ls.dispose(),
        getApplicableRefactors: (fileName, positionOrRaneg) => [],
        getEditsForRefactor: (fileName, formatOptions, positionOrRange, refactorName, actionName) => undefined
    };
}
function create(info /* ts.server.PluginCreateInfo */) {
    // Create the proxy
    const proxy = Object.create(null);
    let oldLS = info.languageService;
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
        return fileName => tryCall(fileName, () => (m.call(ls, fileName)));
    }
    function tryFilenameOneCall(m) {
        return (fileName, p) => tryCall(fileName, () => (m.call(ls, fileName, p)));
    }
    function tryFilenameTwoCall(m) {
        return (fileName, p1, p2) => tryCall(fileName, () => (m.call(ls, fileName, p1, p2)));
    }
    function tryFilenameThreeCall(m) {
        return (fileName, p1, p2, p3) => tryCall(fileName, () => (m.call(ls, fileName, p1, p2, p3)));
    }
    function tryFilenameFourCall(m) {
        return (fileName, p1, p2, p3, p4) => tryCall(fileName, () => (m.call(ls, fileName, p1, p2, p3, p4)));
    }
    function typescriptOnly(ls) {
        return {
            cleanupSemanticCache: () => ls.cleanupSemanticCache(),
            getSyntacticDiagnostics: tryFilenameCall(ls.getSyntacticDiagnostics),
            getSemanticDiagnostics: tryFilenameCall(ls.getSemanticDiagnostics),
            getCompilerOptionsDiagnostics: () => ls.getCompilerOptionsDiagnostics(),
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
            getNavigateToItems: (searchValue, maxResultCount, fileName, excludeDtsFiles) => tryCall(fileName, () => ls.getNavigateToItems(searchValue, maxResultCount, fileName, excludeDtsFiles)),
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
            applyCodeActionCommand: ((action) => tryCall(undefined, () => ls.applyCodeActionCommand(action))),
            getEmitOutput: tryFilenameCall(ls.getEmitOutput),
            getProgram: () => ls.getProgram(),
            dispose: () => ls.dispose(),
            getApplicableRefactors: tryFilenameOneCall(ls.getApplicableRefactors),
            getEditsForRefactor: tryFilenameFourCall(ls.getEditsForRefactor)
        };
    }
    oldLS = typescriptOnly(oldLS);
    for (const k in oldLS) {
        proxy[k] = function () { return oldLS[k].apply(oldLS, arguments); };
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
        const result = {
            file,
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
            info.project.projectService.logger.info(`Failed to ${attempting}: ${e.toString()}`);
            info.project.projectService.logger.info(`Stack trace: ${e.stack}`);
            return null;
        }
    }
    const serviceHost = new TypeScriptServiceHost(info.languageServiceHost, info.languageService);
    const ls = createLanguageService(serviceHost);
    serviceHost.setSite(ls);
    projectHostMap.set(info.project, serviceHost);
    proxy.getCompletionsAtPosition = function (fileName, position, options) {
        let base = oldLS.getCompletionsAtPosition(fileName, position, options) || {
            isGlobalCompletion: false,
            isMemberCompletion: false,
            isNewIdentifierLocation: false,
            entries: []
        };
        tryOperation('get completions', () => {
            const results = ls.getCompletionsAt(fileName, position);
            if (results && results.length) {
                if (base === undefined) {
                    base = {
                        isGlobalCompletion: false,
                        isMemberCompletion: false,
                        isNewIdentifierLocation: false,
                        entries: []
                    };
                }
                for (const entry of results) {
                    base.entries.push(completionToEntry(entry));
                }
            }
        });
        return base;
    };
    proxy.getQuickInfoAtPosition = function (fileName, position) {
        let base = oldLS.getQuickInfoAtPosition(fileName, position);
        // TODO(vicb): the tags property has been removed in TS 2.2
        tryOperation('get quick info', () => {
            const ours = ls.getHoverAt(fileName, position);
            if (ours) {
                const displayParts = [];
                for (const part of ours.text) {
                    displayParts.push({ kind: part.language || 'angular', text: part.text });
                }
                const tags = base && base.tags;
                base = {
                    displayParts,
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
        let result = oldLS.getSemanticDiagnostics(fileName);
        const base = result || [];
        tryOperation('get diagnostics', () => {
            info.project.projectService.logger.info(`Computing Angular semantic diagnostics...`);
            const ours = ls.getDiagnostics(fileName);
            if (ours && ours.length) {
                const file = oldLS.getProgram().getSourceFile(fileName);
                base.push.apply(base, ours.map(d => diagnosticToDiagnostic(d, file)));
            }
        });
        return base;
    };
    proxy.getDefinitionAtPosition = function (fileName, position) {
        let base = oldLS.getDefinitionAtPosition(fileName, position);
        if (base && base.length) {
            return base;
        }
        return tryOperation('get definition', () => {
            const ours = ls.getDefinitionAt(fileName, position);
            if (ours && ours.length) {
                base = base || [];
                for (const loc of ours) {
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
const VERSION = new Version('5.2.5');

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
