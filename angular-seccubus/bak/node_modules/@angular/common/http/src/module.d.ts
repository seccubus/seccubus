/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, ModuleWithProviders } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpBackend, HttpHandler } from './backend';
import { HttpInterceptor } from './interceptor';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
/**
 * An `HttpHandler` that applies a bunch of `HttpInterceptor`s
 * to a request before passing it to the given `HttpBackend`.
 *
 * The interceptors are loaded lazily from the injector, to allow
 * interceptors to themselves inject classes depending indirectly
 * on `HttpInterceptingHandler` itself.
 */
export declare class HttpInterceptingHandler implements HttpHandler {
    private backend;
    private injector;
    private chain;
    constructor(backend: HttpBackend, injector: Injector);
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
/**
 * Constructs an `HttpHandler` that applies a bunch of `HttpInterceptor`s
 * to a request before passing it to the given `HttpBackend`.
 *
 * Meant to be used as a factory function within `HttpClientModule`.
 *
 * @stable
 */
export declare function interceptingHandler(backend: HttpBackend, interceptors?: HttpInterceptor[] | null): HttpHandler;
/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 * @stable
 */
export declare function jsonpCallbackContext(): Object;
/**
 * `NgModule` which adds XSRF protection support to outgoing requests.
 *
 * Provided the server supports a cookie-based XSRF protection system, this
 * module can be used directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no such names are provided, the default is to use `X-XSRF-TOKEN` for
 * the header name and `XSRF-TOKEN` for the cookie name.
 *
 * @stable
 */
export declare class HttpClientXsrfModule {
    /**
     * Disable the default XSRF protection.
     */
    static disable(): ModuleWithProviders;
    /**
     * Configure XSRF protection to use the given cookie name or header name,
     * or the default names (as described above) if not provided.
     */
    static withOptions(options?: {
        cookieName?: string;
        headerName?: string;
    }): ModuleWithProviders;
}
/**
 * `NgModule` which provides the `HttpClient` and associated services.
 *
 * Interceptors can be added to the chain behind `HttpClient` by binding them
 * to the multiprovider for `HTTP_INTERCEPTORS`.
 *
 * @stable
 */
export declare class HttpClientModule {
}
/**
 * `NgModule` which enables JSONP support in `HttpClient`.
 *
 * Without this module, Jsonp requests will reach the backend
 * with method JSONP, where they'll be rejected.
 *
 * @stable
 */
export declare class HttpClientJsonpModule {
}
