import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

import activateAccountTemplate from "../templates/gul.activate-account.template.html!text"
import activatingAccountTemplate from "../templates/gul.activating-account.template.html!text"
import accountActivatedTemplate from "../templates/gul.account-activated.template.html!text"

import PromiseWindow from "../lib/promise-window.js";
import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"

import {getUrlVars} from "../common.js";


export default backbone.View.extend({
    id:"activate-account",
    initialize: function (userEmail, deferred, containerId, vm) {
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
        this._signUpUserEmail = userEmail;
        this._verificationToken = getUrlVars().token;
    },
    render: function() {
        // Compile the external template file using underscore
        this.tryActivateAccount().then(this.showAccountActivatedView.bind(this),
            function(error) {
                this.showActivateAccountView(this._signUpUserEmail, error);
            }.bind(this)
        );
        return this._deferred.promise;
    },
    events: {
        'submit #form-activate-account': 'resendEmailToActivate',
        'click #signIn': 'goToSignIn',
    },
    goToSignIn: function(event)
    {
        event.preventDefault();
        viewFactory().signIn(this._signUpUserEmail, this._deferred, this._containerId, this._vm);
    },
    resendEmailToActivate: function(ev) {
        ev.preventDefault();

        //call API to resend email   
        this.disableSubmitButton();

        var accountActivationModel = {
            siteId: config.prpSiteId,
            siteName: config.siteName,
            clientId: config.clientId,
            email: $("#Email").val(),
            redirectUrl: config.accountActivationRedirectUrl()
        };

        $.ajax({
                url: config.domain + config.apiURL + config.requestActivate,
                type: "Post",
                data: JSON.stringify(accountActivationModel),
                contentType: 'application/json; charset=utf-8'
            }).done(function(resp) {
                if (resp.status == 200) {
                    $('#gul-activate-account-message').html(config.activationEmailSent).removeClass('error-msg');
                } else {
                    this.showErrorMessage(resp.statusMsg);
                }
            }.bind(this))
            .fail(function(error) {
                this.showErrorMessage(config.activationEmailErrorMessage);
            }.bind(this)).always(function() {
                this.enableSubmitButton();
            }.bind(this));
    },
    showActivateAccountView: function(userEmail, errorMsg) {
        var template = _.template(activateAccountTemplate);
        this.$el.html(template({ userEmail: userEmail, errorMsg: errorMsg }));
        $(this._containerId).append(this.el);
    },
    showAccountActivatedView: function() {
        var template = _.template(accountActivatedTemplate);
        this.$el.html(template);
        $(this._containerId).append(this.el);
    },
    showAccountActivatingView: function() {
        var template = _.template(activatingAccountTemplate);
        this.$el.html(template);
        $(this._containerId).append(this.el);
    },
    tryActivateAccount: function() {
        var mydefer = config.promiseProvider();
        this.showAccountActivatingView();
        if (this._verificationToken) {
            $.ajax({
                url: config.domain + config.apiURL + config.activate + "?token=" + this._verificationToken,
                type: "Get",
                contentType: 'application/json; charset=utf-8',
            }).done(function(resp) {
                if (resp.status != 200) {
                    mydefer.reject(resp.statusMsg);
                } else
                    mydefer.resolve(resp.statusMsg);
            }).fail(function() {
                mydefer.reject(config.accountActivationErrorMessage);
            });
        } else {
            mydefer.reject('');
        }
        return mydefer.promise;
    }
});
