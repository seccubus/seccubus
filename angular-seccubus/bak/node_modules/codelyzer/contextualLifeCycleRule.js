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
        ruleName: 'contextual-life-cycle',
        type: 'functionality',
        description: 'Ensure that classes use allowed life cycle method in its body',
        rationale: "Some life cycle methods can only be used in certain class types.\n    For example, ngOnInit() hook method should not be used in an @Injectable class.",
        options: null,
        optionsDescription: 'Not configurable.',
        typescriptOnly: true,
    };
    Rule.FAILURE_STRING = 'In the class "%s" which have the "%s" decorator, the ' +
        '"%s" hook method is not allowed. ' +
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
        _this.isComponent = false;
        _this.isDirective = false;
        _this.isPipe = false;
        return _this;
    }
    ClassMetadataWalker.prototype.visitNgInjectable = function (controller, decorator) {
        this.className = controller.name.text;
        this.isInjectable = true;
    };
    ClassMetadataWalker.prototype.visitNgComponent = function (metadata) {
        this.className = metadata.controller.name.text;
        this.isComponent = true;
    };
    ClassMetadataWalker.prototype.visitNgDirective = function (metadata) {
        this.className = metadata.controller.name.text;
        this.isDirective = true;
    };
    ClassMetadataWalker.prototype.visitNgPipe = function (controller, decorator) {
        this.className = controller.name.text;
        this.isPipe = true;
    };
    ClassMetadataWalker.prototype.visitMethodDeclaration = function (method) {
        var methodName = method.name.text;
        if (methodName === 'ngOnInit') {
            if (this.isInjectable) {
                var failureConfig = [this.className, '@Injectable', 'ngOnInit()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
            else if (this.isPipe) {
                var failureConfig = [this.className, '@Pipe', 'ngOnInit()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
        }
        if (methodName === 'ngOnChanges') {
            if (this.isInjectable) {
                var failureConfig = [this.className, '@Injectable', 'ngOnChanges()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
            else if (this.isPipe) {
                var failureConfig = [this.className, '@Pipe', 'ngOnChanges()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
        }
        if (methodName === 'ngDoCheck') {
            if (this.isInjectable) {
                var failureConfig = [this.className, '@Injectable', 'ngDoCheck()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
            else if (this.isPipe) {
                var failureConfig = [this.className, '@Pipe', 'ngDoCheck()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
        }
        if (methodName === 'ngAfterContentInit') {
            if (this.isInjectable) {
                var failureConfig = [this.className, '@Injectable', 'ngAfterContentInit()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
            else if (this.isPipe) {
                var failureConfig = [this.className, '@Pipe', 'ngAfterContentInit()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
        }
        if (methodName === 'ngAfterContentChecked') {
            if (this.isInjectable) {
                var failureConfig = [this.className, '@Injectable', 'ngAfterContentChecked()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
            else if (this.isPipe) {
                var failureConfig = [this.className, '@Pipe', 'ngAfterContentChecked()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
        }
        if (methodName === 'ngAfterViewInit') {
            if (this.isInjectable) {
                var failureConfig = [this.className, '@Injectable', 'ngAfterViewInit()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
            else if (this.isPipe) {
                var failureConfig = [this.className, '@Pipe', 'ngAfterViewInit()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
        }
        if (methodName === 'ngAfterViewChecked') {
            if (this.isInjectable) {
                var failureConfig = [this.className, '@Injectable', 'ngAfterViewChecked()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
            else if (this.isPipe) {
                var failureConfig = [this.className, '@Pipe', 'ngAfterViewChecked()'];
                failureConfig.unshift(Rule.FAILURE_STRING);
                this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
            }
        }
    };
    ClassMetadataWalker.prototype.generateFailure = function (start, width, failureConfig) {
        this.addFailure(this.createFailure(start, width, sprintf_js_1.sprintf.apply(this, failureConfig)));
    };
    return ClassMetadataWalker;
}(ngWalker_1.NgWalker));
exports.ClassMetadataWalker = ClassMetadataWalker;
