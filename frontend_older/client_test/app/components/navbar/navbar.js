import {Component} from 'app/annotations/component';
import {RoutesConfig} from 'app/config/routes.config';

import 'material/components/sidenav/sidenav';

@Component({
    name: 'Navbar',
    componentServices: [
        '$location',
        'router'
    ]
})
export class Navbar {
    constructor($location, router) {
        this.routes = RoutesConfig;
        this.router = router;
        this.location = $location;
    }

    get currentUrl () {
        return this.location.url();
    }

    get currentRoute () {
        var routeContext = this.router.parent.recognizer.recognize(this.currentUrl)[0];

        if (routeContext) {
            return this.routes.filter((route) => {
                return route.component === routeContext.handler.component;
            })[0];
        }
    }
}

export var NavbarModule = Component.getAngularModule(Navbar);
