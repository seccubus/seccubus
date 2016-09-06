/**
 * Converts a camelCased name to a dashed name
 * Used by the componentLoaderProvider to help with template path mapping.
 * @param  {String} name The camelCased string
 * @return {String} The dashed string
 */
export function dashCase(str) {
    return str.replace(/([A-Z])/g, function ($1) {
        return '-' + $1.toLowerCase();
    });
}
