import Annotations from 'anglue/annotations';

/* MARKER: insert resource imports here */

export class RunActions {
    static get annotation() {
        return Annotations.getActions('run', RunActions);
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

export default RunActions;
