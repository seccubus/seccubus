import Annotations from 'anglue/annotations';

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

    toggleNavMenu() {
        this.sideNav('nav-menu').toggle();
    }

    get currentPage() {
        return this.state.current.title;
    }
}

export default NavBar;
