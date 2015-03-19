import Annotations from 'anglue/annotations';

/* MARKER: insert resource imports here */

export class StatusActions {
    static get annotation() {
        return Annotations.getActions('statusActions', StatusActions );
    }

    static get injections() {
        return {
            /* MARKER: insert resource here */
        };
    }

    static get serviceActions() {
        return {
            /* MARKER: insert service actions here */
        };
    }
}

export default StatusActions;