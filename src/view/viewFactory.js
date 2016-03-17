
import signInView from "./gul.sign-in.view.js";
import externalLoginRegisterView from "./gul.external-login-register.view.js";
import signUpView from "./gul.sign-up.view.js";
import signUpStep2View from "./gul.sign-up-step2.view.js";
import signUpPostView from "./gul.sign-up-post.view.js";
import forgotPasswordView from "./gul.password-forget.view.js";
import activateAccountView from "./gul.activate-account.view.js";
import resetPasswordView from "./gul.reset-password.view.js";
import externalLoginLinkView from "./gul.external-login-link.view.js";
import passwordUpdateView from "./gul.password-update.view.js";
import profileUpdateView from "./gul.profile-update.view.js";

import config from "../gulConfig";

function ViewFactory() 
{
    function signIn(userEmail, deferred, containerId, vm) {
        var view = new signInView(userEmail, deferred, containerId, vm);
        return view.render();
    }
    function registerExternalLogin(externalLoginData, deferred, containerId,vm) {
        var view = new externalLoginRegisterView(externalLoginData, deferred,containerId, vm);
        return view.render();
    }
    function externalLoginLink(externalLoginData, deferred, containerId,vm) {
        var view = new externalLoginLinkView(externalLoginData, deferred,containerId, vm);
        return view.render();
    }
    function signUp(userEmail, deferred, containerId,vm) {
        var view = new signUpView(userEmail, deferred, containerId,vm);
        return view.render();
    }

    function signUpStep2(userEmail, deferred, containerId,vm) {
        var view = new signUpStep2View(userEmail, deferred, containerId,vm);
        return view.render();
        }
    function signSigUpPost(userEmail, deferred, containerId,vm) {
        var view = new signUpPostView(userEmail, deferred, containerId,vm);
        return view.render();
        }
    function forgotPassword (userEmail, deferred, containerId, vm) {
        var view = new forgotPasswordView(userEmail, deferred, containerId, vm);
          return  view.render();
        }
    function passwordUpdate (userEmail, deferred, containerId, vm) {
        var view = new passwordUpdateView(userEmail, deferred, containerId, vm);
        return  view.render();
    }
    function profileUpdate (userEmail, deferred, containerId, vm) {
        var view = new profileUpdateView(userEmail, deferred, containerId, vm);
        return  view.render();
    }
    function activateAccount (userEmail, deferred, containerId, vm) {
        var view = new activateAccountView(userEmail, deferred, containerId, vm);
        return  view.render();
    }
    function resetPassword (userEmail, deferred, containerId, vm) {
        var view = new resetPasswordView(userEmail, deferred, containerId, vm);
        return  view.render();
    }
    var publicAPI = {
        signIn:signIn,
        registerExternalLogin:registerExternalLogin,
        signUp: signUp,
        forgotPassword: forgotPassword,
        signUpStep2: signUpStep2,
        signSigUpPost: signSigUpPost,
        profileUpdate: profileUpdate,
        passwordUpdate: passwordUpdate,
        activateAccount: activateAccount,
        resetPassword: resetPassword,
        externalLoginLink: externalLoginLink
}
    return publicAPI;
};

export default ViewFactory;