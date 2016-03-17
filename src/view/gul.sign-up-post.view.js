import backbone from "backbone";
import $ from "jquery";
import _ from "underscore";

import signUpPostTemplate from "../templates/gul.sign-up-post.template.html!text";


export default backbone.View.extend({
    id:"sign-up-post",
    initialize: function (signUpUserEmail, deferred, containerId, vm) {
        this._signUpUserEmail = signUpUserEmail;
        this._deferred = deferred;
        this._containerId = containerId;
        this._vm = vm;

    
    },
    render: function () {
        var template = _.template(signUpPostTemplate);
        this.$el.html(template({ email:  this._signUpUserEmail }));

        
        $(this._containerId).append(this.el);

        //clear the previouse view
        if(this._vm._currentView)
            this._vm._currentView.remove();

        //reset the view to be self
        this._vm._currentView = this;



        return this._deferred.promise;
    },
});
