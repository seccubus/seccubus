import Annotations from 'anglue/annotations';

import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

import '../actions/app-actions';

export class WorkspaceStore {
    static get annotation() {
        return Annotations.getStore('workspace', WorkspaceStore);
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
            'WORKSPACE_LOAD_STARTED': 'onLoadStarted',
            'WORKSPACE_LOAD_COMPLETED': 'onLoadCompleted',
            'WORKSPACE_LOAD_FAILED': 'onLoadFailed'
        };
    }
}
export default WorkspaceStore;
