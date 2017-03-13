/**
* Auteur :  DWAPS Formation - Michael Cornillon
* Mail :    contact@dwaps.fr
* Tel :     0651279211
* Site :    http://dwaps.fr
* Date :    13/03/2017
**/


angular
	.module('filters', [])
	.filter('slugify', slugify)
;

function slugify()
{
	return function(input)
	{
		var output = input
					.toLowerCase()
					.replace(
						/([àâ])|([éèëê])|([îï])|([ôö])|([ûüù])|([ \t\n\s])/g,
						function(found, $1, $2, $3, $4, $5, $6, offset, str)
						{
							switch(found)
							{
								case $1: return "a";
								case $2: return "e";
								case $3: return "i";
								case $4: return "o";
								case $5: return "u";
								case $6: return "_";
							}
						}
					)
		;

		return output;
	}
}