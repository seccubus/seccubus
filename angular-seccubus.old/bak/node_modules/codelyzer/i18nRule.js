"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var ngWalker_1 = require("./angular/ngWalker");
var ast = require("@angular/compiler");
var basicTemplateAstVisitor_1 = require("./angular/templates/basicTemplateAstVisitor");
var I18NAttrVisitor = (function (_super) {
    __extends(I18NAttrVisitor, _super);
    function I18NAttrVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    I18NAttrVisitor.prototype.visitAttr = function (attr, context) {
        if (attr.name === 'i18n') {
            var parts = (attr.value || '').split('@@');
            if (parts.length <= 1 || parts[1].length === 0) {
                var span = attr.sourceSpan;
                context.addFailure(context.createFailure(span.start.offset, span.end.offset - span.start.offset, 'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'));
            }
        }
        _super.prototype.visitAttr.call(this, attr, context);
    };
    I18NAttrVisitor.prototype.getOption = function () {
        return 'check-id';
    };
    return I18NAttrVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var I18NTextVisitor = (function (_super) {
    __extends(I18NTextVisitor, _super);
    function I18NTextVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hasI18n = false;
        _this.nestedElements = [];
        _this.visited = new Set();
        return _this;
    }
    I18NTextVisitor.prototype.visitText = function (text, context) {
        if (!this.visited.has(text)) {
            this.visited.add(text);
            var textNonEmpty = text.value.trim().length > 0;
            if ((!this.hasI18n && textNonEmpty && this.nestedElements.length) ||
                (textNonEmpty && !this.nestedElements.length)) {
                var span = text.sourceSpan;
                context.addFailure(context.createFailure(span.start.offset, span.end.offset - span.start.offset, I18NTextVisitor.Error));
            }
        }
        _super.prototype.visitText.call(this, text, context);
    };
    I18NTextVisitor.prototype.visitBoundText = function (text, context) {
        if (!this.visited.has(text)) {
            this.visited.add(text);
            var val = text.value;
            if (val instanceof ast.ASTWithSource && val.ast instanceof ast.Interpolation && !this.hasI18n) {
                var textNonEmpty = val.ast.strings.some(function (s) { return /\w+/.test(s); });
                if (textNonEmpty) {
                    var span = text.sourceSpan;
                    context.addFailure(context.createFailure(span.start.offset, span.end.offset - span.start.offset, I18NTextVisitor.Error));
                }
            }
        }
    };
    I18NTextVisitor.prototype.visitElement = function (element, context) {
        this.hasI18n = element.attrs.some(function (e) { return e.name === 'i18n'; });
        this.nestedElements.push(element.name);
        _super.prototype.visitElement.call(this, element, context);
        this.nestedElements.pop();
        this.hasI18n = false;
    };
    I18NTextVisitor.prototype.getOption = function () {
        return 'check-text';
    };
    I18NTextVisitor.Error = 'Each element containing text node should have an i18n attribute';
    return I18NTextVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var I18NTemplateVisitor = (function (_super) {
    __extends(I18NTemplateVisitor, _super);
    function I18NTemplateVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.visitors = [
            new I18NAttrVisitor(_this.getSourceFile(), _this.getOptions(), _this.context, _this.templateStart),
            new I18NTextVisitor(_this.getSourceFile(), _this.getOptions(), _this.context, _this.templateStart)
        ];
        return _this;
    }
    I18NTemplateVisitor.prototype.visit = function (a, context) {
        _super.prototype.visit.call(this, a, context);
    };
    I18NTemplateVisitor.prototype.visitAttr = function (attr, context) {
        var _this = this;
        var options = this.getOptions();
        this.visitors
            .filter(function (v) { return options.indexOf(v.getOption()) >= 0; })
            .map(function (v) { return v.visitAttr(attr, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
        _super.prototype.visitAttr.call(this, attr, context);
    };
    I18NTemplateVisitor.prototype.visitElement = function (element, context) {
        var _this = this;
        var options = this.getOptions();
        this.visitors
            .filter(function (v) { return options.indexOf(v.getOption()) >= 0; })
            .map(function (v) { return v.visitElement(element, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
        _super.prototype.visitElement.call(this, element, context);
    };
    I18NTemplateVisitor.prototype.visitText = function (text, context) {
        var _this = this;
        var options = this.getOptions();
        this.visitors
            .filter(function (v) { return options.indexOf(v.getOption()) >= 0; })
            .map(function (v) { return v.visitText(text, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
        _super.prototype.visitText.call(this, text, context);
    };
    I18NTemplateVisitor.prototype.visitBoundText = function (text, context) {
        var _this = this;
        var options = this.getOptions();
        this.visitors
            .filter(function (v) { return options.indexOf(v.getOption()) >= 0; })
            .map(function (v) { return v.visitBoundText(text, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
        _super.prototype.visitBoundText.call(this, text, context);
    };
    return I18NTemplateVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ngWalker_1.NgWalker(sourceFile, this.getOptions(), {
            templateVisitorCtrl: I18NTemplateVisitor
        }));
    };
    Rule.metadata = {
        ruleName: 'i18n',
        type: 'maintainability',
        description: 'Ensures following best practices for i18n.',
        rationale: 'Makes the code more maintainable in i18n sense.',
        optionsDescription: (_a = ["\n      Arguments may be optionally provided:\n      * `\"check-id\"` Makes sure i18n attributes have ID specified\n      * `\"check-text\"` Makes sure there are no elements with text content but no i18n attribute\n    "], _a.raw = ["\n      Arguments may be optionally provided:\n      * \\`\"check-id\"\\` Makes sure i18n attributes have ID specified\n      * \\`\"check-text\"\\` Makes sure there are no elements with text content but no i18n attribute\n    "], Lint.Utils.dedent(_a)),
        options: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['check-id', 'check-text']
            },
            minLength: 0,
            maxLength: 3
        },
        optionExamples: ['[true, "check-id"]'],
        typescriptOnly: true
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var _a;
