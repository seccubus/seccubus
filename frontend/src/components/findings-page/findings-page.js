import Annotations from 'anglue/annotations';

export class FindingsPageComponent {
    static get annotation() {
        return Annotations.getComponent('findingsPage', FindingsPageComponent);
    }

    static get injections() {
        return {};
    }

    activate() {}
}

export default FindingsPageComponent;
