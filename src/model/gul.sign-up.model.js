import backbone from "backbone";

// Define a model with some validation rules
export default backbone.Model.extend({
    validation: {
        Email: {
            required: true,
            pattern: 'email',
        },
    }
});
