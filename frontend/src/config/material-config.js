export default function(appModule) {
    appModule.config(['$mdIconProvider', function($mdIconProvider) {
        $mdIconProvider
            .iconSet('navigation', `icons/navigation-icons.svg`);
    }]);

    appModule.config(['$mdThemingProvider', function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('indigo', {
                'default': '700'
            })
            .accentPalette('blue-grey', {
                'default': '100'
            });
    }]);
}
