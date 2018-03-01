import { LNode, LNodeFlags } from './interfaces';
export declare function assertNodeType(node: LNode, type: LNodeFlags): void;
export declare function assertNodeOfPossibleTypes(node: LNode, ...types: LNodeFlags[]): void;
