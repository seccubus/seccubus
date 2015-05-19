import Annotations from 'anglue/annotations';
//import ScanFormComponent from '../scan-form/scan-form';

export class ScanEditComponent {
    static get annotation() {
        return Annotations.getComponent('scanEdit', ScanEditComponent);
    }

    static get injections() {
        return {
            'scanActions': 'ScanActions',
            'scanStore': 'ScanStore'
        };
    }

    static get components() {
        return [
            //ScanFormComponent
        ];
    }

    /**
     * When this component activates we refresh the data
     */
    activate() {}
}

export default ScanEditComponent;
