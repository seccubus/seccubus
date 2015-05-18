import Annotations from 'anglue/annotations';

export class RunsPageComponent {
    static get annotation() {
        return Annotations.getComponent('runsPageComponent', RunsPageComponent );
    }

    static get injections() {
        return {
          'runStore': 'RunStore',
          'scanStore': 'ScanStore'
        };
    }

    /**
     * When this component activates we refresh the data
     */
    activate() {}

    get scans() {
      return this.scanStore.items;
    }
}

export default RunsPageComponent;
