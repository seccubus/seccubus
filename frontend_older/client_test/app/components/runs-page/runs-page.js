import {Component} from 'app/annotations/component';

@Component({
    name: 'RunsPage',
    componentServices: [
        '$scope'
    ]
})
export class RunsPage {
    constructor($scope) {
        this.scope = $scope;
    }
}

export var RunsPageModule = Component.getAngularModule(RunsPage);
