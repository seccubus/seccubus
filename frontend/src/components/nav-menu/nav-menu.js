import Annotations from 'anglue/annotations';

export class NavMenu {
    static get annotation() {
        return Annotations.getComponent('navMenu', NavMenu);
    }

    static get injections() {
        return {
            'state': '$state'
        };
    }

    static get template() {
        return {
            url: '/seccubus/v2/src/components/nav-menu/nav-menu.html'
        };
    }

    activate() {}
}

export default NavMenu;
