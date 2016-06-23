import Annotations from 'anglue/annotations';

import '../resources/workspace-resource';
/* MARKER: insert resource imports here */

export class WorkspaceActions {
    static get annotation() {
        return Annotations.getActions('workspace', WorkspaceActions);
    }

    static get injections() {
        return {
            'workspaceResource': 'WorkspaceResource'
                /* MARKER: insert resource here */
        };
    }

    static get serviceActions() {
        return {
            'WORKSPACE_LOAD': 'loadWorkspaces',
            'WORKSPACE_GET': 'getWorkspace',
            'WORKSPACE_CREATE': 'createWorkspace',
            'WORKSPACE_UPDATE': 'updateWorkspace',
            'WORKSPACE_DELETE': 'deleteWorkspace'
                /* MARKER: insert service actions here */
        };
    }

    loadWorkspaces() {
        return this.workspaceResource.query().$promise;
    }

    createWorkspace(workspace) {
        return workspace.$create();
    }

    updateWorkspace(workspace) {
        return workspace.$update();
    }
}

export default WorkspaceActions;
