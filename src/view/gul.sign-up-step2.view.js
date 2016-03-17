import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import signUpStep2Template from "../templates/gul.sign-up-step2.template.html!text";
import signUpStep2Model from "../model/gul.sign-up-step2.model.js";


import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"


export default backbone.View.extend({
    id: "sign-up-step2",
    model: new signUpStep2Model(),
    events: {
        'submit #form-signup2': 'signUp',
        'click #btnBack': 'goToSignUp'
            
    },
    initialize: function (signUpUserEmail, deferred, containerId, vm) {
        // This hooks up the validation
        backbone.Validation.bind(this);

        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
        this._signUpUserEmail = signUpUserEmail;
    },
    goToSignUp:function(event){
        event.preventDefault();
        viewFactory().signUp(this._signUpUserEmail, this._deferred, this._containerId, this._vm);
    },

    remove: function () {
        // Remove the validation binding
        backbone.Validation.unbind(this);
        return backbone.View.prototype.remove.apply(this, arguments);
    },
    render: function () {
        // Using Underscore we can compile our template with data
        var template = _.template(signUpStep2Template);

        // Append our compiled template to this Views "el"
          
        this.$el.html(template({ email:  this._signUpUserEmail  }));
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
        }
        else{
            // grecaptcha.reset(this._currentCaptchaId);
            this.showErrorMessage("failed to load recaptcha");
            this.disableSubmitButton();
        }

    

        return this._deferred.promise;
        
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

    signUp: function (e) {
        e.preventDefault();
        this.resetErrorMessage();
        var data = $('#form-signup2').serializeObject();
        this.model.set(data);
        // Check if the model is valid before saving
        if(typeof(grecaptcha) !== "undefined"){
            if (this.model.isValid(true)) {
                // Check for recaptcha response
            
                var captchaValue = this.$el.find(".g-recaptcha-response").val();
                var captchaForm = this.$el.find("#recaptchaForm");
                if (this.isCaptchaValid(captchaValue, captchaForm)) {
                    this.register(captchaValue);
                }
            
            }
        }
    },
    register: function (captchaValue) {
         
        this.disableSubmitButton();
        var password = $("#Password").val();
        var confirmPassword = $("#ConfirmPassword").val();     // md5 hash the password here so it is not sent as plain text
        var recaptchaResponse = captchaValue;
        var firstName = $("#FirstName").val();
        var lastName =$("#LastName").val(); 
        var email = $("#Email").val();
        var gender = $("#Gender").val();
        var country = $("#Country").val();
        var province = $("#Province").val();
        var city = $("#City").val();
        var postalCode = $("#PostalCode").val();
        var termsConditions = $("#terms").val();
        var optIn = $("#OptIn").prop('checked');

        //var ageRange = $("#AgeRange").val();
        var day = $("#Day").val();
        var month = $("#Month").val();
        var year = $("#Year").val();
        var dob = new Date(year, month, day);

        var metaArray = [];
        metaArray.push({ "Key": "Gender", "Value": gender });
        //metaArray.push({ "Key": "AgeRange", "Value": ageRange });
        metaArray.push({ "Key": "DateOfBirth", "Value": dob });
        metaArray.push({ "Key": "Country", "Value": country });
        metaArray.push({ "Key": "Province", "Value": province });
        metaArray.push({ "Key": "City", "Value": city });
        metaArray.push({ "Key": "PostalCode", "Value": postalCode });
        metaArray.push({ "Key": "terms", "Value": termsConditions });
   
        var registerData = {
            siteId: config.prpSiteId,  // provided by the token, depeneds on which site this widget is being called
            siteName: config.siteName,
            userName: email,
            lastName: lastName,
            firstName: firstName,
            password: confirmPassword,
            email: email,
            optIn: optIn,  // agree to terms checkbox
            userMetaData: metaArray,         // store user address
            clientId: config.clientId,  // provided by the token, depeneds on which site this widget is being called
            requireVerification: true, // this combined with IsQA determines if user is active or not
            isQA: false,      // this combined with IsQA determines if user is active or no
            recaptchaResponse: recaptchaResponse,  // used for recaptcha server verification
            redirectUrl: config.passwordResetRedirectUrl(),
            loginType: 1
        };

        $.ajax({
            type: "POST",
            url: config.domain + config.apiURL + config.registerUser,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(registerData)
        }).done(function(resp) {
            if (resp.status == 201) {
                this.onRegisterSuccess(registerData.Email);
            } else {
                this.onRegisterFailed(resp.statusMsg);
            }
        }.bind(this))
          .fail(function(error) {
              this.onRegisterFailed(config.userRegisterErrorMessage);
          }.bind(this))
            .always(function() {
                this.enableSubmitButton();
            }.bind(this));
               
    },
    onRegisterSuccess: function () {
        // user registration is completed, show confirmation page
        //this.goTo('SignUpPost');

    },
    onRegisterFailed: function (error) {
        // $('#gul-register.error-msg').html(error);
        this.showErrorMessage(error);

        if(typeof(grecaptcha) !== "undefined")
            grecaptcha.reset(this._currentCaptchaId);
    },

    goToSignUpPost:function(){
        this.remove();
        viewFactory().SignUpPost(this._signUpUserEmail,  this._deferred, this._containerId,this._vm);
    }
});
