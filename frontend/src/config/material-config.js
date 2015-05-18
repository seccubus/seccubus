export default function(appModule) {
  appModule.config(['$mdIconProvider', function($mdIconProvider) {
    $mdIconProvider
      .iconSet('action', `icons/action-icons.svg`)
      .iconSet('alert', `icons/alert-icons.svg`)
      .iconSet('content', `icons/content-icons.svg`)
      .iconSet('navigation', `icons/navigation-icons.svg`);
  }]);

  appModule.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue', {
        'default': '700',
        'hue-1': '500',
        'hue-2': '500',
        'hue-3': '500'
      })
      .accentPalette('blue-grey', {
        'default': '100',
        'hue-1': '500',
        'hue-2': '500',
        'hue-3': '500'
      });
  }]);
}
