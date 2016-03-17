import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";
import "./lib/backbone-validation-amd.js"



 var config =  {
         appId: "00000000-0000-0000-0000-000000000000",
         clientId: 1,
         siteId: 2000,
         siteName: "Default Site",
         prpSiteId: 2000,
         domain: "https://gul.snipprewards.com:444",
         returnURL: "https://gul.snipprewards.com:444/content/externalLoginRedirect.html",
         crossdomainPagePath: "https://gul.snipprewards.com:444/content/cross_iframe.html",

        accountActivationRedirectUrl: function() {
            return window.location.href;
        },
        passwordResetRedirectUrl: function() {
            return window.location.href;
        },
        enableAddressCollection: false,
        enableAddressValidation: false,
        enableEmailVerification: false,
        enableBirthDayCollection: false,
        customOptIns: [{ "id": "MarketingOptIn", "copy": "Allow us to send you periodically promotions emails", "isRequired": "false" }],

        screenType: "default",
        logoutConfirmation: true,

        apiURL: "/api/v1/globaluser/",
        testEmail: "test070@test.com",
        testPassword: "Password@123.",

        enableReCAPTCHA: false,
        recaptchaPublicKey: '6LcUHQETAAAAAJp_UoLTj8mp8qNQ29SAZNoiqpuu',

        //gul web api configuration
        localLogin: 'local_login',
        retrieveUser: 'retrieve',
        externalRegister: 'registerexternal',
        updatePassword: 'updatePassword',
        updateProfile: 'update',
        validateEmail: 'check',
        registerUser: 'register',
        resetPassword: 'resetPassword',
        activate: 'activate',
        forgetPassword: 'forgetpassword',
        requestActivate: 'requestactivate',
        externalLogin: 'externalLogin',
        externalLogins: 'externalLogins',
        externalLink: 'linkexternal',


        //cross domain configuration 
        access_token_key: 'gul_access_token',
        username_key: 'gul_username',
        age_check_key: "gul_age_check",


        //error messages
        ajaxRequestFailed: 'There was an error processing your request. Please contact customer support.',
        internalServerErrorMessage: 'There was an error processing your request. Please contact customer support.',
        generalLoginErrorMessage: 'There was an error processing your request. Please contact customer support.',
        userNotFoundErrorMessage: 'There was an error processing your request. Please contact customer support.',
        generalPasswordUpdateErrorMessage: 'We are unable to update your password. Please contact customer support.',
        emailTakenErrorMessage: 'This email has already been used, please enter another email address or contact customer support.',
        invalidEmailErrorMessage: 'Please enter a valid email!',
        passwordResetFailedErrorMessage: 'We are unable to update your password. Please contact customer support.',
        userProfileRetrieveErrorMessage: 'There was an error processing your request. Please contact customer support.',
        accountActivationErrorMessage: 'We are unable to activate your account. Please contact customer support.',
        activationEmailErrorMessage: 'We are unable to activate your account. Please contact customer support.',
        userRegisterErrorMessage: 'We are unable to activate your account. Please contact customer support.',
        accountLockedOutMessage: 'Your account is now locked for security purposes. Please contact customer support.',
        ageCheckErrorMessage: 'You must be over 13 years old to register.',

        //general messages
        passwordUpdatedMessage: 'Your password has been updated',
        profileUpdatedMessage: 'Your profile has been updated.',
        activationEmailSent: 'Please check your email for the account activation link.',
        addressValidationFailedMessage: 'There were some errors in the address you entered. Please check your entry and submit again.',



        //sessionStorage key
        sessionStorageKeys: {
            signUpUserEmail: 'signUpUserEmail'
        },
        links: {
            termAndConditions: 'http://hipdigital.cust.footprint.net/u/d4/pdf/HipDigital_Media_en-US_Website_Use_Agreement_FINAL_July_19_2011.pdf'
        },

        promiseProvider: function () {
            var root = window;

            if (root.jQuery) {
                var deferred = root.jQuery.Deferred();
                return {
                    promise: deferred.promise(),
                    resolve: deferred.resolve,
                    reject: deferred.reject
                };
            }

            throw new Error('Missing promiseProvider in configuration');
        },
    }

export default config;

