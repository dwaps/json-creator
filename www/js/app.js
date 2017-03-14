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
    .constant( "LOG_ACTIVATED", true )
    .constant( "LIST_FILES_SAVED", "/.DWAPSFormation_listeFichiersJSON.txt" )
    .constant( "DIR_NAME", "JSONCreator" )

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

function runner($ionicPlatform, $rootScope, $cordovaFile, dwapsLog, DIR_NAME, LIST_FILES_SAVED, LOG_ACTIVATED)
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

        dwapsLog.active( LOG_ACTIVATED );

        $rootScope.json = null;
        $rootScope.listFilesSaved = [];
        $rootScope.ecrasementFileList = false; // Au démarrage, on doit pas écraser ce fichier

        $rootScope.createFile = function( fn, json ) { // PREVOIR ALTERNATIVE POUR LE WEB
            var
                FILE_NAME = fn + ".json",
                CONTENT = json
            ;


            $ionicPlatform
                .ready(
                    function()
                    {
                        // VERIFICATION DE L'EXISTENCE DU REPERTOIRE PRINCIPAL
                        $cordovaFile
                            .checkDir(
                                cordova.file.dataDirectory,
                                DIR_NAME
                            )
                            .then(
                                function (success)
                                {
                                    dwapsLog.show('SUCCESS : MAIN FOLDER FOUND');
                                },
                                function (error)
                                {
                                    dwapsLog.show('ERROR : MAIN FOLDER NOT FOUND !');
                                }
                            );

                        
                        if(fn) // Si le nom de fichier est renseigné, on le crée
                        {

                            // CREATION FICHIER .json
                            $cordovaFile.writeFile(
                                cordova.file.dataDirectory,
                                DIR_NAME + "/" + FILE_NAME,
                                CONTENT,
                                true) // Ecrasement autorisé
                                .then(
                                    function (success)
                                    {
                                        dwapsLog.show('SUCCESS : FILE CREATED');
                                        $rootScope.listFilesSaved.push(fn);
                                        dwapsLog.show("FICHIERS SAUVEGARDES")
                                        dwapsLog.show($rootScope.listFilesSaved)
                                        $rootScope.createFile();
                                    },
                                    function (error)
                                    {
                                        dwapsLog.show('ERROR : FILE NOT CREATED !');
                                    }
                                );
                        }
                        else // Sinon, c'est qu'on veut la liste des fichiers sauvegardés
                        {
                            // CREATION REPERTOIRE JSONCreator
                            $cordovaFile
                                .createDir(
                                    cordova.file.dataDirectory,
                                    DIR_NAME,
                                    false)
                                .then(
                                    function (success)
                                    {
                                        dwapsLog.show('SUCCESS : MAIN FOLDER CREATED');
                                    },
                                    function (error)
                                    {
                                        dwapsLog.show('ERROR : MAIN FOLDER NOT CREATED !');
                                    }
                                );

                            // VERIFICATION DE L'EXISTENCE DU FICHIER
                            $cordovaFile
                                .checkFile(
                                    cordova.file.dataDirectory,
                                    DIR_NAME + "/" + LIST_FILES_SAVED
                                )
                                .then(
                                    function (success)
                                    {
                                        dwapsLog.show('SUCCESS : FILE LIST FOUND');
                                        $rootScope.readFile();
                                    },
                                    function (error)
                                    {
                                        dwapsLog.show('ERROR : FILE LIST NOT FOUND !');
                                    }
                                );

                            // CREATION FICHIER .json
                            $cordovaFile.writeFile(
                                cordova.file.dataDirectory,
                                DIR_NAME + "/" + LIST_FILES_SAVED,
                                $rootScope.listFilesSaved,
                                $rootScope.ecrasementFileList) // Ecrasement non autorisé si on est au démarrage
                                .then(
                                    function (success)
                                    {
                                        dwapsLog.show('SUCCESS : FILE LIST CREATED');
                                        dwapsLog.show(success);
                                    },
                                    function (error)
                                    {
                                        dwapsLog.show('ERROR : FILE LIST NOT CREATED !');
                                    }
                                );

                            $rootScope.ecrasementFileList = true;
                        }
                    }
                );
        };

        // Création du fichier qui contiendra la liste de tous les fichiers sauvegardés
        $rootScope.createFile();


        $rootScope.readFile = function( fn ) {
            var FILE_NAME = fn + ".json";

            $ionicPlatform.ready(function()
                {
                    if(fn)
                    {
                        dwapsLog.show("LECTURE D'UN FICHIER SPECIFIQUE");
                        // LECTURE FICHIER .json
                        $cordovaFile.readAsText(
                            cordova.file.dataDirectory,
                            DIR_NAME + "/" + FILE_NAME)
                            .then(
                                function (output)
                                {
                                    dwapsLog.show('SUCCESS : READING FILE...');
                                    $rootScope.$broadcast( "contentFileReady", output );
                                },
                                function (error)
                                {
                                    dwapsLog.show('ERROR : CAN\'T READ FILE');
                                }
                            );
                    }
                    else // Si le nom de fichier n'est pas renseigné, on récupère la liste de tous les fichiers sauvegardés
                    {
                        dwapsLog.show("LECTURE DE LA LISTE DES FICHIERS SAUVEGARDES");
                        // LECTURE FICHIER .json
                        $cordovaFile.readAsText(
                            cordova.file.dataDirectory,
                            DIR_NAME + "/" + LIST_FILES_SAVED)
                            .then(
                                function (output)
                                {
                                    dwapsLog.show('SUCCESS : READING FILE LIST...');
                                    dwapsLog.show("Liste des fichiers avant récup :")
                                    dwapsLog.show($rootScope.listFilesSaved);
                                    dwapsLog.show("Sortie capturé par le lecteur")
                                    dwapsLog.show(output);

                                    var tab = output.split(",");
                                    $rootScope.listFilesSaved = [];
                                    tab.forEach(
                                        function(i)
                                        {
                                            if(i != "[]")
                                            {
                                                i = i.replace(/["\[]|[\]"]/g, ""); // On débarasse i du superflu
                                                $rootScope.listFilesSaved.push( i );
                                            }
                                        }
                                    );
                                    dwapsLog.show("Liste des fichiers après récup :");
                                    dwapsLog.show($rootScope.listFilesSaved);
                                },
                                function (error)
                                {
                                    dwapsLog.show('ERROR : CAN\'T READ FILE');
                                }
                            );
                    }
                }
            );
        };

        $rootScope.clearFiles = function() {
            $ionicPlatform.ready(function()
                {
                    dwapsLog.show("\nPREPARATION EFFACEMENT FICHIER LIST...");

                    $cordovaFile.removeFile(
                        cordova.file.dataDirectory,
                        DIR_NAME + "/" + LIST_FILES_SAVED) // Ecrasement
                        .then(
                            function (success)
                            {
                                dwapsLog.show('SUCCESS : FILE LIST REMOVED');
                                $rootScope.listFilesSaved = [];
                            },
                            function (error)
                            {
                                dwapsLog.show('ERROR : FILE LIST NOT REMOVED !');
                            }
                        );
                }
            );
        };
    });
}