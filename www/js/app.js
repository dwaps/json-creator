/**
* Auteur :  DWAPS Formation - Michael Cornillon
* Mail :    contact@dwaps.fr
* Tel :     0651279211
* Site :    http://dwaps.fr
* Date :    12/03/2017
**/

angular
    .module('app', [
                    'ionic',
                    'controllers',
                    'filters',
                    'dwapsLog',
                    'dwapsToast'
                    ])

    .constant( "CACHE_ACTIVED", false )

    .config( configure )
    .run( runner )
;


// FONCTIONS

function configure($stateProvider, $urlRouterProvider, CACHE_ACTIVED)
{
    $stateProvider
        .state('home', {
            cache:          CACHE_ACTIVED,
            url:            '/',
            controller:     'homeCtrl',
            templateUrl:    'templates/home.html'
        })
    ;

    $urlRouterProvider.otherwise('/');
}

function runner($ionicPlatform, $rootScope)
{
    $ionicPlatform.ready(function()
    {
        if(window.cordova && window.cordova.plugins.Keyboard)
        {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if(window.StatusBar)
        {
            StatusBar.styleDefault();
        }

        $rootScope.json = null;
    });
}