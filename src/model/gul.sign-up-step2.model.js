import backbone from "backbone";

// Define a model with some validation rules
export default backbone.Model.extend({
    defaults: {
        terms: false
    },
    validation: {
        FirstName: {
            required: true,
            minLength: 2
        },
        LastName: {
            required: true,
            minLength: 2
        },
        Password: {
            required: true,
            pattern: /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
            msg: 'The password must meet the following criteria<br>' +
                '<ul><li>Length must be greater than or equal to 8</li>' +
                '<li>Contains one or more uppercase characters</li>' +
                '<li>Contains one or more lowercase characters</li>' +
                '<li>Contains one or more numeric values</li>' +
                '<li>Contains one or more special characters</li></ul>'
        },
        ConfirmPassword: {
            required: true,
            equalTo: 'Password',
            msg: 'The passwords do not match'
        },
        Gender: {
            oneOf: ['Male', 'Female', 'NotShare'],
            msg: 'Please select a valid choice'
        },
        Country: {
            oneOf: ['CA', 'US'],
            msg: 'Please select a valid choice'
        },
        Province: {
            required: true,
            msg: 'Please select a valid choice'
        },
        City: {
            required: true,
            minLength: 2
        },
        PostalCode: {
            pattern: /(^\d{5}(?:[-\s]\d{4})?$)|(^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])[\ -]{0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d)$)/i,
            msg: 'Please enter a valid zip/postal code'
        },
        Day: {
            required: true,
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
        terms: {
            acceptance: true
        },
    }
});
