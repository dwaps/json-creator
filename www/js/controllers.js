/**
* Auteur :  DWAPS Formation - Michael Cornillon
* Mail :    contact@dwaps.fr
* Tel :     0651279211
* Site :    http://dwaps.fr
* Date :    12/03/2017
**/


angular
	.module('controllers', [])
	.controller('homeCtrl', homeCtrl)
;

function homeCtrl($scope, $rootScope, $filter, dwapsLog)
{
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

    $scope.setTypeAndData = function( data, type )
    {
    	var tmp = "";

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
	        			break;
	        		case $rootScope.type.OBJECT:
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
	        			break;
	        			break;
	        	}

	        	// Si l'utilisateur a fini de renseigner la valeur,
	        	// il faut repasser en mode "saisir une nouvelle propriété"
	        	$scope.dataType = $rootScope.type.PROPRIETE;
        	}

    		dwapsLog.show(JSON.stringify($rootScope.json));
    		// dwapsLog.show($rootScope.json);
        }
    };
}