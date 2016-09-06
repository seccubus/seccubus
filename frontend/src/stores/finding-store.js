import Annotations from 'anglue/annotations';

import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

import '../actions/app-actions';

export class FindingStore {
    static get annotation() {
        return Annotations.getStore('finding', FindingStore);
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
        'FINDING_LOAD_STARTED': 'onLoadStarted',
        'FINDING_LOAD_COMPLETED': 'onLoadCompleted',
        'FINDING_LOAD_FAILED': 'onLoadFailed'
      };
    }
}
export default FindingStore;
