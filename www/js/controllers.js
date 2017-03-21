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
 * Pour le moment les valeurs des tableaux n'acceptent qu'un seul type (string)
 * idem pour les objets
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
		jsonProvider,
		fileProvider,
		emailProvider,
		clipboardProvider,
		dwapsLog,
		dwapsToast,
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

	$scope.data = {
		type: $rootScope.type.PROPRIETE,
		input: ""
	};
	$scope.currentType = "";
	$scope.currentProp = "";
	$scope.lastProp = ""; // Pour la gestion des objets, permet d'ajouter la nouvelle propriété à l'ancienne

	var isRootArray = true;
	$scope.boolean = { state: false };
	$scope.jsonStart = true;
	$scope.endArray = true;
	$scope.endObject = true;
	$scope.niveauObject = 0; // Retiens le niveau en cours d'édition
	$scope.switchPropVal = true; // Gestion objet : true => propriété, false => valeur
	$scope.firstProp = true; // Si tratement 1ère propriété d'une liste de propriété d'un objet imbriqué

	$scope.sendByMail = function( filename, filecontent )
	{
		emailProvider.send( filename, filecontent );
	};

	$scope.copyToClipboard = function( json )
	{
		clipboardProvider.copy( json );
	};

    $scope.setTypeAndData = function( data, type, endArray, endObject )
    {
    	var tmp = "", doubleProp = false;
    	if( $rootScope.showLogo ) $rootScope.showLogo = false;

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


        		if( type == $rootScope.type.BOOLEAN ) 
		        		$scope.data.input = "Switch to choose a value !";

        		// Vérification de l'unicité de la propriété
        		if( $scope.endObject && $scope.endArray )
        		{
        			if(isRootArray)
        			{
		        		$rootScope.json.forEach(
		        			function(o)
		        			{
		        				for( var p in o)
		        				{
		        					if( p == $scope.currentProp)
		        					{
					     				$scope.data.type = $rootScope.type.PROPRIETE;
					     				$scope.data.input = "";
	        							$scope.currentType = "";
		        						doubleProp = true;
		        						dwapsToast.show("<h2>Désolé !</h2><p>Cette propriété existe déjà.");
		        					}
		        				}
		        			}
		        		);
        			}
        			else
        			{
        				for( var p in $rootScope.json)
        				{
        					if( p == $scope.currentProp)
        					{
			     				$scope.data.type = $rootScope.type.PROPRIETE;
			     				$scope.data.input = "";
    							$scope.currentType = "";
        						doubleProp = true;
        						dwapsToast.show("<h2>Désolé !</h2><p>Cette propriété existe déjà.");
        					}
        				}
        			}
        		}

        		if(!doubleProp) // Si la propriété renseignée n'est pas un doublon
        		{
        			if(
        				type != $rootScope.type.OBJECT
        				&&
        				type != $rootScope.type.ARRAY) // La valeur désirée n'est pas un objet => array | int | bool | string
        			{
        				if($scope.endObject && $scope.endArray)
        				{
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
        				}
		    			else
		    			{
		    				$scope.setTypeAndData( data, null, null ); // On rappelle la fonction sans le type pour intégrer la valeur àu dernier objet
		    			}

		    			$scope.data.type = $rootScope.type.VALEUR; // Prochaine donnée => valeur

        			}
        			else if(type == $rootScope.type.OBJECT ) // La prochaine saisie est forcément une propriété
        			{
	    				if( endObject ) // Décide si on termine l'édition de l'objet
    					{
    						$scope.niveauObject = 0;
    						$scope.endObject = true;
    						$scope.firstProp = true;
    						// $scope.data.type == $rootScope.type.PROPRIETE;
    						// $scope.showBtsBuilderJSON();
    						return;
    					}

						if(isRootArray)
						{							
							if($scope.endObject) // 1er appel pour construire un objet
							{
								$rootScope.json.push(JSON.parse('{"'+$scope.currentProp+'":{}}'));
							}
							else 
							{
								jsonProvider.adminObject( $rootScope.json[$rootScope.json.length-1], data );
							}
							$scope.niveauObject++;
						}
						else
						{
							if(Object.keys($rootScope.json).length === 0)
								$rootScope.json = toJson;
							else
								$rootScope.json[$scope.currentProp] = "";
						}
						$scope.lastProp = $scope.currentProp;
						$scope.endObject = false;
						return;
						// else
						// 	if($rootScope.json == {}) $rootScope.json = toJson;
						// 	else $rootScope.json += toJson;
		    			// $scope.data.type = $rootScope.type.VALEUR; // Prochaine donnée => valeur
        			}
        		}
        		else
        			return;
        	}

        	// SAISIE VALEUR
        	else
        	{
        		$scope.data.input = "";

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
			        	if($scope.endArray) $scope.data.type = $rootScope.type.PROPRIETE;

	        			break;

	        		case $rootScope.type.STRING:

	    				if( endObject ) // Décide si on édite un objet imbriqué ou non
    					{
    						$scope.niveauObject = 0;
    						$scope.endObject = true;
    						$scope.firstProp = true;
    					}

			    		// Si on sort d'un objet, la dernière valeur doit appartenir à la dernière propriété saisie
			    		// avant de repasser à un nouveau couple propriété/valeur
			    		if($scope.niveauObject > 0)
			    		{
			    			if($scope.switchPropVal) // Dernière propriété parente de l'objet
			    			{
			    				console.log("Traitement propriété en cours")
			    				if($scope.firstProp)
			    				{
			    					// $scope.lastProp = $scope.currentProp; // On stocke la propriété parente du niveau traité
			    					$scope.firstProp = false;
			    				}
			    				jsonProvider.adminObject($rootScope.json[$rootScope.json.length-1], $scope.lastProp, data);
			    				$scope.childProp = data;
			    				$scope.switchPropVal = false; // Prochaine saisie forcément une valeur pour la propriété de l'objet en cours
			    			}
			    			else // Dernière valeur de l'objet
			    			{
			    				console.log("Traitement valeur en cours")
			    				jsonProvider.adminObject($rootScope.json[$rootScope.json.length-1], $scope.lastProp, $scope.childProp, data);
			    				$scope.switchPropVal = true; // Prochaine saisie forcément une nouvelle propriété pour la propriété de l'objet en cours

			    				
				    			// if(isRootArray)
				    			// {
		        	// 				var o = $rootScope.json[$rootScope.json.length-1];
		        	// 				console.log("Niveau objet => " + $scope.niveauObject)
		        	// 				$rootScope.json.forEach(
		        	// 					function(o)
		        	// 					{
		        	// 						console.log("Objet concerné:")
		        	// 						console.log(o)

		        	// 						jsonProvider.cursorObject( o, $scope.lastProp, data );
		        	// 						console.log("Propriété actuelle => " + $scope.lastProp);
		        	// 					}
		        	// 				);
				    			// }
				    			// else // La racine JSON est un objet
				    			// {

				    			// }

			    				// $data.type = $rootScope.type.PROPRIETE;
			    			}
			    		}

			    		else // On n'ets pas dans le traitement d'un objet imbriqué
			    		{
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
				        	$scope.data.type = $rootScope.type.PROPRIETE;
			    		}

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
			        	$scope.data.type = $rootScope.type.PROPRIETE;

	        			break;

	        		case $rootScope.type.BOOLEAN:
		        		console.log("Etat booléen => " + $scope.boolean.state)

	        			if( isRootArray ) // Si le JSON est un tableau d'objet
	        			{
	        				$rootScope.json.forEach(
	        					function( o )
	        					{
        							for(var p in o )
        							{
        								if( p == $scope.currentProp )
											o[p] = $scope.boolean.state;
        							}
	        					}
	        				);
	        			}
	        			else
	        			{
							for(var p in $rootScope.json )
							{
								if( p == $scope.currentProp )
									$rootScope.json[p] = $scope.boolean.state;
							}
	        			}

			        	// Si l'utilisateur a fini de renseigner la valeur,
			        	// il faut repasser en mode "saisir une nouvelle propriété"
			        	$scope.data.type = $rootScope.type.PROPRIETE;

	        			break;
	        	}

        		$scope.currentType = "";
        	}

    		dwapsLog.show(JSON.stringify($rootScope.json));
    		// dwapsLog.show($rootScope.json);
        }

        // console.log($rootScope.json);
    };

    $scope.showBtSubmit = function()
    {
    	return $scope.data.type == $rootScope.type.VALEUR; // && !$scope.switchPropVal;
    };

    $scope.showBtsBuilderJSON = function()
    {
    	return $scope.data.type == $rootScope.type.PROPRIETE; // | $scope.switchPropVal;
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
					scope: $scope,
					buttons: [
						{ text: 'Cancel' }
					]
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
    };
}