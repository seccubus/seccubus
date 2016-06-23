import Annotations from 'anglue/annotations';

import '../resources/run-resource';
/* MARKER: insert resource imports here */

export class RunActions {
    static get annotation() {
        return Annotations.getActions('run', RunActions);
    }

    static get injections() {
      return {
        'runResource': 'RunResource',
      };
    }

    static get serviceActions() {
      return {
        'RUN_LOAD': 'loadRuns',
      };
    }

    loadRuns(workspaceId, scanId) {
      return this.runResource.query({
        workspaceId: workspaceId,
        scanId: scanId,
      }).$promise;
    }
}

export default RunActions;
