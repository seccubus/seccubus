export interface Position {
    fileName: string;
    line: number;
    column: number;
}
export interface FormattedMessageChain {
    message: string;
    position?: Position;
    next?: FormattedMessageChain;
}
export declare type FormattedError = Error & {
    chain: FormattedMessageChain;
    position?: Position;
};
export declare function formattedError(chain: FormattedMessageChain): FormattedError;
export declare function isFormattedError(error: Error): error is FormattedError;
