import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";



import passwordForgotTemplate from "../templates/gul.password-forget.template.html!text"
import passwordForgotModel from "../model/gul.password-forgot.model.js";

import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"

export default backbone.View.extend({
    id: "password-forget",
    model: new passwordForgotModel(),
    initialize: function (userEmail, deferred, containerId,vm) {
        // This hooks up the validation
        backbone.Validation.bind(this);
        this._deferred = deferred;
        this._containerId = containerId;
        this._userEmail = userEmail;
        this._currentCaptchaId;
        this._vm = vm;
    },
    remove: function () {
        // Remove the validation binding
        backbone.Validation.unbind(this);
        return backbone.View.prototype.remove.apply(this, arguments);
    },
    render: function () {
        // Compile the external template file using underscore
        var template = _.template(passwordForgotTemplate);
        this.$el.html(template);

        $(this._containerId).append(this.el);
        //clear the previouse view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;

        if(typeof(grecaptcha) !== "undefined"){
            var captchaContainer = this.$el.find('#recaptcha');
            
            this._currentCaptchaId =  grecaptcha.render(captchaContainer[0], {
                'sitekey': config.recaptchaPublicKey
            });
        } else{
            // grecaptcha.reset(this._currentCaptchaId);
            this.showErrorMessage("failed to load recaptcha");
            this.disableSubmitButton();
        }

        


        return this._deferred.promise;
        

    },
    events: {
        'submit #form-password-forgot': 'sendEmail',
        'click #btnBack': 'goToSignIn',
        'click #signIn' : 'goToSignIn'
    },
    isCaptchaValid: function (value, form) {
        if (value.length < 100) {
            form.addClass('has-error');
            form.find('.help-block').removeClass('hidden');
            return false;
        } else {
            form.removeClass('has-error');
            form.find('.help-block').addClass('hidden');
            return true;
        }
    },
    goToSignIn: function(event)
    {
        event.preventDefault();
        viewFactory().signIn(this._signUpUserEmail, this._deferred, this._containerId, this._vm);
    },
    sendEmail: function (ev) {
        ev.preventDefault();
        this.disableSubmitButton();
        this.resetErrorMessage();
        var data = $('#form-password-forgot').serializeObject();
        this.model.set(data);
        if (this.model.isValid(true)) {
            var captchaValue = this.$el.find(".g-recaptcha-response").val();
            var captchaForm = this.$el.find("#recaptchaForm");
            if (this.isCaptchaValid(captchaValue, captchaForm))
            {
                var passwordForgotBindingModel = {
                    siteId: config.prpSiteId,
                    siteName: config.siteName,
                    clientId: config.clientId,
                    email: $("#Email").val(),
                    captchaResponse: captchaValue,
                    redirectUrl: config.passwordResetRedirectUrl()
                };

          
                $.ajax({
                    url: config.domain + config.apiURL + config.forgetPassword,
                    type: "Post",
                    data: JSON.stringify(passwordForgotBindingModel),
                    contentType: 'application/json; charset=utf-8'
                })
                    .done(function(resp) {
                        if (resp.status == 200) {
                            this.$el.find("#PostReset").toggleClass("content-hide content-show");
                            this.$el.find("#PreReset").toggleClass("content-hide content-show");
                        } else {
                            this.showErrorMessage(resp.statusMsg);
                        }
                    }.bind(this))
                    .fail(function(error) {
                        this.showErrorMessage(config.passwordResetFailedErrorMessage);
                    }.bind(this))
                    .always(function() {
                        this.enableSubmitButton();
                        if(typeof(grecaptcha) !== "undefined")
                            grecaptcha.reset(this._currentCaptchaId);
                    }.bind(this));
            }
        } else {
            this.showErrorMessage(config.invalidEmailErrorMessage);
            if(typeof(grecaptcha) !== "undefined")
                grecaptcha.reset(this._currentCaptchaId);
        }
    }

});