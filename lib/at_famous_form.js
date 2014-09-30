
var Transform;
var Transitionable;
var Easing;
FView.ready(function(require) {
    //FView.registerView("SequentialLayout", famous.views.SequentialLayout);
    Transform = famous.core.Transform;
    Transitionable = famous.transitions.Transitionable;
    Easing = famous.transitions.Easing;
});


var animationQueue = [];
Meteor.setInterval(function() {
    if (animationQueue.length)
        animationQueue.shift()();
}, 250);

var renderAnimation = function(tmplt){
    var modifier = FView.from(this).modifier;
    modifier.setTransform(Transform.translate(0, -1500));
    animationQueue.push(function() {
        modifier.setTransform(
            Transform.translate(0,0),
            { duration : 600, curve: Easing.easeOutSine }
        );
    });
};

var destroyAnimation = function(tmplt){
    //console.log("Destroying template " + tmplt.target);
    //console.dir(this);
    var fview = this;
    this.modifier.setTransform(
        //Transform.thenMove(Transform.rotateZ(Math.PI*4), [1500,0,0]),
        Transform.rotateZ(Math.PI*4),
        { duration : 2000, curve: Easing.easeOutSine },
        function() {
            //console.log("*************** Destroying surface " + tmplt.target + "!");
            fview.destroy();
        }
    );
};

var timeoutVal = 100;
var timeoutHeight = function(tmplt, op, timeout){
    var view = FView.from(this).view;
    var content = view.content;
    Meteor.setTimeout(function(){
        //console.log("timeoutHeight, template " + tmplt.target);
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


atFViews = {};

_.each(tmplts, function(tmplt){
    atFormSizes.set(tmplt.target, 0);
    helpers[tmplt.target + "Size"] = function(){return getSize(tmplt);};
    Template[tmplt.target].rendered = function(){
        timeoutHeight.call(this, tmplt);
        if (tmplt.target !== "atOauth")
            renderAnimation.call(this, tmplt);
        var fview = FView.from(this);
        if (tmplt.target !== "atOauth" && tmplt.target !== "atSep")
            atFViews[tmplt.target] = fview;
        fview.preventDestroy();
        fview.onDestroy = function(){
            atFViews[tmplt.target] = null;
            if (tmplt.target !== "atOauth"){
                var total_rotation = 0;

                var rotate_spinner = function(){
                    total_rotation += 0.15;
                    fview.modifier.setTransform(
                        Transform.aboutOrigin([200, 10, 0], Transform.rotateZ(total_rotation))
                    );
                    if (total_rotation > (Math.PI * 4.0)){
                        //console.log("*************** Destroying surface " + tmplt.target + "!");
                        fview.destroy();
                    }
                    else
                        Meteor.setTimeout(rotate_spinner, 0);
                };
                rotate_spinner();
            }
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
    //console.log("rendered atSocial");
    //console.dir(this);
    var fview = FView.from(this);
    //var service = "atSocial-" + this.data._id;
    //atFViews[service] = fview;
    fview.preventDestroy();
    renderAnimation.call(this, {target: "atSocial", visible: "showOauthServices"});
    fview.onDestroy = function(){
        //atFViews[service] = null;
        var angle = 2 * Math.random() * Math.PI;
        this.modifier.setTransform(
            Transform.multiply(
                Transform.translate(
                    Math.cos(angle) * 1.5 * $(window).height(),
                    Math.sin(angle) * 1.5 * $(window).width()
                ),
                Transform.aboutOrigin([200, 21, 0], Transform.rotate(0,0, Math.random() > 0.5 ? Math.PI : -Math.PI))
            ),
            { duration : 500, curve: Easing.inQuad },
            function() {
                atFormSizes.set("atOauth", atFormSizes.get("atOauth") - fview.size[1]);
                fview.destroy();
            }
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


AccountsTemplates.setState = function(state) {
    _.each(atFViews, function(fview, target){
        if (fview){
            //var half_height = fview.size[1] / 2;
            fview.modifier.setTransform(
                //Transform.aboutOrigin([0, half_height, 0], Transform.rotate(Math.PI-0.05,0,0)),
                Transform.rotate(Math.PI-0.05,0,0),
                { duration : 200, curve: "easeIn" },
                function() {
                    //console.log('half setState');
                    fview.modifier.setTransform(
                        //Transform.aboutOrigin([0, half_height, 0], Transform.rotate(-0.1,0,0)),
                        Transform.rotate(-0.1,0,0),
                        { duration : 200, curve: "easeOut" },
                        function(){
                            //console.log('end setState');
                        }
                    );
                }
            );
        }
    });
    // Calls the original setState method that this overrides
    var self = this;
    Meteor.setTimeout(function(){
        //console.log('original setState');        
        AccountsTemplates.__proto__.setState.call(self, state);
    }, 200);
};