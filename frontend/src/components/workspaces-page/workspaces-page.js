import Annotations from 'anglue/annotations';

import SortableComponent from 'anglue-decorators/component/sortable-component';

import WorkspaceCreateComponent from './workspace-create/workspace-create';
import WorkspaceEditComponent from './workspace-edit/workspace-edit';

export class WorkspacesPageComponent {
    static get annotation() {
        return Annotations.getComponent('workspacesPage', WorkspacesPageComponent);
    }

    static get injections() {
        return {
            'workspaceActions': 'WorkspaceActions',
            'workspaceStore': 'WorkspaceStore'
        };
    }

    static get components() {
        return [
            WorkspaceCreateComponent,
            WorkspaceEditComponent
        ];
    }

    static get decorators() {
        return [
            SortableComponent
        ];
    }

    /**
     * When this component activates we refresh the data
     */
    activate() {
        this.workspaceActions.loadWorkspaces();
    }

    /**
     * This is a template method that you can implement in your Component
     * in combination with the SortableComponent decorator
     * @private
     */
    _dispatchSort(sortInfo) {}
}

export default WorkspacesPageComponent;
