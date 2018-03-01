/**
 * Creates unique names for placeholder with different content.
 *
 * Returns the same placeholder name when the content is identical.
 */
export declare class PlaceholderRegistry {
    private _placeHolderNameCounts;
    private _signatureToName;
    getStartTagPlaceholderName(tag: string, attrs: {
        [k: string]: string;
    }, isVoid: boolean): string;
    getCloseTagPlaceholderName(tag: string): string;
    getPlaceholderName(name: string, content: string): string;
    getUniquePlaceholder(name: string): string;
    private _hashTag(tag, attrs, isVoid);
    private _hashClosingTag(tag);
    private _generateUniqueName(base);
}
