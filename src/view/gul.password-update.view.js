import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";


import passwordUpdateTemplate from "../templates/gul.password-update.template.html!text"

import cdStorage from  "../lib/cdStorage.js";
import PromiseWindow from "../lib/promise-window.js";

import passwordUpdateModel from "../model/gul.password-update.model.js";


import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"


export default backbone.View.extend({
    id:"password-update",
    model: new passwordUpdateModel(),
    initialize:function(userEmail, deferred, containerId,vm){
        // This hooks up the validation
        backbone.Validation.bind(this);
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
        this._signInUserEmail = userEmail;
        this._authData;
    },
    render: function () {
        // Compile the external template file using underscore
        var template = _.template(passwordUpdateTemplate);
        this.$el.html(template);
        $(this._containerId).append(this.el);

        //clear the previous view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;

        cdStorage.getItem(config.access_token_key)
            .then(function(value) {
                if (value) {
                    this._authData = JSON.parse(value);
                } else {
                    //redirect to the sign in view
                    this.goToSignIn();
                }

            }.bind(this));
        return this._deferred.promise;
    },
    events: {
        'submit #form-password-update': 'UpdatePassword'
    },
    remove: function () {
        // Remove the validation binding
        backbone.Validation.unbind(this);
        return backbone.View.prototype.remove.apply(this, arguments);
    },
    UpdatePassword: function(e) {
        //initial step to handle profile update event
        e.preventDefault();
        //disable update button
        this.disableSubmitButton();
        this.resetErrorMessage();

        var data = $('#form-password-update').serializeObject();
        this.model.set(data);

        // Check if the model is valid before saving
        if (this.model.isValid(true)) {
            this.completePasswordUpdate();
        } else {
            this.enableSubmitButton();
        }
    },
    completePasswordUpdate: function () {
        var passwordUpdateData =
        {
            CurrentPassword: $("#CurrentPassword").val(),
            Password: $("#NewPassword").val(),
            ConfirmPassword: $("#ConfirmPassword").val(),
            ClientId: config.clientId
        };
        if (this._authData) {
            $.ajax({
                    url: config.domain + config.apiURL + config.updatePassword,
                    type: "POST",
                    data: JSON.stringify(passwordUpdateData),
                    contentType: 'application/json; charset=utf-8',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + this._authData.accessToken);
                    }.bind(this)
                })
                .done(function(resp) {
                    if (resp.status != 200)
                        this.onLoginFailed(resp.statusMsg);
                    else
                        this.onLoginSuccess(resp.data);
                }.bind(this))
                .fail(function(error) {
                    if (error.status == 500)
                        this.onLoginFailed(config.internalServerErrorMessage);
                    else
                        this.onLoginFailed(config.generalPasswordUpdateErrorMessage);
                }.bind(this))
                .always(function() {
                    this.enableSubmitButton();
                }.bind(this));
        }
    },
    onLoginSuccess: function() {
        $('#gul-password-update-message').html(config.passwordUpdatedMessage);
    },
    onLoginFailed: function(error) {
        this.showErrorMessage(error);
    }
});
