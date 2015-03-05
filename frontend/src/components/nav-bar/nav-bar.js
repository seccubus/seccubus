import Annotations from 'anglue/src/annotations';

export class NavBar {
    static get annotation() {
        return Annotations.getComponent('navBar', NavBar);
    }

    static get injections() {
        return {
            'sideNav': '$mdSidenav',
            'state': '$state'
        };
    }

    static get template() {
        return {
            url: '/seccubus/v2/src/components/nav-bar/nav-bar.html'
        };
    }

    openNavMenu() {
        this.sideNav('nav-menu').open();
    }

    get currentPage() {
        return this.state.current.title;
    }
}

export default NavBar;
