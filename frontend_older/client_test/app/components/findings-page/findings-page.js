import {Component} from 'app/annotations/component';

@Component({
    name: 'FindingsPage',
    componentServices: [
        '$scope'
    ]
})
export class FindingsPage {
    constructor($scope) {
        this.scope = $scope;
    }
}

export var FindingsPageModule = Component.getAngularModule(FindingsPage);
