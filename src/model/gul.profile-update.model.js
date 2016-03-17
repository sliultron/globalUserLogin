import backbone from "backbone";

// Define a model with some validation rules
export default backbone.Model.extend({
    validation: {
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
        //    AgeRange: {
        //        oneOf: ['A13_17', 'A18_24', 'A25_34', 'A35_44', 'A45_54', 'O55', 'NotShare'],
        //        msg: 'Please select a valid choice'
        //    },
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
    }
});
