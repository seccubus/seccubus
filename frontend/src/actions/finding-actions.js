import angular from 'angular';
import Annotations from 'anglue/annotations';

import '../resources/finding-resource';
/* MARKER: insert resource imports here */

export class FindingActions {
    static get annotation() {
        return Annotations.getActions('finding', FindingActions);
    }

    static get injections() {
      return {
        'findingResource': 'FindingResource',
      };
    }

    static get serviceActions() {
      return {
        'FINDING_LOAD': 'loadFindings',
      };
    }

    loadFindings(workspaceId, scanId) {
      return this.findingResource.query({
        workspaceId: workspaceId,
        'scanIds[]': angular.isArray(scanId)  ? scanId : [scanId]
      }).$promise;
    }
}

export default FindingActions;
