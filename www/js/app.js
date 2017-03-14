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
                    'ngCordova',
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

function runner($ionicPlatform, $rootScope, $cordovaFile)
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

        $rootScope.createFile = function( fn, json ) {
            var
                DIR_NAME = "JSONCreator",
                FILE_NAME = fn + ".json",
                CONTENT = json
            ;

            $ionicPlatform
                .ready(
                    function()
                    {
                        $cordovaFile
                            .checkDir(
                                cordova.file.dataDirectory,
                                DIR_NAME
                            )
                            .then(
                                function (success)
                                {
                                },
                                function (error)
                                {
                                    console.log('DOSSIER NON trouvé');
                                }
                            );

                        // CREATION REPERTOIRE JSONCreator
                        $cordovaFile
                            .createDir(
                                cordova.file.dataDirectory,
                                DIR_NAME,
                                false)
                            .then(
                                function (success)
                                {
                                    console.log('DOSSIER CRéé');
                                },
                                function (error)
                                {
                                    console.log('DOSSIER NON CRéé');
                                }
                            );

                        // CREATION FICHIER .json
                        $cordovaFile.writeFile(
                            cordova.file.dataDirectory,
                            DIR_NAME + "/" + FILE_NAME,
                            CONTENT,
                            true)
                            .then(
                                function (success)
                                {
                                },
                                function (error)
                                {
                                    console.log('FICHIER NON CRéé');
                                }
                            );
                    }
                );
        };

        $rootScope.readFile = function( fn ) {
            var
                DIR_NAME = "JSONCreator",
                FILE_NAME = fn + ".json"
            ;

            $ionicPlatform.ready(function()
                {
                    // LECTURE FICHIER .json
                    $cordovaFile.readAsText(
                        cordova.file.dataDirectory,
                        DIR_NAME + "/" + FILE_NAME)
                        .then(
                            function (output)
                            {
                                console.log(output)
                            },
                            function (error)
                            {
                                console.log('LECTURE IMPOSSIBLE');
                            }
                        );
                }
            );
        };
    });
}