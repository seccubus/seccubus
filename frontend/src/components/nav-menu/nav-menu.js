import Annotations from 'anglue/annotations';

var menuItems = [{
  icon: 'navigation:check',
  page: 'status',
  title: 'Status'
}, {
  icon: 'action:assignment',
  page: 'runs',
  title: 'Runs'
}, {
  icon: 'action:visibility',
  page: 'findings',
  title: 'Findings'
}, {
  icon: 'device:network_wifi',
  page: 'scans',
  title: 'Scans'
}, {
  icon: 'action:dashboard',
  page: 'workspaces',
  title: 'Workspaces'
}];

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

    get menuItems() {
      return menuItems;
    }

    isSelected(page) {
      return this.state.current.name.indexOf(`seccubus.${page}Page`) === 0;
    }
}

export default NavMenu;
