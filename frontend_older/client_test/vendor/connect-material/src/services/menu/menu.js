import {materialServices} from '../services';

materialServices.factory('materialMenuService', [
    'materialTransitionService',
    function (TransitionService) {
        return new TransitionService('menus', {forceSingle: true});
    }
]);
