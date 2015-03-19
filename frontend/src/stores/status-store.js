import Annotations from 'anglue/annotations';

import '../actions/app-actions';

export class StatusStore {
    static get annotation() {
        return Annotations.getStore('statusStore', StatusStore);
    }

    static get decorators() {
        return [

        ];
    }

    static get injections() {
        return {
            'appActions': 'AppActions'
        };
    }

    static get handlers() {
        return {

        };
    }
}
export default StatusStore;
