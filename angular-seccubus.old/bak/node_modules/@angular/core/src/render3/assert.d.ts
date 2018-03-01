export declare function assertNumber(actual: any, name: string): void;
export declare function assertEqual<T>(actual: T, expected: T, name: string, serializer?: ((v: T) => string)): void;
export declare function assertLessThan<T>(actual: T, expected: T, name: string): void;
export declare function assertNotNull<T>(actual: T, name: string): void;
export declare function assertNotEqual<T>(actual: T, expected: T, name: string): void;
/**
 * Throws an error with a message constructed from the arguments.
 *
 * @param actual The actual value (e.g. 3)
 * @param expected The expected value (e.g. 5)
 * @param name The name of the value being checked (e.g. attrs.length)
 * @param operator The comparison operator (e.g. <, >, ==)
 * @param serializer Function that maps a value to its display value
 */
export declare function assertThrow<T>(actual: T, expected: T, name: string, operator: string, serializer?: ((v: T) => string)): never;
