import Annotations from 'anglue/annotations';

import FilterableStoreDecorator from 'anglue-decorators/store/filterable-store';
import SortableStoreDecorator from 'anglue-decorators/store/sortable-store';
import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

import '../actions/app-actions';

export class RunStore {
    static get annotation() {
        return Annotations.getStore('run', RunStore);
    }

    static get decorators() {
        return [
            CrudStoreDecorator,
            SortableStoreDecorator,
            FilterableStoreDecorator
        ];
    }

    static get injections() {
        return {
            'appActions': 'AppActions'
        };
    }

    static get handlers() {
        return {

        };
    }
}
export default RunStore;
