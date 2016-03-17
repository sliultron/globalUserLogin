import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import registerTemplate from "../templates/gul.external-login-register.template.html!text"
import config from "../gulConfig.js";
import cdStorage from  "../lib/cdStorage.js";
import viewFactory from "./viewFactory.js"
import externalRegisterModel from "../model/gul.external-login-register.model.js";
import zippopotamus from  "../lib/zippopotamus.js";
import "jquery.cookie";

export default backbone.View.extend({
    id:"external-login-register",
    model: new externalRegisterModel(),
    initialize: function (externalLoginData, deferred, containerId, vm) {
        this._externalLoginData = externalLoginData;
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
 
    
    },
    render: function () {
        // Compile the external template file using underscore
        var template = _.template(registerTemplate);
        this.$el.html(template({
            userEmail: this._externalLoginData.email,
            firstName: this._externalLoginData.firstname,
            lastName: this._externalLoginData.lastname,
            gender: this._externalLoginData.gender,
            enableAddressCollection: config.enableAddressCollection,
            enableBirthDayCollection: config.enableBirthDayCollection,
            termAndConditions: config.links.termAndConditions,
            customOptIns: config.customOptIns
        }));

        $(this._containerId).append(this.el);
        if (this._externalLoginData.provider === "Facebook" || this._externalLoginData.provider === "Google") {
            if (this._externalLoginData.email !== "") {
                this.$el.find("#Email").attr('readonly', 'readyonly');
                this.$el.find("#Email").addClass("disabled");
            }
        }
            

        if (this._externalLoginData.gender) {
            var gender = this._externalLoginData.gender;
            $('[name=Gender] option').filter(function () {
                return ($(this).text().toLowerCase() === gender); //To select a gender
            }).prop('selected', true);
        }

        if (config.enableAddressCollection && config.enableAddressValidation) {
            $('#PostalCode, #City, #Province').change(function () {
                var postal = $("#PostalCode").val();
                if (postal === "")
                    return;
                var country = $("#Country").val();
                var province = $("#Province").val();
                var city = $("#City").val();
                zippopotamus(postal, function (countryC, state, state_short, cityC) {
                    $("#Country+.help-block, #Province+.help-block, #City+.help-block, #PostalCode+.help-block").hide();
                    if (countryC  && (countryC.toLowerCase() !== country.toLowerCase() || province.toLowerCase() !== state_short.toLowerCase() || cityC.toLowerCase() !== city.toLowerCase())) {
                        if (countryC.toLowerCase() !== country.toLowerCase()) {
                            $("#Country+.help-block").show();
                            $("#Country+.help-block").html("Invalid country selected for the zip entered.");
                        }
                        if (province.toLowerCase() !== state_short.toLowerCase()) {
                            $("#Province+.help-block").show();
                            $("#Province+.help-block").html("Invalid state selected for the zip entered.");
                        }
                        if (cityC.toLowerCase() !== city.toLowerCase()) {
                            $("#City+.help-block").show();
                            $("#City+.help-block").html("Invalid city selected for the zip entered.");
                        }
                       
                        this.disableSubmitButton();
                    } else {
                        $("#Country+.help-block, #Province+.help-block, #City+.help-block, #PostalCode+.help-block").html();
                        $("#Country+.help-block, #Province+.help-block, #City+.help-block, #PostalCode+.help-block").hide();
                        this.enableSubmitButton();
                    }
                }.bind(this))
                .error(function () {
                    $("#PostalCode+.help-block").show();
                    $("#PostalCode+.help-block").html("Invalid zip code entered.");
                    this.disableSubmitButton();
                }.bind(this));
            });

        }



        //clear the previouse view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;


        return this._deferred.promise;

    },
    events:
    {
        'submit #form-register-external': 'register',
        'click #btnBack': 'goToSignIn'
    },
    goToSignIn: function(event)
    {
        event.preventDefault();
        viewFactory().signIn(this._signUpUserEmail, this._deferred, this._containerId, this._vm);
    },
    register: function (e) {
        e.preventDefault();
        this.resetErrorMessage();
        var data = $('#form-register-external').serializeObject();
        this.model.set(data);
        // Check if the model is valid before saving
        if (this.model.isValid(true)) {

            // check custom optins
            if (!this.checkCustomOptIn()) {
                return;
            }

            this.RegisterExternal();
        }
    },
    RegisterExternal: function (event) {//register external method for user who logged in through social networks but not registered in GUL
       
        // check cookie first
        var ageCheck = $.cookie(config.age_check_key);
        if (ageCheck && ageCheck === 'false') {
            this.showErrorMessage(config.ageCheckErrorMessage);
            this.enableSubmitButton();
            return;
        }

        var firstName = $("#FirstName").val();
        var lastName = $("#LastName").val();
        var gender = $("#Gender").val();
        var marketingOptIn = $("#MarketingOptIn").prop('checked');
        var optIn = $("#OptIn").prop('checked');

        var day = (!config.enableBirthDayCollection) ? 1 : $("#Day").val();
        var month = $("#Month").val();
        var year = $("#Year").val();
        var dob = new Date(year, month, day);
        var age = this.getAge(dob);
        if (age < 13) {
            $.cookie(config.age_check_key, 'false');
            this.showErrorMessage(config.ageCheckErrorMessage);
            return;
        }
      
        var metaArray = [];
        metaArray.push({ "Key": "FirstName", "Value": firstName });
        metaArray.push({ "Key": "LastName", "Value": lastName });
        metaArray.push({ "Key": "Gender", "Value": gender });
        metaArray.push({ "Key": "DateOfBirth", "Value": dob });
        if (config.customOptIns && config.customOptIns.length > 0) {
            _.each(config.customOptIns, function (optin) {
                var val = $('#' + optin.id).prop('checked');
                metaArray.push({ "Key": optin.id, "Value": val });
            });
        }

        if (config.enableAddressCollection) {
            var country = $("#Country").val();
            var province = $("#Province").val();
            var city = $("#City").val();
            var postalCode = $("#PostalCode").val();
            metaArray.push({ "Key": "Country", "Value": country });
            metaArray.push({ "Key": "Province", "Value": province });
            metaArray.push({ "Key": "City", "Value": city });
            metaArray.push({ "Key": "PostalCode", "Value": postalCode });
        }

        var registerExternalBindingModel = {
            siteId: config.prpSiteId,
            siteName: config.siteName,
            userName: $("#Email").val(),
            firstName: firstName,
            lastName: lastName,
            email: $("#Email").val(),
            optIn: true,
            userMetaData: metaArray,
            clientId: config.clientId,
            requireVerification: false,
            isQa: false,
            loginType: this._externalLoginData.provider,
            externalUserId: this._externalLoginData.userName,
            accessToken: this._externalLoginData.access_token,
            externalAccessTokenSecret: this._externalLoginData.secret
        };



        $.ajax({
            method: 'POST',
            url: config.domain + config.apiURL + config.externalRegister,
            data: JSON.stringify(registerExternalBindingModel),
            dataType: "json",
            contentType: "application/json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + this._externalLoginData.access_token);
            }.bind(this)
        })
            .done(function (resp) {
                if (resp.status !== 200) {
                    if (resp.data) {
                        if (resp.data.requestLink === true) {
                            viewFactory().externalLoginLink(this._externalLoginData, this._deferred, this._containerId, this._vm);
                        }
                    } else {
                        this.showErrorMessage(resp.statusMsg);
                    }
                } else
                    this.onRegisterSuccess(resp.data);

            }.bind(this))
            .fail(function (error) {
                if (error.status === 500)
                    this.showErrorMessage(config.internalServerErrorMessage);
                else
                    this.showErrorMessage(config.generalLoginErrorMessage);
            }.bind(this));

    },
    onRegisterSuccess: function (data) {

        // drop the returned token for gul.hiprewards.com
        cdStorage.setItem(config.access_token_key, data);

        // set the dimension1 with the user email now that the user is logged in.
        var usertoken = data;
        if (window.ga) {
            window.ga('set', 'dimension1', data.userName);
            window.ga('set', '&uid', data.userName); // Set the user ID using signed-in user_id.
        }
    

        this._deferred.resolve(data);
    },
    getAge: function (birthday) {
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
    checkCustomOptIn: function () {
        var valid = true;
        if (config.customOptIns && config.customOptIns.length > 0) {
            _.each(config.customOptIns, function (optin) {
                var val = $('#' + optin.id).prop('checked');
                if (optin.isRequired === "true" && !val) {
                    this.showFieldErrors(optin.id, "This checkbox is required.");
                    valid = false;
                } else {
                    this.hideFieldErrors(optin.id);
                }
            }.bind(this));
        }
        return valid;
    },
    showFieldErrors: function (id, error) {
        var group = $('#' + id).closest('fieldset');
        group.addClass('has-error');
        group.find('.help-block').html(error).removeClass('hidden');
    },
    hideFieldErrors: function (id) {
        var group = $('#' + id).closest('fieldset');
        group.removeClass('has-error');
        group.find('.help-block').html('').addClass('hidden');
    }
  


});

