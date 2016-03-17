import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";


import signUpModel from "../model/gul.sign-up.model.js";
import signUpTemplate from "../templates/gul.sign-up.template.html!text";
import config from "../gulConfig.js";

import viewFactory from "./viewFactory.js"


export default backbone.View.extend({
    id:"sign-up",
    model: new signUpModel(),
    initialize: function (userEmail, deferred, containerId, vm) {
        // This hooks up the validation
        backbone.Validation.bind(this);
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
        this._signUpUserEmail = userEmail;
    },
    remove: function () {
        // Remove the validation binding
        backbone.Validation.unbind(this);
        return backbone.View.prototype.remove.apply(this, arguments);
    },
    render: function () {
        // Compile the external template file using underscore
        var template = _.template(signUpTemplate);
        this.$el.html(template({email: this._signUpUserEmail}));
        $(this._containerId).append(this.el);

        //clear the previouse view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;


        return this._deferred.promise;

    },
    events: {
        'submit #form-user-signup': 'signUp',
        'click #signIn': 'goToSignIn',
        'click #btnBack': 'goToSignIn'
    },
    goToSignIn: function(event)
    {
        event.preventDefault();
        viewFactory().signIn(this._signUpUserEmail, this._deferred, this._containerId, this._vm);
    },
    signUp: function (ev) {
        ev.preventDefault();
        this.disableSubmitButton();
        this.resetErrorMessage();
        var data = $('#form-user-signup').serializeObject();
        this.model.set(data);

        if (this.model.isValid(true)) {
            var signUpUserEmail = $("#Email").val();
            $.ajax({
                url: config.domain + config.apiURL + config.validateEmail + '?emailAddress=' + signUpUserEmail + '&siteId=' + config.prpSiteId + '&clientId=' + config.clientId,
                type: "Get",
            }).done(function(resp) {
                if (resp.status == 404) {
                    this.onRegisterEmailSuccess(signUpUserEmail);
                } else {
                    this.onRegisterEmailFailed(config.emailTakenErrorMessage);
                }
            }.bind(this))
                .fail(function() {
                    this.onRegisterEmailFailed(config.ajaxRequestFailed);
                        
                }.bind(this))
                
                .always(function() {
                    this.enableSubmitButton();
                }.bind(this));
         
        
        } else {
            this.onRegisterEmailFailed(config.invalidEmailErrorMessage);
        }
    },
    onRegisterEmailSuccess: function (signUpUserEmail) {
        //navigate to SignUp2
        this.remove();
        viewFactory().signUpStep2(signUpUserEmail,  this._deferred, this._containerId,this._vm);

    },
    onRegisterEmailFailed: function (error) {
        //$("#gul-signup.error-msg").html(error);
        this.showErrorMessage(error);
    },

});
