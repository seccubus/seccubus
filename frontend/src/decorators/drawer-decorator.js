import DecoratorUtils from 'anglue-decorators/utils';

export class DrawerDecorator {
  static decorateClass(cls) {
    DecoratorUtils.addInjections(cls, {
      'sidenavService': '$mdSidenav',
      'stateService': '$state',
      'scope': '$scope',
      'timeout': '$timeout'
    });
  }

  static decorate(instance) {
    var decorator = new DrawerDecorator(instance);

    DecoratorUtils.intercept(instance, decorator, 'activate');
    DecoratorUtils.sequence(instance, decorator, 'closeDrawer');
  }

  constructor(instance) {
    this.instance = instance;
    this.drawerOpened = false;
  }

  activate() {
    // TODO: ugh this is all a very ugh hack
    var instance = this.instance;
    instance.timeout(() => {
      var drawer = instance.sidenavService(this.drawerId);
      drawer.then(() => {
        instance.drawer = drawer;
        drawer.open().then(() => {
          instance.scope.$watch(() => {
            return drawer.isOpen();
          }, (open) => {
            if (!open) {
              instance.timeout(() => {
                  instance.stateService.go('^');
              }, 300);
            }
          });
        });
      });
    }, 60);
  }

  closeDrawer() {
     return this.instance.drawer.close();
  }

  get drawerId() {
    var dashedName = this.instance._annotation.name
            .replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `drawer-${dashedName}`;
  }
}

export default DrawerDecorator;
