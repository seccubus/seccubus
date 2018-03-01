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
var sprintf_js_1 = require("sprintf-js");
var ngWalker_1 = require("./angular/ngWalker");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this));
    };
    Rule.metadata = {
        ruleName: 'decorator-not-allowed',
        type: 'functionality',
        description: 'Ensure that classes use allowed decorator in its body',
        rationale: "Some decorators can only be used in certain class types.\n    For example, an @Input should not be used in an @Injectable class.",
        options: null,
        optionsDescription: 'Not configurable.',
        typescriptOnly: true,
    };
    Rule.INJECTABLE_FAILURE_STRING = 'In the class "%s" which have the "%s" decorator, the ' +
        '"%s" decorator is not allowed. ' +
        'Please, drop it.';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ClassMetadataWalker = (function (_super) {
    __extends(ClassMetadataWalker, _super);
    function ClassMetadataWalker(sourceFile, rule) {
        var _this = _super.call(this, sourceFile, rule.getOptions()) || this;
        _this.rule = rule;
        _this.isInjectable = false;
        return _this;
    }
    ClassMetadataWalker.prototype.visitNgInjectable = function (classDeclaration, decorator) {
        this.className = classDeclaration.name.text;
        this.isInjectable = true;
        _super.prototype.visitNgInjectable.call(this, classDeclaration, decorator);
    };
    ClassMetadataWalker.prototype.visitNgDirective = function (metadata) {
        this.isInjectable = false;
        _super.prototype.visitNgDirective.call(this, metadata);
    };
    ClassMetadataWalker.prototype.visitNgPipe = function (controller, decorator) {
        this.isInjectable = false;
        _super.prototype.visitNgPipe.call(this, controller, decorator);
    };
    ClassMetadataWalker.prototype.visitNgComponent = function (metadata) {
        this.isInjectable = false;
        _super.prototype.visitNgComponent.call(this, metadata);
    };
    ClassMetadataWalker.prototype.visitNgInput = function (property, input, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@Input'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.visitNgOutput = function (property, input, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@Output'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.visitNgHostBinding = function (property, decorator, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@HostBinding'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.visitNgHostListener = function (method, decorator, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@HostListener'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.visitNgContentChild = function (property, input, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@ContentChild'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.visitNgContentChildren = function (property, input, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@ContentChildren'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.visitNgViewChild = function (property, input, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@ViewChild'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.visitNgViewChildren = function (property, input, args) {
        if (this.isInjectable) {
            var failureConfig = [this.className, '@Injectable', '@ViewChildren'];
            failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
            this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
        }
    };
    ClassMetadataWalker.prototype.generateFailure = function (start, width, failureConfig) {
        this.addFailure(this.createFailure(start, width, sprintf_js_1.sprintf.apply(this, failureConfig)));
    };
    return ClassMetadataWalker;
}(ngWalker_1.NgWalker));
exports.ClassMetadataWalker = ClassMetadataWalker;
