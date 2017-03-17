/**
* Auteur : 	DWAPS Formation - Michael Cornillon
* Client :	CLIENT
* Mail : 	contact@dwaps.fr
* Tel :		0651279211
* Site : 	http://dwaps.fr
* Date : 	//2016
**/


angular
	.module('directives', [])

	.directive('buttonsStart', buttonsStart)
	.directive('jsonBuilder', jsonBuilder)
	.directive('fileAdmin', fileAdmin)
	.directive('jsonDisplay', jsonDisplay)
;

function buttonsStart()
{
	return {
		restrict: 'C',
		templateUrl: 'templates/directives/buttons-start.html'
	};
}

function jsonBuilder()
{
	return {
		restrict: 'C',
		templateUrl: 'templates/directives/json-builder.html'
	};
}

function fileAdmin()
{
	return {
		restrict: 'C',
		templateUrl: 'templates/directives/file-admin.html'
	};
}

function jsonDisplay()
{
	return {
		restrict: 'C',
		templateUrl: 'templates/directives/json-display.html'
	};
}