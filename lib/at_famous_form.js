
var Transform;
var Transitionable;
FView.ready(function(require) {
    //FView.registerView("SequentialLayout", famous.views.SequentialLayout);
    Transform = famous.core.Transform;
    Transitionable = famous.transitions.Transitionable;
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
            { duration : 150, curve: "easeInOut" }
        );
    });
};

var destroyAnimation = function(tmplt){
    console.log("Destroying template " + tmplt.target);
    console.dir(this);
    var self = this;
    this.modifier.setTransform(
        //Transform.thenMove(Transform.rotateZ(Math.PI*4), [1500,0,0]),
        Transform.rotateZ(Math.PI*4),
        { duration : 2000, curve: "easeInOut" },
        function() {console.log("*************** Destroying surface " + tmplt.target + "!"); self.destroy(); }
    );
};

var timeoutVal = 100;
var timeoutHeight = function(tmplt, op, timeout){
    var view = FView.fromTemplate(this).view;
    var content = view.content;
    Meteor.setTimeout(function(){
        console.log("timeoutHeight, template " + tmplt.target);
        if (content && content.parentNode) {
            var height = content.parentNode.clientHeight;
            if (op === "inc")
                atFormSizes.set(tmplt.target, atFormSizes.get(tmplt.target) + height);
            else if (op === "dec")
                atFormSizes.set(tmplt.target, atFormSizes.get(tmplt.target) - height);
            else
                atFormSizes.set(tmplt.target, height);

            //console.log("timeoutHeight: " + tmplt.target + " " + height);
            //console.dir(atFormSizes);
        }
    }, timeout || timeoutVal);
};

var getSize = function(tmplt){
    var atFH = AccountsTemplates.atFormHelpers;
    if (!atFH[tmplt.visible]())
        atFormSizes.set(tmplt.target, 0);
    return [undefined, atFormSizes.get(tmplt.target)];
};


var tmplts = [
    {target: "atTitle", visible: "showTitle"},
    {target: "atSigninLink", visible: "showSignInLink"},
    {target: "atOauth", visible: "showOauthServices"},
    {target: "atSep", visible: "showServicesSeparator"},
    {target: "atError", visible: "showError"},
    {target: "atResult", visible: "showResult"},
    {target: "atPwdForm", visible: "showPwdForm"},
    {target: "atSignupLink", visible: "showSignUpLink"},
    {target: "atTermsLink", visible: "showTermsLink"},
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
    helpers[tmplt.target + "Size"] = function(){return getSize(tmplt);};
    Template[tmplt.target].rendered = function(){
        timeoutHeight.call(this, tmplt);
        renderAnimation.call(this, tmplt);
        var fview = FView.fromTemplate(this);
        fview.preventDestroy();
        /*
        fview.onDestroy = function(){
            console.log("onDestroy " + tmplt.target);
            console.dir(this);
            destroyAnimation.call(fview.blazeView, tmplt);
        };
        */
        fview.onDestroy = function(){
            console.log("onDestroy " + tmplt.target);
            console.dir(this);
            var self = this;
            console.log("setting transform atSocial");

            /*
            var trans = new Transitionable(0);
            trans.set(
                Math.PI * 10,
                {duration:5000, curve: "easeInOut"}
            );

            baseTime=Date.now();
            this.modifier.setTransform(
                //Transform.translate(1500,0),
                //Transform.thenMove(Transform.rotateZ(Math.PI*4), [1500,0,0]),
                Transform.rotateZ(trans.get()),
                { duration : 5000, curve: "easeInOut" },
                function() {console.log("*************** Destroying surface " + tmplt.target + "!"); self.destroy(); }
            );
            */

            var total_rotation = 0;

            var rotate_spinner = function(){
                total_rotation += 0.15;
                self.modifier.setTransform(
                    Transform.rotateZ(total_rotation)
                );
                if (total_rotation > (Math.PI * 4.0)){
                    console.log("*************** Destroying surface " + tmplt.target + "!");
                    self.destroy();
                }
                else
                    Meteor.setTimeout(rotate_spinner, 0);
            };
            rotate_spinner();

        };
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


Template.atSocial.rendered = function(){
    console.log("rendered atSocial");
    var fview = FView.fromTemplate(this);
    fview.preventDestroy();
    fview.onDestroy = function(){
        console.log("onDestroy atSocial");
        console.dir(this);
        atFormSizes.set("atOauth", atFormSizes.get("atOauth") - fview.size[1]);
        //destroyAnimation.call(fview, {target: "atSocial", visible: "showOauthServices"});
        var self = this;
        console.log("setting transform atSocial");
        this.modifier.setTransform(
            //Transform.thenMove(Transform.rotateZ(Math.PI*4), [1500,0,0]),
            //Transform.rotateZ(Math.PI*4),
            Transform.translate(1500,0),
            { duration : 5000, curve: "easeInOut" },
            function() {console.log("*************** Destroying surface atSocial!"); self.destroy(); }
        );

    };
    Meteor.setTimeout(function(){
        atFormSizes.set("atOauth", atFormSizes.get("atOauth") + fview.size[1]);
    }, timeoutVal);
};




Template.atPwdFormBtn.rendered = function(){
    var self = this;
    this.firstNode.parentNode._uihooks = {
        insertElement: function (node, next) {
            timeoutHeight.call(self, {target: "atPwdForm", visible: "showPwdForm"});
            var $node = $(node);
            $node.insertBefore(next);
        },
        removeElement: function(node) {
            timeoutHeight.call(self, {target: "atPwdForm", visible: "showPwdForm"});
            var $node = $(node);
            $node.remove();
        }
    };
};