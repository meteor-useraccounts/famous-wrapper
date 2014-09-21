var Transform;
FView.ready(function(require) {
    //FView.registerView('SequentialLayout', famous.views.SequentialLayout);
    Transform = famous.core.Transform;
});


var animationQueue = [];
Meteor.setInterval(function() {
    if (animationQueue.length)
        animationQueue.shift()();
}, 100);

var renderAnimation = function(tmplt){
    var modifier = FView.from(this).modifier;
    modifier.setTransform(Transform.translate(0, -1500));
    animationQueue.push(function() {
        modifier.setTransform(
            Transform.translate(0,0),
            { duration : 150, curve: 'easeInOut' }
        );
    });
};

var timeoutVal = 100;
var timeoutHeight = function(tmplt, op, timeout){
    var view = FView.fromTemplate(this).view;
    var content = view.content;
    Meteor.setTimeout(function(){
        var height = content.parentNode.clientHeight;
        if (op === 'inc')
            atFormSizes.set(tmplt.target, atFormSizes.get(tmplt.target) + height);
        else if (op === 'dec')
            atFormSizes.set(tmplt.target, atFormSizes.get(tmplt.target) - height);
        else
            atFormSizes.set(tmplt.target, height);
    }, timeout || timeoutVal);
};

var getSize = function(tmplt){
    var atFH = AccountsTemplates.atFormHelpers;
    if (!atFH[tmplt.visible]())
        atFormSizes.set(tmplt.target, 0);
    return [undefined, atFormSizes.get(tmplt.target)];
};


var tmplts = [
    {target: 'atTitle', visible: 'showTitle'},
    {target: 'atSigninLink', visible: 'showSignInLink'},
    {target: 'atOauth', visible: 'showOauthServices'},
    {target: 'atSep', visible: 'showServicesSeparator'},
    {target: 'atError', visible: 'showError'},
    {target: 'atResult', visible: 'showResult'},
    {target: 'atPwdForm', visible: 'showPwdForm'},
    {target: 'atSignupLink', visible: 'showSignUpLink'},
    {target: 'atTermsLink', visible: 'showTermsLink'},
];



var atFormSizes = new ReactiveDict();
window.atFormSizes = atFormSizes;
var helpers = {
    formSize: function(){
        var height = _.reduce(tmplts, function(memo, tmplt){
            return memo + atFormSizes.get(tmplt.target);
        }, 0);
        return [undefined, height];
    },
};


_.each(tmplts, function(tmplt){
    atFormSizes.set(tmplt.target, 0);
    helpers[tmplt.target + 'Size'] = function(){return getSize(tmplt);};
    Template[tmplt.target].rendered = function(){
        timeoutHeight.apply(this, [tmplt]);
        renderAnimation.apply(this, [tmplt]);
    };
});


// Uses this template in place of the original atForm
Template.atFamousForm.replaces("atForm");


Template.atForm.created = function(){
    _.each(_.keys(atFormSizes.keys), function(key){
        atFormSizes.set(key, 0);
    });
};

Template.atForm.helpers(helpers);


/*
Template.atSocial.rendered = function(){
    timeoutHeight.apply(this, ['oauth', 'inc']);
    renderAnimation.apply(this, ['atSocial']);
    var fview = FView.fromTemplate(this);
    var self = this;
    fview.onDestroy = function(){
        console.log('**************************** DESTROYING atSocial');
        //timeoutHeight.apply(self, ['oauth', 'dec']);
    };
};
*/

/*
Template.atOauth.rendered = function(){
    console.log("atOauth created!");
    console.dir(this);
    this.firstNode.parentNode._uihooks = {
        insertElement: function (node, next) {
            console.log('********************** inserted atSocial');
        },
        removeElement: function (node) {
            console.log('********************** removed atSocial');
        },
    };
};
*/