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
            'WORKSPACE_LOAD_FAILED': 'onLoadFailed',

            'WORKSPACE_GET_STARTED': 'onGetStarted',
            'WORKSPACE_GET_COMPLETED': 'onGetCompleted',
            'WORKSPACE_GET_FAILED': 'onGetFailed',

            'WORKSPACE_CREATE_STARTED': 'onCreateStarted',
            'WORKSPACE_CREATE_COMPLETED': 'onCreateCompleted',
            'WORKSPACE_CREATE_FAILED': 'onCreateFailed',

            'WORKSPACE_UPDATE_STARTED': 'onUpdateStarted',
            'WORKSPACE_UPDATE_COMPLETED': 'onUpdateCompleted',
            'WORKSPACE_UPDATE_FAILED': 'onUpdateFailed',

            'WORKSPACE_DELETE_STARTED': 'onDeleteStarted',
            'WORKSPACE_DELETE_COMPLETED': 'onDeleteCompleted',
            'WORKSPACE_DELETE_FAILED': 'onDeleteFailed'
        };
    }
}
export default WorkspaceStore;
