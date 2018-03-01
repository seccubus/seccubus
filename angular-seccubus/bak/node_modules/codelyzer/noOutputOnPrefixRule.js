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
        return this.applyWithWalker(new OutputWalker(sourceFile, this.getOptions()));
    };
    Rule.metadata = {
        ruleName: 'no-output-on-prefix',
        type: 'maintainability',
        description: 'Name events without the prefix on',
        descriptionDetails: 'See more at https://angular.io/guide/styleguide#dont-prefix-output-properties',
        rationale: "Angular allows for an alternative syntax on-*. If the event itself was prefixed with on\n     this would result in an on-onEvent binding expression",
        options: null,
        optionsDescription: 'Not configurable.',
        typescriptOnly: true
    };
    Rule.FAILURE_STRING = 'In the class "%s", the output ' + 'property "%s" should not be prefixed with on';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var OutputWalker = (function (_super) {
    __extends(OutputWalker, _super);
    function OutputWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OutputWalker.prototype.visitNgOutput = function (property, output, args) {
        var className = property.parent.name.text;
        var memberName = property.name.text;
        if (memberName &&
            memberName.startsWith('on') &&
            !(memberName.length >= 3 && memberName[2] !== memberName[2].toUpperCase())) {
            var failureConfig = [Rule.FAILURE_STRING, className, memberName];
            var errorMessage = sprintf_js_1.sprintf.apply(null, failureConfig);
            this.addFailure(this.createFailure(property.getStart(), property.getWidth(), errorMessage));
        }
    };
    return OutputWalker;
}(ngWalker_1.NgWalker));
