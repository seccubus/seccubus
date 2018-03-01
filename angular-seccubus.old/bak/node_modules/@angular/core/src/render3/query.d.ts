import { QueryList as viewEngine_QueryList } from '../linker/query_list';
import { Type } from '../type';
import { LContainer, LNode, LView, QueryReadType, QueryState } from './interfaces';
/**
 * A predicate which determines if a given element/directive should be included in the query
 */
export interface QueryPredicate<T> {
    /**
     * Next predicate
     */
    next: QueryPredicate<any> | null;
    /**
     * Destination to which the value should be added.
     */
    list: QueryList<T>;
    /**
     * If looking for directives than it contains the directive type.
     */
    type: Type<T> | null;
    /**
     * If selector then contains local names to query for.
     */
    selector: string[] | null;
    /**
     * Indicates which token should be read from DI for this query.
     */
    read: QueryReadType | null;
    /**
     * Values which have been located.
     *
     * this is what builds up the `QueryList._valuesTree`.
     */
    values: any[];
}
export declare class QueryState_ implements QueryState {
    shallow: QueryPredicate<any> | null;
    deep: QueryPredicate<any> | null;
    constructor(deep?: QueryPredicate<any>);
    track<T>(queryList: viewEngine_QueryList<T>, predicate: Type<T> | string[], descend?: boolean, read?: QueryReadType): void;
    child(): QueryState | null;
    addNode(node: LNode): void;
    insertView(container: LContainer, view: LView, index: number): void;
    removeView(container: LContainer, view: LView, index: number): void;
}
export declare type QueryList<T> = viewEngine_QueryList<T>;
export declare const QueryList: typeof viewEngine_QueryList;
export declare function queryRefresh(query: QueryList<any>): boolean;
