import {Component} from 'app/annotations/component';

@Component({
    name: 'WorkspacesPage',
    componentServices: [
        '$scope'
    ]
})
export class WorkspacesPage {
    constructor($scope) {
        this.scope = $scope;
    }
}

export var WorkspacesPageModule = Component.getAngularModule(WorkspacesPage);
