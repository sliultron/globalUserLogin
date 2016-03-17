import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";



import profileUpdateTemplate from "../templates/gul.profile-update.template.html!text"
import profileUpdateModel from "../model/gul.profile-update.model.js";

import cdStorage from  "../lib/cdStorage.js";
import {getUserMetaDataValue} from "../common.js";
import config from "../gulConfig.js";
import viewFactory from "./viewFactory.js"
import "jquery.cookie";
import zippopotamus from  "../lib/zippopotamus.js";



export default backbone.View.extend({
    id:"profile-update",
    model: new profileUpdateModel(),
    initialize:function(userEmail, deferred, containerId,vm){
        // This hooks up the validation
        backbone.Validation.bind(this);
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;
        this._signInUserEmail = userEmail;
        this._authData;  
        
        cdStorage.getItem(config.access_token_key)
            .then(function(value) {
            if (value) {
                this._authData = JSON.parse(value);

                $.ajax({
                        type: "GET",
                        url: config.domain + config.apiURL + config.retrieveUser,
                        data: { EmailAddress: this._authData.userName },
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("Authorization", "Bearer " + this._authData.accessToken);
                        }.bind(this)
                    })
                    .done(function(resp) {
                        if (resp.status == 200) {
                            $("#Email").val(resp.data.email);
                            $("#LastName").val(resp.data.lastName);
                            $("#FirstName").val(resp.data.firstName);
                            $("#Gender").val(getUserMetaDataValue(resp.data.userMetaData, "gender"));
                            $("#AgeRange").val(getUserMetaDataValue(resp.data.userMetaData, "ageRange"));
                            $("#Country").val(getUserMetaDataValue(resp.data.userMetaData, "country"));
                            $("#Province").val(getUserMetaDataValue(resp.data.userMetaData, "province"));
                            $("#City").val(getUserMetaDataValue(resp.data.userMetaData, "city"));
                            $("#PostalCode").val(getUserMetaDataValue(resp.data.userMetaData, "postalCode"));
                            $("#OptIn").prop('checked', resp.data.optIn);
                            var dob = new Date(getUserMetaDataValue(resp.data.userMetaData, "DateOfBirth"));
                            $("#Day").val(dob.getDate());
                            $("#Month").val(dob.getMonth());
                            $("#Year").val(dob.getFullYear());
                        } else {
                            this.showErrorMessage(resp.statusMsg);
                            }
                    })
                    .fail(function(error) {
                            this.showErrorMessage(config.userProfileRetrieveErrorMessage);
                            });
                    } else {
                //redirect to the sign in view
               this.goToSignIn();
            }
         
            }.bind(this));
    },
    remove: function () {
        // Remove the validation binding
        backbone.Validation.unbind(this);
        return backbone.View.prototype.remove.apply(this, arguments);
    },
    render: function () {
        // Compile the external template file using underscore
        var template = _.template(profileUpdateTemplate);
        this.$el.html(template({
            enableAddressCollection: config.enableAddressCollection,
            enableBirthDayCollection: config.enableBirthDayCollection
        }));
        $(this._containerId).append(this.el);

        //clear the previous view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;


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

      
        
        return this._deferred.promise;
    },
    events: {
        'submit #form-update-profile': 'updateProfile'
    },
    goToSignIn: function(){
        this.remove();
        viewFactory().signIn("", this._deferred, this._containerId, this._vm);
    },
    updateProfile: function (e) {
        //initial step to handle profile update event
        e.preventDefault();
        //disable update button
        this.disableSubmitButton();
        this.resetErrorMessage();

        var data = $('#form-update-profile').serializeObject();
        this.model.set(data);

        // Check if the model is valid before saving
        if (this.model.isValid(true)) {
            this.completeUpdateProfile();
        }
        else {
            this.enableSubmitButton();
        }
    },
    completeUpdateProfile: function () {
        var inputGender = $("#Gender").val();
        var inputMarketingOptIn = $("#MarketingOptIn").prop('checked');
        var inputFirstName = $("#FirstName").val();
        var inputLastName = $("#LastName").val();
        var day = (!config.enableBirthDayCollection) ? 1 : $("#Day").val();
        var month = $("#Month").val();
        var year = $("#Year").val();
        var dob = new Date(year, month, day);
        var age = this.getAge(dob);
        if (age < 13) {
            $.cookie(config.age_check_key, 'false');
            this.onUpdateFailed(config.ageCheckErrorMessage);
            this.enableSubmitButton();
            return;
        }
        //var inputAgeRange = $("#AgeRange").val();

        var metaArray = [];
        metaArray.push({ "Key": "FirstName", "Value": inputFirstName });
        metaArray.push({ "Key": "LastName", "Value": inputLastName });
        metaArray.push({ "Key": "Gender", "Value": inputGender });
        metaArray.push({ "Key": "MarketingOptIn", "Value": inputMarketingOptIn });
        metaArray.push({ "Key": "DateOfBirth", "Value": dob });
        //metaArray.push({ "Key": "AgeRange", "Value": inputAgeRange });


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

        var userUpdateData = {
            LastName: inputFirstName,
            FirstName: inputFirstName,
            UserMetaData: metaArray,
            ClientId: config.clientId
        };

        if (this._authData) {
                $.ajax({
                    url: config.domain + config.apiURL + config.updateProfile,
                    type: "PUT",
                    data: JSON.stringify(userUpdateData),
                    contentType: 'application/json; charset=utf-8',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + this._authData.accessToken);
                    }.bind(this)
                })
                .done(function (resp) {
                    if (resp.status != 200)
                        this.onUpdateFailed(resp.statusMsg);
                    else
                        this.onUpdateSucccess();
                }.bind(this))
                .fail(function (error) {
                    if (error.status == 500)
                        this.onUpdateFailed(config.internalServerErrorMessage);
                    else
                        this.onUpdateFailed(config.generaluserProfileUpdateErrorMessage);
                }.bind(this))
                .always(function () {
                    this.enableSubmitButton();
                }.bind(this));
            }
        
    },
    onUpdateSucccess: function () {
        $('#gul-profile-message').html(config.profileUpdatedMessage);
    },
    onUpdateFailed: function (error) {
        this.showErrorMessage(error);
    },
    getAge: function (birthday) {
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
});