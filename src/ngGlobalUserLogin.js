import angular from "angular";
import "ng-dialog";
import viewFactory from "./view/viewFactory.js";
import {getUrlVars} from "./common.js";
import gulConfig from "./gulConfig.js";
import cdStorage from  "./lib/cdStorage.js";
import "./style/gul.css!";
import "ng-dialog/css/ngDialog-theme-default.min.css!";


const globalUserLogin = angular.module("ngGlobalUserLogin", ['ngDialog'])
    .factory("globalUserLoginService", globalUserLoginService)
    .run(["globalUserLoginService", function(globalUserLoginService) {
            var page = getUrlVars().page;
        
            if (page && page === "ActivateAccount") {
                globalUserLoginService.activateAccount();
            }
            else if (page && page === "ResetPassword") {
                globalUserLoginService.resetPassword();
            }
        }]);



globalUserLoginService.$inject = ["ngDialog", '$q'];

function globalUserLoginService(ngDialog,$q){
    var onPreDialogShowUp;
    var onDialogClosed;
    var initialQuery;

    gulConfig.promiseProvider = function promiseProvider()
    {
        var deferred =  $q.defer();

        return  {
            promise: deferred.promise,
            resolve: deferred.resolve,
            reject: deferred.reject
        }
    }

    function signIn() {
        //get the sign in token
        return $q.when(cdStorage.getItem(gulConfig.access_token_key)
            .then(function(value){
                //if key was not present, value will be 'undefined'
                if (value) {
                    return $q.resolve(JSON.parse(value));
                } else {
                    //show login page
                    return showGulPopUp('signIn');
                }
            }));
    }

    function register() {
        return showGulPopUp('signUp');
    }

    function passwordUpdate() {
        //get the sign in token
        return $q.when(cdStorage.getItem(gulConfig.access_token_key)
            .then(function(value){
                //if key was not present, value will be 'undefined'
                if (value) {
                    return showGulPopUp('passwordUpdate');
                } else {
                    //show login page
                    return showGulPopUp('signIn');
                }
            }));
    }

    function signOut() {
        //get the sign in token
        cdStorage.removeItem(gulConfig.access_token_key);
    }

    function profileUpdate() {
        //get the sign in token
        return $q.when(cdStorage.getItem(gulConfig.access_token_key)
            .then(function(value){
                //if key was not present, value will be 'undefined'
                if (value) {
                    return showGulPopUp('profileUpdate');
                } else {
                    //show login page
                    return showGulPopUp('signIn');
                }
            }));
    }


    function showGulPopUp(viewName) {
        if (onPreDialogShowUp)
            onPreDialogShowUp();

        return ngDialog.openConfirm({
            template: '<div id="div-gul-container"></div>',
            plain: true,
            className: 'ngdialog-theme-default ngdialog-gul',
            controller: ['$rootScope','$scope', function ($rootScope, $scope) {
                var vm = this;
             
                function dialogOpened(e, $dialog) {
                    viewFactory()[viewName]("", gulConfig.promiseProvider(), "#div-gul-container", vm).then(function(data){
                            $scope.confirm(data)
                  });
                }
                $scope.$on('ngDialog.opened', dialogOpened);
                $scope.$on('ngDialog.closing', function(){
                    if(vm._currentView) vm._currentView.remove();
                });

            }]
        })
         .then(function (data) {return data;})
         .catch(function(error){return error;})
         .finally(function(){

             if(onDialogClosed)
                 onDialogClosed();
         });
    }

    function initialize(options) {
    
        //config.checkInitPage = showInitPage;
        gulConfig.siteId = options.siteId;
        gulConfig.siteName = options.siteName;
        gulConfig.prpSiteId = options.prpSiteId;
        gulConfig.clientId = options.clientId;


        onPreDialogShowUp = options.onPreDialogShowUp;
        onDialogClosed = options.onDialogClosed;
        initialQuery = options.initialQuery;

        if (options.config) {
            gulConfig.enableAddressCollection = options.config.enableAddressCollection || gulConfig.enableAddressCollection;
            gulConfig.enableAddressValidation = options.config.enableAddressValidation || gulConfig.enableAddressValidation;
            gulConfig.enableEmailVerification = options.config.enableEmailVerification || gulConfig.enableEmailVerification;
            gulConfig.enableBirthDayCollection = options.config.enableBirthDayCollection || gulConfig.enableBirthDayCollection;
            gulConfig.customOptIns = options.config.customOptIns || gulConfig.customOptIns;
            gulConfig.links.termAndConditions = options.config.termsAndConditions || gulConfig.links.termsAndConditions;
        };
    }

    function activateAccount() {
        //show activation view with the token
        return showGulPopUp("activateAccount");
    }

    function resetPassword() {
        //show reset password view with the token
        return showGulPopUp("resetPassword");
    }
    
    var publicAPI = {
        initialize:initialize,
        signIn : signIn,
        signOut: signOut,
        register: register,
        passwordUpdate: passwordUpdate,
        profileUpdate: profileUpdate,
        activateAccount: activateAccount,
        resetPassword: resetPassword
    }
    return publicAPI;
}
export default globalUserLogin;