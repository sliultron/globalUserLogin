import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

import cdStorage from  "../lib/cdStorage.js";
import externalLoginLinkTemplate from "../templates/gul.external-login-link.template.html!text"

import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"


export default backbone.View.extend({
    id:"external-login-register",
    initialize: function (externalLoginData, deferred, containerId, vm) {
        this._externalLoginData = externalLoginData;
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
        this.externalLoginLinkSuccessCallback = function () { alert('loginSuccessCallback'); }
    },
    render: function () {
        // Compile the external template file using underscore
        var template = _.template(externalLoginLinkTemplate);
        this.$el.html(template({
            userEmail: this._externalLoginData.email,
            firstName: this._externalLoginData.firstname,
            lastName: this._externalLoginData.lastname,
            termAndConditions: config.links.termAndConditions
        }));

        $(this._containerId).append(this.el);
        if (this._externalLoginData.provider == 'Facebook' || this._externalLoginData.provider == 'Google')
            this.$el.find("#email").attr('disabled', 'disabled');
        
        //clear the previouse view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;

        return this._deferred.promise;
    },
    events:
    {
        'click #btn-link-external': 'LinkExternal',
        'click #btn-logout': 'Logout'
    },

    LinkExternal: function (event) {//link external used to link users logging in with external accounts with emails that is already registered with hip account
        event.preventDefault();
        this.resetErrorMessage();
        if ($("#Password").val() == "") {
            this.showErrorMessage("Please enter the password for your existing account.");
            return;
        }
        var externalUserBindingModel = {
            siteId: config.prpSiteId,
            clientId: config.clientId,
            userName: this._externalLoginData.userName,
            email: this._externalLoginData.email,
            loginType: this._externalLoginData.provider,
            externalUserId: this._externalLoginData.userName,
            accessToken: this._externalLoginData.access_token,
            externalAccessTokenSecret: this._externalLoginData.secret,
            password: $("#Password").val()
        };
        $.ajax({
            method: 'POST',
            url: config.domain + config.apiURL + config.externalLink,
            data: JSON.stringify(externalUserBindingModel),
            dataType: "json",
            contentType: "application/json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + this._externalLoginData.access_token);
            }.bind(this)
        })
            .done(function (resp) {
                if (resp.status != 200)
                    this.onLinkFailed(resp.statusMsg);
                else
                    this.onLinkSuccess(resp.data);

            }.bind(this))
            .fail(function (error) {
                if (error.status == 500)
                    this.onLinkFailed(config.internalServerErrorMessage);
                else
                    this.onLinkFailed(config.generalLoginErrorMessage);
            }.bind(this));
    },
    Logout: function() {
        cdStorage.removeItem(config.access_token_key);
        this.goToSignIn();
    },
    onLinkSuccess: function (data) {
        this.performPostExternalLoginFunctions({
            accessToken: data.accessToken,
            userName: data.userName
        });

        // set the dimension1 with the user email now that the user is logged in.
        if (window.ga) {
            window.ga('set', 'dimension1', data.userName);
            window.ga('set', '&uid', data.userName); // Set the user ID using signed-in user_id.
        }
        this.externalLoginLinkSuccessCallback(data);

    },
    onLinkFailed: function (error) {
        //$('#gul-external-register.error-msg').html(error);
        this.showErrorMessage(error);
    },
    performPostExternalLoginFunctions: function (data) {
        // drop the returned token for gul.hiprewards.com
        cdStorage.setItem(config.access_token_key, data);
    },
    goToSignIn: function goToSignIn() {
        this.remove();
        event.preventDefault();
        viewFactory().signIn("", this._deferred, this._containerId, this._vm);
    },
});
