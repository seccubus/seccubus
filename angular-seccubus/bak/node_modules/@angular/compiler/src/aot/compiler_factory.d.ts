import { UrlResolver } from '../url_resolver';
import { AotCompiler } from './compiler';
import { AotCompilerHost } from './compiler_host';
import { AotCompilerOptions } from './compiler_options';
import { StaticReflector } from './static_reflector';
export declare function createAotUrlResolver(host: {
    resourceNameToFileName(resourceName: string, containingFileName: string): string | null;
}): UrlResolver;
/**
 * Creates a new AotCompiler based on options and a host.
 */
export declare function createAotCompiler(compilerHost: AotCompilerHost, options: AotCompilerOptions, errorCollector?: (error: any, type?: any) => void): {
    compiler: AotCompiler;
    reflector: StaticReflector;
};
