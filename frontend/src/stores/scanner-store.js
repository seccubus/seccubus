import Annotations from 'anglue/annotations';
import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

export class ScannerStore {
    static get annotation() {
        return Annotations.getStore('scanner', ScannerStore);
    }

    static get decorators() {
        return [
            CrudStoreDecorator
        ];
    }

    static get injections() {
        return {
            'appActions': 'AppActions'
        };
    }

    static get handlers() {
      return {
        'SCANNER_LOAD_STARTED': 'onLoadStarted',
        'SCANNER_LOAD_COMPLETED': 'onLoadCompleted',
        'SCANNER_LOAD_FAILED': 'onLoadFailed'
      };
    }
}
export default ScannerStore;
