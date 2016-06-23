import Annotations from 'anglue/annotations';

import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

import '../actions/app-actions';

export class StatusStore {
    static get annotation() {
        return Annotations.getStore('status', StatusStore);
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
            'UPTODATE_LOAD_STARTED': 'onLoadStarted',
            'UPTODATE_LOAD_COMPLETED': 'onUpToDateLoadCompleted',
            'UPTODATE_LOAD_FAILED': 'onLoadFailed',

            'CONFIGTEST_LOAD_STARTED': 'onLoadStarted',
            'CONFIGTEST_LOAD_COMPLETED': 'onLoadCompleted',
            'CONFIGTEST_LOAD_FAILED': 'onLoadFailed'
        };
    }

    onUpToDateLoadCompleted(response) {
        this.upToDate = response[0];
    }
}
export default StatusStore;
