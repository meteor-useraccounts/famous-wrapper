var tmplts = {
    atTitle: "showTitle",
    atSigninLink: "showSignInLink",
    atSocial: "showOauthServices",
    atSep: "showServicesSeparator",
    atError: "showError",
    atResult: "showResult",
    atPwdForm: "showPwdForm",
    atSignupLink: "showSignUpLink",
    atTermsLink: "showTermsLink",
};


_.each(tmplts, function(visible, tmplt){
    Template[tmplt].rendered = function(){
        console.log('rendering ' + tmplt);
        var fview = FView.from(this);
        fview.preventDestroy();
        AccountsTemplates.fviews[fview.id] = {
            fview: fview,
            tmplt : tmplt,
            visible: visible,
        };
        AccountsTemplates.animate(fview, tmplt, 'render');
        fview.onDestroy = function(){
            console.log('destroying ' + tmplt);
            delete AccountsTemplates.fviews[fview.id];
            AccountsTemplates.animate(fview, tmplt, 'destroy');
        };
    };
});


// Uses this template in place of the original atForm
Template.atFamousForm.replaces("atForm");

Template.atPwdFormBtn.rendered = function(){
    var fview = FView.from(this);
    this.firstNode.parentNode._uihooks = {
        insertElement: function (node, next) {
            fview.autoHeight();
            $(node).insertBefore(next);
        },
        removeElement: function(node) {
            fview.autoHeight();
            $(node).remove();
        }
    };
};