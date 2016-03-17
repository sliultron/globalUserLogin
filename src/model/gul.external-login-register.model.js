import backbone from "backbone";
import _ from "underscore";
import config from "../gulConfig.js";

export default backbone.Model.extend({
        defaults: {
            OptIn: false
        },
        validation: {
            Email: {
                required: true
            },
            FirstName: {
                required: true,
                minLength: 2
            },
            LastName: {
                required: true,
                minLength: 2
            },
            Gender: {
                oneOf: ['Male', 'Female', 'NotShare'],
                msg: 'Please select a valid choice'
            },
            Country:
                {
                    required: function () {
                        return config.enableAddressCollection;
                    },
                    oneOf: ['CA', 'US'],
                    msg: 'Please select a valid choice'
                },
            Province: {
                required: function () {
                    return config.enableAddressCollection;
                },
                msg: 'Please select a valid choice'
            },
            City: {
                required: function () {
                    return config.enableAddressCollection;
                },
                minLength: 2
            },
            PostalCode: {
                required: function () {
                    return config.enableAddressCollection;
                },
                pattern: /(^\d{5}(?:[-\s]\d{4})?$)|(^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])[\ -]{0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d)$)/i,
                msg: 'Please enter a valid zip/postal code'
            },
            Day: {
                required: function () {
                    return config.enableBirthDayCollection;
                },
                msg: 'Please select a valid choice'
            },
            Month: {
                required: true,
                msg: 'Please select a valid choice'
            },
            Year: {
                required: true,
                msg: 'Please select a valid choice'
            },
            //AgeRange: {
            //    oneOf: ['A13_17', 'A18_24', 'A25_34', 'A35_44', 'A45_54', 'O55', 'NotShare'],
            //    msg: 'Please select a valid choice'
            //},
            OptIn: {
                acceptance: true,
                msg: 'Please agree to the Terms & Conditions'
            },
        }
    });
