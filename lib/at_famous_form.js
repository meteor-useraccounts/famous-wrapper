FView.ready(function(require) {
    FView.registerView('SequentialLayout', famous.views.SequentialLayout);
});
var atFormSizes = new ReactiveDict();
atFormSizes.set('title', 0);
atFormSizes.set('signInLink', 0);
atFormSizes.set('oauth', 0);
atFormSizes.set('sep', 0);
atFormSizes.set('error', 0);
atFormSizes.set('result', 0);
atFormSizes.set('pwdForm', 0);
atFormSizes.set('signUpLink', 0);
atFormSizes.set('termsLink', 0);

var timeoutVal = 50;
var timeoutHeight = function(target, inc){
    var content = FView.fromTemplate(this).view.content;
    Meteor.setTimeout(function(){
        var height = content.clientHeight;
        //var height = content.parentElement.clientHeight;
        if (inc)
            atFormSizes.set(target, atFormSizes.get(target) + height);
        else    
            atFormSizes.set(target, height);
    }, timeoutVal);
};

var getSize = function(helper, target){
    var atFH = AccountsTemplates.atFormHelpers;
    if (!atFH[helper]())
        atFormSizes.set(target, 0);
    return [undefined, atFormSizes.get(target)];
}

// Uses this template in place of the original atForm
Template.atFamousForm.replaces("atForm");

Template.atForm.helpers({
    formSize: function(){
        var height = 
            atFormSizes.get('title') +
            atFormSizes.get('signInLink') +
            atFormSizes.get('oauth') +
            atFormSizes.get('sep') +
            atFormSizes.get('error') +
            atFormSizes.get('result') +
            atFormSizes.get('pwdForm') +
            atFormSizes.get('signUpLink') +
            atFormSizes.get('termsLink');
        return [undefined, height];
    },
    titleSize: function(){ return getSize('showTitle', 'title'); },
    signInLinkSize: function(){ return getSize('showSignInLink', 'signInLink'); },
    oauthSize: function(){ return getSize('showOauthServices', 'oauth'); },
    sepSize: function(){ return getSize('showServicesSeparator', 'sep'); },
    errorSize: function(){ return getSize('showError', 'error'); },
    resultSize: function(){ return getSize('showResult', 'result'); },
    pwdFormSize: function(){ return getSize('showPwdForm', 'pwdForm'); },
    signUpLinkSize: function(){ return getSize('showSignUpLink', 'signUpLink'); },
    termsLinkSize: function(){ return getSize('showTermsLink', 'termsLink'); },
});


Template.atTitle.rendered = function(){timeoutHeight.apply(this, ['title']);};
Template.atSigninLink.rendered = function(){timeoutHeight.apply(this, ['signInLink']);};
Template.atOauth.rendered = function(){timeoutHeight.apply(this, ['oauth']);};
Template.atSep.rendered = function(){timeoutHeight.apply(this, ['sep']);};
Template.atError.rendered = function(){timeoutHeight.apply(this, ['error']);};
Template.atResult.rendered = function(){timeoutHeight.apply(this, ['result']);};
Template.atPwdForm.rendered = function(){timeoutHeight.apply(this, ['pwdForm']);};
Template.atSignupLink.rendered = function(){timeoutHeight.apply(this, ['signUpLink']);};
Template.atTermsLink.rendered = function(){timeoutHeight.apply(this, ['termsLink']);};

Template.atSocial.rendered = function(){timeoutHeight.apply(this, ['oauth', 'inc']);};
Template.atInput.rendered = function(){timeoutHeight.apply(this, ['pwdForm', 'inc']);};
Template.atPwdLink.rendered = function(){timeoutHeight.apply(this, ['pwdForm', 'inc']);};
Template.atPwdFormBtn.rendered = function(){timeoutHeight.apply(this, ['pwdForm', 'inc']);};