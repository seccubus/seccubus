import Annotations from 'anglue/annotations';

import SortableComponent from 'anglue-decorators/component/sortable-component';

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

    static get decorators() {
        return [
            SortableComponent
        ];
    }

    /**
     * When this component activates we refresh the data
     */
    activate() {}

    /**
     * This is a template method that you can implement in your Component
     * in combination with the SortableComponent decorator
     * @private
     */
    _dispatchSort(sortInfo) {}
}

export default WorkspacesPageComponent;
