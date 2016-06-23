import Annotations from 'anglue/annotations';

import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

import '../actions/app-actions';

export class RunStore {
    static get annotation() {
        return Annotations.getStore('run', RunStore);
    }

    static get decorators() {
        return [
            CrudStoreDecorator
        ];
    }

    static get injections() {
        return {
            'appActions': 'AppActions'
        };
    }

    static get handlers() {
      return {
        'RUN_LOAD_STARTED': 'onLoadStarted',
        'RUN_LOAD_COMPLETED': 'onLoadCompleted',
        'RUN_LOAD_FAILED': 'onLoadFailed'
      };
    }
}
export default RunStore;
