/**
* Auteur : 	DWAPS Formation - Michael Cornillon
* Client :	CLIENT
* Mail : 	contact@dwaps.fr
* Tel :		0651279211
* Site : 	http://dwaps.fr
* Date : 	//2016
**/


angular
	.module('services', [])

    .service('jsonProvider', jsonProvider)
	.service('fileProvider', fileProvider)
;



function jsonProvider()
{
    function adminObject( obj, parentProp, childProp, value )
    {
        for( var p in obj)
        {
            if(angular.equals(obj[p], {}) && parentProp && parentProp != p)
            {
                console.log("Affectation propriété parente : " + parentProp);
                obj[p] = JSON.parse('{"'+parentProp+'":{}}');
                break;
            }
            else if(parentProp && childProp && !value && parentProp == p)
            {
                console.log("Affectation nouvelle propriété : " + childProp);
                obj[parentProp][childProp] = "";
            }
            else if(parentProp && childProp && value && parentProp == p)
            {
                console.log("Affectation valeur ("+value+") à propriété enfant " + childProp);                
                obj[parentProp][childProp] = value.replace(/^"(.*)"$/,"$1");
            }
            else if(angular.equals(obj[p], {}) && value)
            {
                console.log("Affectation valeur : " + value);
                obj[p] = value.replace(/^"(.*)"$/,"$1");
            }
            else adminObject( obj[p], parentProp, childProp, value ); // Récursion
        }
    }

    var cpt = 0;

    function cursorObject( o, lastProp, value )
    {
        cpt++;
        if(cpt>10)
        {
            console.log("TROP DE RECURSIONS !!!");
            return;
        }

        for( var p in o)
        {
            console.log(p)
            if(p != lastProp)
            {
                cursorObject( o[p], lastProp );
            }
            else
            {
                adminObject( o[p], null, value );
            }
        }
    }

    return {
        adminObject: adminObject,
        cursorObject: cursorObject
    };
}

function fileProvider(
		$rootScope,
		$ionicPlatform,
		$cordovaFile,
		dwapsLog,
        DIR_NAME,
        LIST_FILES_SAVED)
{
    function createFile( fn, json ) // PREVOIR ALTERNATIVE POUR LE WEB !!!
    {
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
                            "file:///storage/emulated/0/",
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
                            "file:///storage/emulated/0/",
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
                                    createFile();
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
                                "file:///storage/emulated/0/",
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
                                "file:///storage/emulated/0/",
                                DIR_NAME + "/" + LIST_FILES_SAVED
                            )
                            .then(
                                function (success)
                                {
                                    dwapsLog.show('SUCCESS : FILE LIST FOUND');
                                    readFile();
                                    dwapsLog.show(success);
                                },
                                function (error)
                                {
                                    dwapsLog.show('ERROR : FILE LIST NOT FOUND !');
                                }
                            );

                        // CREATION FICHIER .json
                        $cordovaFile.writeFile(
                            "file:///storage/emulated/0/",
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
    }

    function readFile( fn )
    {
        var FILE_NAME = fn + ".json";

        $ionicPlatform.ready(function()
            {
                if(fn)
                {
                    dwapsLog.show("LECTURE D'UN FICHIER SPECIFIQUE");
                    // LECTURE FICHIER .json
                    $cordovaFile.readAsText(
                        "file:///storage/emulated/0/",
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
                        "file:///storage/emulated/0/",
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
    }

    function clearFiles()
    {
        $ionicPlatform.ready(function()
            {
                dwapsLog.show("\nPREPARATION EFFACEMENT FICHIER LIST...");

                $cordovaFile.removeFile(
                    "file:///storage/emulated/0/",
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
    }

    return {
    	createFile: createFile,
    	readFile: readFile,
    	clearFiles: clearFiles
    };
}