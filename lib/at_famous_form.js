
var tmplts = {
    atTitle: {
        target: "atTitle",
        animate: true,
        size_helper: true,
        visible: "showTitle"
    },
    atSigninLink: {
        target: "atSigninLink",
        animate: true,
        size_helper: true,
        visible: "showSignInLink"
    },
    atOauth: {
        target: "atOauth",
        animate: false,
        size_helper: true,
        visible: "showOauthServices"
    },
    atSocial: {
        target: "atOauth",
        animate: true,
        size_helper: false,
        visible: "showOauthServices"
    },
    atSep: {
        target: "atSep",
        animate: true,
        size_helper: true,
        visible: "showServicesSeparator"
    },
    atError: {
        target: "atError",
        animate: true,
        size_helper: true,
        visible: "showError"
    },
    atResult: {
        target: "atResult",
        animate: true,
        size_helper: true,
        visible: "showResult"
    },
    atPwdForm: {
        target: "atPwdForm",
        animate: true,
        size_helper: true,
        visible: "showPwdForm"
    },
    atSignupLink: {
        target: "atSignupLink",
        animate: true,
        size_helper: true,
        visible: "showSignUpLink"
    },
    atTermsLink: {
        target: "atTermsLink",
        animate: true,
        size_helper: true,
        visible: "showTermsLink"
    },
};


var getSize = function(action){
    if (!AccountsTemplates.atFormHelpers[action.visible]())
        AccountsTemplates.atFormHeights.set(action.target, 0);
    return [undefined, AccountsTemplates.atFormHeights.get(action.target)];
};

var helpers = {
    formSize: function(){
        var height = _.reduce(tmplts, function(memo, action, tmplt){
            var height = 0;
            if (action.size_helper)
                height = AccountsTemplates.atFormHeights.get(action.target);
            return memo + height;
        }, 0);
        return [undefined, height];
    },
};


var timeoutHeight = function(fview, target, op, timeout){

    var setHeight = function(){
        var content = fview.view.content;
        if (content && content.parentNode) {
            var height = content.parentNode.scrollHeight;
            if (op === "inc")
                AccountsTemplates.atFormHeights.set(target, AccountsTemplates.atFormHeights.get(target) + height);
            else if (op === "dec")
                AccountsTemplates.atFormHeights.set(target, AccountsTemplates.atFormHeights.get(target) - height);
            else
                AccountsTemplates.atFormHeights.set(target, height);
        }
    };

    timeout = timeout || 100;
    if (timeout === 0)
        setHeight();
    else
        Meteor.setTimeout(setHeight, timeout);
};


_.each(tmplts, function(action, tmplt){
    var target = action.target;
    var visible = action.visible;
    var animate = action.animate;
    var size_helper = action.size_helper;
    AccountsTemplates.atFormHeights.set(target, 0);
    if (size_helper)
        helpers[tmplt + "Size"] = function(){return getSize(action);};
    Template[tmplt].rendered = function(){
        var fview = FView.from(this);
        timeoutHeight(fview, target, "inc");
        fview.preventDestroy();
        if (animate){
            AccountsTemplates.fviews[fview.id] = {
                fview: fview,
                tmplt : tmplt,
                visible: visible,
            };
            AccountsTemplates.animate(fview, tmplt, 'render');
            fview.onDestroy = function(){
                timeoutHeight(fview, target, "dec", 0);
                delete AccountsTemplates.fviews[fview.id];
                AccountsTemplates.animate(fview, tmplt, 'destroy');
            };
        }
    };
});


// Uses this template in place of the original atForm
Template.atFamousForm.replaces("atForm");


Template.atForm.created = function(){
    _.each(_.keys(AccountsTemplates.atFormHeights.keys), function(key){
        AccountsTemplates.atFormHeights.set(key, 0);
    });
};

Template.atForm.helpers(helpers);




Template.atPwdFormBtn.rendered = function(){
    var fview = FView.from(this);
    this.firstNode.parentNode._uihooks = {
        insertElement: function (node, next) {
            timeoutHeight(fview, "atPwdForm");
            var $node = $(node);
            $node.insertBefore(next);
        },
        removeElement: function(node) {
            timeoutHeight(fview, "atPwdForm");
            var $node = $(node);
            $node.remove();
        }
    };
};