import Annotations from 'anglue/annotations';

import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

import '../actions/app-actions';

export class WorkspaceStore {
    static get annotation() {
        return Annotations.getStore('workspaceStore', WorkspaceStore);
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

        };
    }
}
export default WorkspaceStore;
