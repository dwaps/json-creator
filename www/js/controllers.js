/**
* Auteur :  DWAPS Formation - Michael Cornillon
* Mail :    contact@dwaps.fr
* Tel :     0651279211
* Site :    http://dwaps.fr
* Date :    12/03/2017
**/



/**
 * A FAIRE !!!
 * 
 * Pour le moment les valers des tableaux n'acceptent qu'un seul type (string)
 */


angular
	.module('controllers', [])
	.controller('homeCtrl', homeCtrl)
;

function homeCtrl(
		$scope,
		$rootScope,
		$filter,
		$timeout,
		$ionicPopup,
		$cordovaEmailComposer,
		$cordovaClipboard,
		fileProvider,
		dwapsLog,
		dwapsToast,
		INVIT_CONTACT,
		DIR_NAME)
{
    $rootScope.showLogo = true;

    $rootScope.type = {
        ARRAY: "tab",
        OBJECT: "obj",
        STRING: "str",
        INTEGER: "nb",
        BOOLEAN: "y/n",

        PROPRIETE: "Propriété",
        VALEUR: "Valeur"
    };

	$scope.dataType = $rootScope.type.PROPRIETE;
	$scope.currentType = "";
	$scope.currentProp = "";

	var isRootArray = true;
	$scope.jsonStart = true;
	$scope.endArray = true;

    $scope.setTypeAndData = function( data, type, endArray )
    {
    	var tmp = "";
    	$rootScope.showLogo = false;

        if( $scope.jsonStart ) // 1er appel à la fonction : initialisation de l'objet JSON
        {
    		$scope.jsonStart = false;
        	isRootArray = type;

	        if(isRootArray)
    			$rootScope.json = [];
	        else
    			$rootScope.json = {};
        }
        else if(data) // Si les données sont renseignées
        {
        	// SAISIE PROPRIETE
        	if( type ) // Si type est renseigné, la saisie est une propriété
        	{
        		// Mise à jour du type de la valeur à venir : (array, boolean...)
        		$scope.currentType = type;
        		$scope.currentProp = $filter("slugify")(data, data);

        		tmp = '{"'+$scope.currentProp+'":""}';
        		var toJson = JSON.parse(tmp);

				if(isRootArray) $rootScope.json.push(toJson);
				else
				{
					if(Object.keys($rootScope.json).length === 0)
						$rootScope.json = toJson;
					else
						$rootScope.json[$scope.currentProp] = "";
				}
				// else
				// 	if($rootScope.json == {}) $rootScope.json = toJson;
				// 	else $rootScope.json += toJson;
    			$scope.dataType = $rootScope.type.VALEUR; // Prochaine donnée => valeur
        	}

        	// SAISIE VALEUR
        	else
        	{
	        	switch( $scope.currentType )
	        	{
	        		case $rootScope.type.ARRAY:
	        			$scope.endArray = endArray;

	        			if( isRootArray ) // Si le JSON est un tableau d'objet
	        			{
	        				$rootScope.json.forEach(
	        					function( o )
	        					{
        							for(var p in o )
        							{
        								if( p == $scope.currentProp )
        								{
        									if( !Array.isArray(o[p]) ) o[p] = [];
	        								o[p].push(data);
        								}
        							}
	        					}
	        				);
	        			}
	        			else
	        			{
							for(var p in $rootScope.json )
							{
								if( p == $scope.currentProp )
								{
									if( !Array.isArray($rootScope.json[p]) ) $rootScope.json[p] = [];
    								$rootScope.json[p].push(data);
								}
							}
	        			}

			        	// Si l'utilisateur a fini de renseigner la valeur,
			        	// il faut repasser en mode "saisir une nouvelle propriété"
			        	if($scope.endArray) $scope.dataType = $rootScope.type.PROPRIETE;

	        			break;

	        		case $rootScope.type.OBJECT:
	        			// $scope.setTypeAndData( data, type );
	        			break;

	        		case $rootScope.type.STRING:
	        			if( isRootArray ) // Si le JSON est un tableau d'objet
	        			{
	        				$rootScope.json.forEach(
	        					function( o )
	        					{
        							for(var p in o )
        							{
        								if( p == $scope.currentProp )
        									o[p] = data;
        							}
	        					}
	        				);
	        			}
	        			else
	        			{
							for(var p in $rootScope.json )
							{
								if( p == $scope.currentProp )
									$rootScope.json[p] = data;
							}
	        			}

			        	// Si l'utilisateur a fini de renseigner la valeur,
			        	// il faut repasser en mode "saisir une nouvelle propriété"
			        	$scope.dataType = $rootScope.type.PROPRIETE;

	        			break;

	        		case $rootScope.type.INTEGER:
	        			if( isRootArray ) // Si le JSON est un tableau d'objet
	        			{
	        				$rootScope.json.forEach(
	        					function( o )
	        					{
        							for(var p in o )
        							{
        								if( p == $scope.currentProp )
        									o[p] = parseInt(data);
        							}
	        					}
	        				);
	        			}
	        			else
	        			{
							for(var p in $rootScope.json )
							{
								if( p == $scope.currentProp )
									$rootScope.json[p] = parseInt(data);
							}
	        			}

			        	// Si l'utilisateur a fini de renseigner la valeur,
			        	// il faut repasser en mode "saisir une nouvelle propriété"
			        	$scope.dataType = $rootScope.type.PROPRIETE;

	        			break;

	        		case $rootScope.type.BOOLEAN:
	        			if( isRootArray ) // Si le JSON est un tableau d'objet
	        			{
	        				$rootScope.json.forEach(
	        					function( o )
	        					{
        							for(var p in o )
        							{
        								if( p == $scope.currentProp )
        									o[p] = data == "true";
        							}
	        					}
	        				);
	        			}
	        			else
	        			{
							for(var p in $rootScope.json )
							{
								if( p == $scope.currentProp )
									$rootScope.json[p] = data == "true";
							}
	        			}

			        	// Si l'utilisateur a fini de renseigner la valeur,
			        	// il faut repasser en mode "saisir une nouvelle propriété"
			        	$scope.dataType = $rootScope.type.PROPRIETE;

	        			break;

	        	}
        	}

    		dwapsLog.show(JSON.stringify($rootScope.json));
    		// dwapsLog.show($rootScope.json);
        }
    };


    // GESTION FICHIER
    $scope.popup = null;
    $scope.file = {
    	name: "",
    	content: ""
    };

    $scope.adminFile = function( json )
    {
    	if(undefined !== json)
    		$scope.openPopup(json);
    	else
    		$scope.openPopup();
    };

    $scope.recupFile = function( fn )
    {
    	$rootScope.showLogo = false;
    	$scope.jsonStart = false;
    	$scope.file.name = fn;
    	dwapsLog.show("Fichier affiché :");
    	dwapsLog.show($scope.fn);
    	$scope.popup.close();
    	fileProvider.readFile(fn);
    };

    $scope.clearFiles = function()
    {
    	fileProvider.clearFiles();
    };

	$rootScope.$on( "contentFileReady", function( event, data )
	{
		dwapsLog.show("Récup content file :");
		dwapsLog.show(data);
		$scope.file.content = data;
	});

    $scope.openPopup = function( json )
    {
    	$scope.file.name = "";
    	$scope.file.content = "";

		if(undefined !== json)
		{
			$scope.popup = $ionicPopup.show(
				{
					template: '<input type="text" ng-model="file.name">',
					title: 'Name of file',
					subTitle: '(without extension)',
					scope: $scope,
					buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>OK</b>',
							type: 'button-positive',
							onTap: function(e) {
									if (!$scope.file.name) e.preventDefault();
									else fileProvider.createFile( $scope.file.name, json );
								}
						}
					]
				}
			);
		}
		else
		{
			$scope.popup = $ionicPopup.show(
				{
					template: '<ion-list>\
									<ion-item ng-repeat="f in listFilesSaved" ng-click="recupFile(f)">\
										{{ f }}.json\
									</ion-item>\
								</ion-list>',
					title: 'Choose a file',
					scope: $scope
				}
			);
		}

		$scope.popup
			.then(
				function(res)
				{
					dwapsLog.show('Tapped!', res);
					if(!json)
					{
						// dwapsLog.show($scope.file);
					}
				}
			);

		// $timeout(
		// 	function()
		// 	{
		// 		popupCreateFile.close();
		// 	},
		// 	3000
		// );
    };

	$scope.sendByMail = function( fn, fc )
	{
		dwapsLog.show("Envoi par mail en cours...");

		var filePath = "file:///storage/emulated/0/" + DIR_NAME + "/" + fn + ".json";
		console.log(filePath);
		
		$cordovaEmailComposer
			.isAvailable()
			.then(
				function()
				{
				},
				function()
				{
				}
			);

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

		$cordovaEmailComposer.open(email);
	};

	$scope.copyToClipboard = function( content )
	{
		dwapsLog.show("COPYING TO CLIPBOARD");

		$cordovaClipboard
			.copy( content )
			.then(
				function ()
				{
					dwapsLog.show("SUCCESS : TEXTE COPIED");
				},
				function ()
				{
					dwapsLog.show("ERROR : TEXTE NOT COPIED !");
				}
			);

		$cordovaClipboard
			.paste()
			.then(
				function ( result )
				{
				},
				function ()
				{
				}
			);
	};
}