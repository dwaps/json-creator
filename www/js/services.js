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
    .service('emailProvider', emailProvider)
    .service('clipboardProvider', clipboardProvider)

    .service( 'checkProvider', checkProvider )

    .service('popupFactory', popupFactory)
;



function jsonProvider( $rootScope, popupFactory )
{
    function adminObject( obj, parentProp, childProp, value, dwapsLog )
    {
        for( var p in obj)
        {
            if(angular.equals(obj[p], {}) && parentProp && parentProp != p)
            {
                dwapsLog.show("Affectation propriété parente : " + parentProp);
                obj[p] = JSON.parse('{"'+parentProp+'":{}}');
                break;
            }
            else if(parentProp && childProp && !value && parentProp == p)
            {
                dwapsLog.show("Affectation nouvelle propriété : " + childProp);
                obj[parentProp][childProp] = "";
            }
            else if(parentProp && childProp && value && parentProp == p)
            {
                dwapsLog.show("Affectation valeur ("+value+") à propriété enfant " + childProp);                
                obj[parentProp][childProp] = value.replace(/^""$/,"$1");
            }
            else if(angular.equals(obj[p], {}) && value)
            {
                dwapsLog.show("Affectation valeur : " + value);
                obj[p] = value.replace(/^"(.*)"$/,"$1");
            }
            else adminObject( obj[p], parentProp, childProp, value ); // Récursion
        }
    }

    // var cpt = 0;

    function cursorObject( o, lastProp, value )
    {
        // cpt++;
        // if(cpt>10)
        // {
        //     console.log("TROP DE RECURSIONS !!!");
        //     return;
        // }

        for( var p in o)
        {
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

    function adminArray( isRootArray, imbricationNivel, data )
    {
        if( imbricationNivel == 0 ) // 1er appel pour construire un tableau
        {
            if( isRootArray )
            {
                $rootScope.json.push(JSON.parse('{"'+data+'":[]}'));

                var popup = null;
                var templateUrl = "templates/popup/type-choice.html",
                    title = "Choose a type",
                    subTitle = "";

                $rootScope.fillArray = function( type )
                {
                    $rootScope.blockedType = type;
                    if(popup) popup.close();
                };

                var popup = popupFactory(
                    $rootScope,
                    templateUrl,
                    title,
                    subTitle,
                    null
                );
            }
            else
                $rootScope.json[data] = [];
        }
    }

    return {
        adminObject: adminObject,
        cursorObject: cursorObject,
        adminArray: adminArray
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

function emailProvider( dwapsLog, dwapsToast, $cordovaEmailComposer, DIR_NAME, INVIT_CONTACT )
{
    function send( fn, fc )
    {
        var filePath = "file:///storage/emulated/0/" + DIR_NAME + "/" + fn + ".json";


        $cordovaEmailComposer
            .isAvailable()
            .then(
                function()
                {
                    dwapsLog.show("Envoi par mail en cours...");
                    dwapsToast.show("<strong>Création email en cours...</strong>");

                    var email = {
                        attachments: [
                            filePath,
                            'file://img/logo.gif'
                        ],
                        subject: 'DWAPS Formation : JSONCreator',
                        body: '<p>Hello,\
                                <br><br>Here is your content\'s json file :</p>\
                                <strong>' + fc + '</strong>\
                                <p><a href="http://dwaps.fr">DWAPS Formation - Michael Cornillon</a></p>',
                        isHtml: true
                    };

                    $cordovaEmailComposer.open( email );
                },
                function()
                {
                    dwapsLog.show("Impossible d'envoyer l'email !");
                    dwapsToast.show("<h4>L'envoi n'a pas abouti</h4>" + INVIT_CONTACT);
                }
            );
        
    }

    return {
        send: send
    };
}

function clipboardProvider( $cordovaClipboard, dwapsLog, dwapsToast )
{
    function copy( content )
    {
        dwapsLog.show("COPYING TO CLIPBOARD");

        $cordovaClipboard
            .copy( content )
            .then(
                function ()
                {
                    dwapsLog.show("SUCCESS : TEXTE COPIED");
                    dwapsToast.show("<strong>JSON copié !</strong>");
                },
                function ()
                {
                    dwapsLog.show("ERROR : TEXTE NOT COPIED !");
                }
            );

        // $cordovaClipboard
        //     .paste()
        //     .then(
        //         function ( result )
        //         {
        //         },
        //         function ()
        //         {
        //         }
        //     );
    };

    return {
        copy: copy
    };
}

function checkProvider( $rootScope, dwapsToast )
{
    function isUnique( isRootArray, currentProp, type, input )
    {
        var retour = true;

        if(isRootArray)
        {
            $rootScope.json.forEach(
                function(o)
                {
                    for( var p in o)
                    {
                        if( p == currentProp)
                        {
                            $rootScope.currentType = "";
                            type = $rootScope.type.PROPRIETE;
                            dwapsToast.show("<h2>Désolé !</h2><p>Cette propriété existe déjà.");
                            input = "";
                            retour = false;
                        }
                    }
                }
            );
        }
        else
        {
            for( var p in $rootScope.json)
            {
                if( p == currentProp)
                {
                    $rootScope.currentType = "";
                    type = $rootScope.type.PROPRIETE;
                    dwapsToast.show("<h2>Désolé !</h2><p>Cette propriété existe déjà.");
                    input = "";
                    retour = false;
                }
            }
        }

        return retour;
    }

    return {
        isUnique: isUnique
    };
}

function popupFactory( $ionicPopup )
{
    return function openPopup( scope, templateUrl, title, subTitle, buttons )
    {
        popup = $ionicPopup.show(
            {
                templateUrl: templateUrl,
                title: title,
                subTitle: subTitle,
                scope: scope,
                buttons: buttons
            }
        );

        return popup;
    }
}