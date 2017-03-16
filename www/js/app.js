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
                    'services',
                    'filters',
                    'dwapsLog',
                    'dwapsToast'
                    ])

    .constant( "CACHE_ACTIVED", false )
    .constant( "LOG_ACTIVATED", true )
    .constant( "LIST_FILES_SAVED", "/.DWAPSFormation_listeFichiersJSON.txt" )
    .constant( "DIR_NAME", "JSONCreator" )
    .constant( "INVIT_CONTACT", "<p>Contactez le développeur</p>" )

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

function runner(
        $ionicPlatform,
        $rootScope,
        dwapsLog,
        fileProvider,
        LOG_ACTIVATED)
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

        dwaps.init();
        dwaps.animLogo();

        dwapsLog.active( LOG_ACTIVATED );

        $rootScope.json = null;
        $rootScope.listFilesSaved = [];
        $rootScope.ecrasementFileList = false; // Au démarrage, on doit pas écraser ce fichier


        // Création du fichier qui contiendra la liste de tous les fichiers sauvegardés
        fileProvider.createFile();
    });
}

var dwaps = {
    init: function()
    {
        this.logoDWAPS = document.querySelector("#logo-dwaps img");
        this.normal = this.logoDWAPS.src;
        this.cligne = this.normal.replace(".png","") + "-cligne.png";

        this.logoDWAPS.style.marginTop = (window.innerHeight/2 - this.logoDWAPS.height/2) + "px";
    },
    animLogo: function()
    {
        var
            THIS = this
            aleat = Math.round((Math.random() * 2000))
        ;

        setTimeout(
            function()
            {
                THIS.logoDWAPS.src = THIS.cligne;

                setTimeout(
                    function()
                    {
                        THIS.logoDWAPS.src = THIS.normal;
                        THIS.animLogo();
                    },
                    250
                );
            },
            aleat
        );
    }
};