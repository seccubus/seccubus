import Annotations from 'anglue/annotations';
import WorkspaceFormComponent from '../workspace-form/workspace-form';

export class WorkspaceEditComponent {
    static get annotation() {
        return Annotations.getComponent('workspaceEdit', WorkspaceEditComponent);
    }

    static get injections() {
        return {
            'workspaceActions': 'WorkspaceActions',
            'workspaceStore': 'WorkspaceStore'
        };
    }

    static get components() {
        return [
            WorkspaceFormComponent
        ];
    }
    
    /**
     * When this component activates we refresh the data
     */
    activate() {}
}

export default WorkspaceEditComponent;
