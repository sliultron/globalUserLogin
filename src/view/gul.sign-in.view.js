import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

import signInTemplate from "../templates/gul.sign-in.template.html!text"
import cdStorage from  "../lib/cdStorage.js";
import PromiseWindow from "../lib/promise-window.js";

import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"


export default backbone.View.extend({
        id:"sign-in",
        initialize:function(userEmail, deferred, containerId,vm){
            this._deferred = deferred;
            this._containerId = containerId;
            this._vm = vm;
            this._signInUserEmail = userEmail;
        },
        render: function () {
            var template = _.template(signInTemplate);
            var socialLoginOptions = {
                twitter: {
                    enabled: false,
                    url: ''
                },
                facebook: {
                    enabled: false,
                    url: ''
                },
                google: {
                    enabled: false,
                    url: ''
                },
            };

            var _render = function(availablelogins) {
              
                for (var i = 0; i < availablelogins.length; i++) {
                         if (availablelogins[i].name == 'Twitter') {
                             socialLoginOptions.twitter.enabled = true;
                             socialLoginOptions.twitter.url = availablelogins[i].url;
                         } else if (availablelogins[i].name == 'Facebook') {
                             socialLoginOptions.facebook.enabled = true;
                             socialLoginOptions.facebook.url = availablelogins[i].url;
                         } else if (availablelogins[i].name == 'Google') {
                             socialLoginOptions.google.enabled = true;
                             socialLoginOptions.google.url = availablelogins[i].url;
                         }
                     }
                 this.$el.html(template(socialLoginOptions));
                 $(this._containerId).append(this.el);


                //clear the previouse view
                 if(this._vm._currentView)
                     this._vm._currentView.remove();

                //reset the view to be self
                 this._vm._currentView = this;
            }

            cdStorage.getItem("externalProviders")
             .then(function(externalProviders){
                 //if key was not present, value will be 'undefined'
                 if (externalProviders) {
                     //show login page
                     _render.call(this, JSON.parse(externalProviders));

                  
                 } else {
                     //get social logins list and render the view
                     this.getExternalLogins().then(function(availablelogins){
                         cdStorage.setItem("externalProviders", availablelogins);
                         return availablelogins;
                     })
                     .then(_render.bind(this));
                 }
             }.bind(this));


            return this._deferred.promise;
    
        },
        events: {
            'click #btn-facebook': 'externalLogin',
            'click #btn-google': 'externalLogin',
            'click #btn-twitter': 'externalLogin',
            'click #signUp' : 'navigate',
            'click #forgetPassword' : 'navigate',
            'submit #loginForm': 'signIn'
        },

        navigate : function(event){
            event.preventDefault();
            var id = event.target.id;

            if(id=="signUp")
                this.goToSignUp();
            else if(id == "forgetPassword")
                this.goToForgetPassword();

        },
        goToSignUp:function(){
           
            viewFactory().signUp("", this._deferred, this._containerId,this._vm);
        },

        goToForgetPassword:function(){
        
            var userEmail = this.$el.find("Email").val();
            viewFactory().forgotPassword(userEmail, this._deferred, this._containerId, this._vm);
        },
        goToRegisterExternalLogin: function(externalLoginData){

            viewFactory().registerExternalLogin(externalLoginData, this._deferred, this._containerId, this._vm);
        },
        goToExternalLoginLink: function(externalLoginData)
        {
            viewFactory().externalLoginLink(externalLoginData, this._deferred, this._containerId, this._vm);
        },

        externalLogin: function (event) {
            event.preventDefault();
            var url = $(event.currentTarget).attr("url");
            
            this.socialLogin(config.domain + url);
        },

        signIn: function (event) {
            event.preventDefault();
            this.resetErrorMessage();
            this.disableSubmitButton();
            var self = this;
            var loginUserBindingModel = {
                userName: $("#Email").val(),
                password: $("#Password").val(),
                siteId: config.prpSiteId,
                clientId: config.clientId,
                apiUser: config.apiUser,
                hashPw: config.hashPw1
            };
            $.ajax({
                type: "POST",
                url: config.domain + config.apiURL + config.localLogin,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(loginUserBindingModel)
            })
                .done(function (resp) {
                    if (resp.status != 200) {

                        if (resp.status == 407 || resp.statusMsg === 'User not activated') {
                            var userEmail = loginUserBindingModel.userName;
                            //show 'ActivateAccount' view
                            viewFactory().activateAccount(userEmail, this._deferred, this._containerId, this._vm);
                        } else
                            this.showErrorMessage(resp.statusMsg);
                    } else
                        this.loginSuccess(resp.data);
                  

                 

                }.bind(this))
                .fail(function (error) {
                    if (error.status == 500)
                        this.showErrorMessage(config.internalServerErrorMessage);
                    else
                        this.showErrorMessage(config.generalLoginErrorMessage);
                }.bind(this))
                .always(function(){
                    this.enableSubmitButton();
                }.bind(this))
            

             
        },
        getExternalLogins: function() {
            var deferred = config.promiseProvider()
            $.get(config.domain + config.apiURL + config.externalLogins + "?returnurl=" + config.returnURL + encodeURIComponent("#origin="+window.location.origin)+"&siteid=" + config.prpSiteId + "&clientid=" + config.clientId + "&generatestate=true")
                .success(function (data) { deferred.resolve(data); })
                .error(function (data) { deferred.reject(data); });
            return deferred.promise;
        },
        socialLogin: function (url) {
            var windowConfig ={
                width: 640,
                height:600,
                windowName:"External Login"
            };

            PromiseWindow.open(url,windowConfig)
                .then(function(externalLoginData){
                    //external login success, 
                    if (externalLoginData) {
                        if (externalLoginData.requestLink.toLowerCase() === 'true') {
                            this.goToExternalLoginLink(externalLoginData);
                        }
                        else if (externalLoginData.has_registered === 'true') {
                            var loginData = {
                                userName: externalLoginData.userName,
                                accessToken: externalLoginData.access_token
                            };
                            this.loginSuccess(loginData);
                        } else {
     
                            this.goToRegisterExternalLogin(externalLoginData);
                          
                        }
                    }
                }.bind(this), function(error){
                    //ignore the promise window close value
                });


     
        },
        loginSuccess: function(data){
            // drop the returned token for gul.hiprewards.com
            cdStorage.setItem(config.access_token_key, data);

        
            // set the dimension1 with the user email now that the user is logged in.
            var usertoken = data;
            if (window.ga) {
                window.ga('set', 'dimension1', usertoken["userName"]);
                window.ga('set', '&uid', usertoken["userName"]); // Set the user ID using signed-in user_id.
            }


            this._deferred.resolve(data);
        },

    });



