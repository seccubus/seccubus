import Annotations from 'anglue/annotations';
import MdDrawerDecorator from '../../../decorators/drawer-decorator';
import WorkspaceFormComponent from '../workspace-form/workspace-form';

export class WorkspaceCreateComponent {
    static get annotation() {
        return Annotations.getComponent('workspaceCreate', WorkspaceCreateComponent);
    }

    static get decorators() {
        return [
            MdDrawerDecorator
        ];
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

export default WorkspaceCreateComponent;
