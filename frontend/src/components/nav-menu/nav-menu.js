import Annotations from 'anglue/src/annotations';

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

    get currentPage() {
        return this.state.current.title;
    }
}

export default NavMenu;
