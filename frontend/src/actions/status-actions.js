import Annotations from 'anglue/annotations';

import '../resources/uptodate-resource';
import '../resources/configtest-resource';

export class StatusActions {
    static get annotation() {
        return Annotations.getActions('status', StatusActions);
    }

    static get injections() {
        return {
            'upToDateResource': 'UpToDateResource',
            'configTestResource': 'ConfigTestResource'
        };
    }

    static get serviceActions() {
        return {
            'UPTODATE_LOAD': 'loadUpToDate',
            'CONFIGTEST_LOAD': 'loadConfigTest'
        };
    }

    loadUpToDate() {
        return this.upToDateResource.query().$promise;
    }

    loadConfigTest() {
        return this.configTestResource.query().$promise;
    }
}

export default StatusActions;
