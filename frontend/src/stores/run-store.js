import Annotations from 'anglue/annotations';

import FilterableStoreDecorator from 'connect-decorators/store/filterable-store';
import SortableStoreDecorator from 'connect-decorators/store/sortable-store';
import CrudStoreDecorator from 'connect-decorators/store/crud-store';

import '../actions/app-actions';

export class RunStore {
    static get annotation() {
        return Annotations.getStore('runStore', RunStore);
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
