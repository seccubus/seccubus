"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = {
    None: 0,
    Error: 1,
    Info: 3,
    Debug: 7
};
var BUILD_TYPE = 'prod';
exports.Config = {
    interpolation: ['{{', '}}'],
    resolveUrl: function (url, d) {
        return url;
    },
    transformTemplate: function (code, url, d) {
        if (!url || url.endsWith('.html')) {
            return { code: code, url: url };
        }
        return { code: '', url: url };
    },
    transformStyle: function (code, url, d) {
        if (!url || url.endsWith('.css')) {
            return { code: code, url: url };
        }
        return { code: '', url: url };
    },
    predefinedDirectives: [
        { selector: 'form:not([ngNoForm]):not([formGroup]), ngForm, [ngForm]', exportAs: 'ngForm' },
        { selector: '[routerLinkActive]', exportAs: 'routerLinkActive' },
        { selector: '[ngModel]:not([formControlName]):not([formControl])', exportAs: 'ngModel' },
        { selector: '[ngIf]', exportAs: 'ngIf', inputs: ['ngIf'] },
        { selector: '[ngFor][ngForOf]', exportAs: 'ngFor', inputs: ['ngForTemplate', 'ngForOf'] },
        { selector: '[ngSwitch]', exportAs: 'ngSwitch', inputs: ['ngSwitch'] },
        { selector: 'mat-autocomplete', exportAs: 'matAutocomplete' },
        { selector: '[mat-menu-item]', exportAs: 'matMenuItem' },
        { selector: 'mat-menu', exportAs: 'matMenu' },
        { selector: 'mat-button-toggle-group:not([multiple])', exportAs: 'matButtonToggleGroup' },
        { selector: '[mat-menu-trigger-for], [matMenuTriggerFor]', exportAs: 'matMenuTrigger' },
        { selector: '[mat-tooltip], [matTooltip]', exportAs: 'matTooltip' },
        { selector: 'mat-select', exportAs: 'matSelect' },
        { selector: '[md-menu-item]', exportAs: 'mdMenuItem' },
        { selector: 'md-menu', exportAs: 'mdMenu' },
        { selector: 'md-button-toggle-group:not([multiple])', exportAs: 'mdButtonToggleGroup' },
        { selector: '[md-menu-trigger-for], [mdMenuTriggerFor]', exportAs: 'mdMenuTrigger' },
        { selector: '[md-tooltip], [mdTooltip]', exportAs: 'mdTooltip' },
        { selector: 'md-select', exportAs: 'mdSelect' }
    ],
    logLevel: BUILD_TYPE === 'dev' ? exports.LogLevel.Debug : exports.LogLevel.None
};
try {
    var root = require('app-root-path');
    var newConfig = require(root.path + '/.codelyzer');
    Object.assign(exports.Config, newConfig);
}
catch (e) { }
