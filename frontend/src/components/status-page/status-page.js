import Annotations from 'anglue/src/annotations';

export class StatusPage {
    static get annotation() {
        return Annotations.getComponent('statusPage', StatusPage);
    }

    static get injections() {
        return {};
    }

    activate() {

    }
}

export default StatusPage;
