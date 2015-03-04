import {Component} from 'app/annotations/component';

@Component({
    name: 'StatusPage',
    componentServices: [
        '$scope'
    ]
})
export class StatusPage {
    constructor($scope) {
        this.scope = $scope;
    }
}

export var StatusPageModule = Component.getAngularModule(StatusPage);
