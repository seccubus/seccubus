import { PlatformRef, Provider, StaticProvider } from '@angular/core';
export * from './private_export';
export { VERSION } from './version';
export { JitCompilerFactory } from './compiler_factory';
/**
 * @experimental
 */
export declare const RESOURCE_CACHE_PROVIDER: Provider[];
/**
 * @stable
 */
export declare const platformBrowserDynamic: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;
