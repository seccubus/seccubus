import {Component} from 'app/annotations/component';

@Component({
    name: 'ScansPage',
    componentServices: [
        '$scope'
    ]
})
export class ScansPage {
    constructor($scope) {
        this.scope = $scope;
    }
}

export var ScansPageModule = Component.getAngularModule(ScansPage);
