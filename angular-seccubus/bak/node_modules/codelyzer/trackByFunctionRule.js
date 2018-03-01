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
var basicTemplateAstVisitor_1 = require("./angular/templates/basicTemplateAstVisitor");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ngWalker_1.NgWalker(sourceFile, this.getOptions(), {
            templateVisitorCtrl: TrackByTemplateVisitor,
        }));
    };
    Rule.metadata = {
        ruleName: 'trackBy-function',
        type: 'functionality',
        description: 'Ensures a TrackBy function is used.',
        rationale: 'Using TrackBy is considired as a best pratice.',
        options: null,
        optionsDescription: 'Not configurable.',
        typescriptOnly: true
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ngForExpressionRe = new RegExp(/\*ngFor\s*=\s*(?:'|")(.+)(?:'|")/);
var trackByRe = new RegExp(/trackBy\s*:/);
var TrackByNgForTemplateVisitor = (function (_super) {
    __extends(TrackByNgForTemplateVisitor, _super);
    function TrackByNgForTemplateVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TrackByNgForTemplateVisitor.prototype.visitDirectiveProperty = function (prop, context) {
        if (prop.sourceSpan) {
            var directive = prop.sourceSpan.toString();
            if (directive.startsWith('*ngFor')) {
                var directiveMatch = directive.match(ngForExpressionRe);
                var expr = directiveMatch && directiveMatch[1];
                if (expr && !trackByRe.test(expr)) {
                    var span = prop.sourceSpan;
                    context.addFailure(context.createFailure(span.start.offset, span.end.offset - span.start.offset, TrackByNgForTemplateVisitor.Error));
                }
            }
        }
        _super.prototype.visitDirectiveProperty.call(this, prop, context);
    };
    TrackByNgForTemplateVisitor.Error = 'Missing trackBy function in ngFor directive';
    return TrackByNgForTemplateVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var TrackByTemplateVisitor = (function (_super) {
    __extends(TrackByTemplateVisitor, _super);
    function TrackByTemplateVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.visitors = [
            new TrackByNgForTemplateVisitor(_this.getSourceFile(), _this.getOptions(), _this.context, _this.templateStart)
        ];
        return _this;
    }
    TrackByTemplateVisitor.prototype.visitDirectiveProperty = function (prop, context) {
        var _this = this;
        this.visitors
            .map(function (v) { return v.visitDirectiveProperty(prop, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
        _super.prototype.visitDirectiveProperty.call(this, prop, context);
    };
    return TrackByTemplateVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
