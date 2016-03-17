import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";


import cdStorage from  "../lib/cdStorage.js";
import PromiseWindow from "../lib/promise-window.js";
import passwordResetTemplate from "../templates/gul.reset-password.template.html!text"
import passwordResetModel from "../model/gul.reset-password.model.js";
import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"

import {getUrlVars} from "../common.js";

export default backbone.View.extend({
    id:"password-update",
    model: new passwordResetModel(),
    render: function () {
        // Compile the external template file using underscore
        var template = _.template(passwordResetTemplate);
        this.$el.html(template);
        $(this._containerId).append(this.el);

        //clear the previous view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;

        return this._deferred.promise;
    },
    events: {
        'submit #form-reset-password': 'reset',
        'click #signIn': 'goToSignIn',
        'click #btnSignIn': 'goToSignIn'
    },
    goToSignIn: function(event)
    {
        event.preventDefault();
        viewFactory().signIn(this._signUpUserEmail, this._deferred, this._containerId, this._vm);
    },
    initialize: function (userEmail, deferred, containerId, vm) {
        // This hooks up the validation
        backbone.Validation.bind(this);
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
        this._signUpUserEmail = userEmail;
        this._verificationToken = getUrlVars().token;
    },
    remove: function () {
        // Remove the validation binding
        backbone.Validation.unbind(this);
        return backbone.View.prototype.remove.apply(this, arguments);
    },
    reset: function (ev) {
        ev.preventDefault();
        this.disableSubmitButton();
        var data = $('form').serializeObject();
        this.model.set(data);
        if (this.model.isValid(true)) {
            var passwordResetBindingModel =
            {
                UserEmail: $("#EmailAddress").val(),
                Password: $("#Password").val(),
                ConfirmPassword: $("#ConfirmPassword").val(),
                VerificationToken: this._verificationToken,
                ClientId: config.clientId
            };
            var self = this;
            $.ajax({
                url: config.domain + config.apiURL + config.resetPassword,
                type: "Post",
                data: JSON.stringify(passwordResetBindingModel),
                contentType: 'application/json; charset=utf-8',
            }).done(function (resp) {
                    if (resp.status != 200) {
                        $('#gul-reset-password-message').html(resp.statusMsg).addClass('error-msg');
                    } else {
                        $(".reset-password-form").hide();
                        $(".reset-password-complete").show();
                    }
                }).fail(function (error) {
                $('#gul-reset-password-message').html(config.passwordResetFailedErrorMessage).addClass('error-msg');;
            })
            .always(function () {
                self.enableSubmitButton();
            });
        } else {
            this.enableSubmitButton();
        }
    },
});