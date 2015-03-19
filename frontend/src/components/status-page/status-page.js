import Annotations from 'anglue/annotations';

export class StatusPageComponent {
    static get annotation() {
        return Annotations.getComponent('statusPageComponent', StatusPageComponent);
    }

    static get injections() {
        return {};
    }

    static get decorators() {
        return [

        ];
    }

    /**
     * When this component activates we refresh the data
     */
    activate() {}

}

export default StatusPageComponent;
