import $ from "jquery";
import _ from "underscore";
import backbone from "backbone";
export {default as gulConfig} from "./src/gulConfig.js";
export {default as ngGlobalUserlogin} from "./src/ngGlobalUserLogin.js";


(function(){
    // Extend the callbacks to work with Bootstrap, as used in this example
    // See: http://thedersen.com/projects/backbone-validation/#configuration/callbacks
    _.extend(backbone.Validation.callbacks, {
        valid: function (view, attr, selector) {
            var $el = view.$('[name=' + attr + ']'),
                $group = $el.closest('fieldset');

            $group.removeClass('has-error');
            $group.find('.help-block').html('').addClass('hidden');
        },
        invalid: function (view, attr, error, selector) {
            var $el = view.$('[name=' + attr + ']'),
            $group = $el.closest('fieldset');

            $group.addClass('has-error');
            $group.find('.help-block').html(error).removeClass('hidden');
        }
    });

    // https://github.com/hongymagic/jQuery.serializeObject
    $.fn.serializeObject = function () {
        "use strict";
        var a = {}, b = function (b, c) {
            var d = a[c.name];
            "undefined" != typeof d && d !== null ? $.isArray(d) ? d.push(c.value) : a[c.name] = [d, c.value] : a[c.name] = c.value;
        };
        return $.each(this.serializeArray(), b), a;
    };

    backbone.View.prototype.resetErrorMessage = function () {
        $('.error-msg').empty();
    };

    backbone.View.prototype.showErrorMessage = function (message) {
        $('.error-msg').html(message);
    };

    backbone.View.prototype.disableSubmitButton = function () {
        this.$el.find('button[type="submit"]').attr('disabled', 'disabled');
        this.$el.find('button[type="submit"]').addClass("disabled");
    };

    backbone.View.prototype.enableSubmitButton = function () {
        this.$el.find('button[type="submit"]').removeAttr('disabled');
        this.$el.find('button[type="submit"]').removeClass("disabled");
    };
})();