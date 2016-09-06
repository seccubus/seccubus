import {materialServices} from '../services';

import '../transition/transition';

materialServices.factory('materialDrawerService', [
    'materialTransitionService',
    function (TransitionService) {
        return new TransitionService('drawers');
    }
]);
