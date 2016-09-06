import Annotations from 'anglue/annotations';

export class StatusPageComponent {
    static get annotation() {
        return Annotations.getComponent('statusPage', StatusPageComponent);
    }

    static get injections() {
        return {
            'statusActions': 'StatusActions',
            'statusStore': 'StatusStore'
        };
    }

    /**
     * When this component activates we refresh the data
     */
    activate() {
        this.statusActions.loadUpToDate();
        this.statusActions.loadConfigTest();
    }
}

export default StatusPageComponent;
