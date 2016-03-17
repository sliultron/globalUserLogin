import backbone from "backbone";

// Define a model with some validation rules
export default backbone.Model.extend({
    validation: {
        EmailAddress: {
            required: true,
            pattern: 'email',
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
            msg: 'The passwords does not match'
        },
    }
});