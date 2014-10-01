
var Transform;
var Transitionable;
var Easing;
FView.ready(function(require) {
    //FView.registerView("SequentialLayout", famous.views.SequentialLayout);
    Transform = famous.core.Transform;
    Transitionable = famous.transitions.Transitionable;
    Easing = famous.transitions.Easing;
});


// ---------------------------
// Default animation functions
// ---------------------------

var fallFromTop = function(fview){
    var modifier = fview.modifier;
    modifier.setTransform(Transform.translate(0, -1500));
    AccountsTemplates.addToAnimationQueue(function() {
        modifier.setTransform(
            Transform.translate(0,0),
            { duration : 600, curve: Easing.easeOutSine }
        );
    });
};

var spinOut = function(fview){
    var total_rotation = 0;

    var rotate_spinner = function(){
        total_rotation += 0.20;
        fview.modifier.setTransform(
            Transform.aboutOrigin([200, 10, 0], Transform.rotateZ(total_rotation))
        );
        if (total_rotation > (Math.PI * 3.0))
            fview.destroy();
        else
            Meteor.setTimeout(rotate_spinner, 0);
    };
    rotate_spinner();
};

var blastOut = function(fview){
    var angle = 2 * Math.random() * Math.PI;
    fview.modifier.setTransform(
        Transform.multiply(
            Transform.translate(
                Math.cos(angle) * 1.5 * $(window).height(),
                Math.sin(angle) * 1.5 * $(window).width()
            ),
            Transform.aboutOrigin([200, 21, 0], Transform.rotate(0,0, Math.random() > 0.5 ? Math.PI : -Math.PI))
        ),
        { duration : 500, curve: Easing.easeOutCirc},
        function() {
            fview.destroy();
        }
    );
};

var vflip = function(fview){
    //var half_height = fview.size[1] / 2;
    fview.modifier.setTransform(
        //Transform.aboutOrigin([0, half_height, 0], Transform.rotate(Math.PI-0.05,0,0)),
        Transform.rotate(Math.PI-0.05,0,0),
        { duration : 200, curve: "easeIn" },
        function() {
            fview.modifier.setTransform(
                //Transform.aboutOrigin([0, half_height, 0], Transform.rotate(-0.1,0,0)),
                Transform.rotate(-0.1,0,0),
                { duration : 200, curve: "easeOut" }
            );
        }
    );
};


// -----------------------------------------
// Adds animation queue to AccountsTemplates
// -----------------------------------------

AccountsTemplates.animationQueue = [];

AccountsTemplates.nextAnimation = function(){
    var aq = AccountsTemplates.animationQueue;
    if (aq.length){
        aq.shift()();
        if (aq.length)
            Meteor.setTimeout(function(){AccountsTemplates.nextAnimation();}, 250);
    }
};

AccountsTemplates.addToAnimationQueue = function(func){
    var aq = AccountsTemplates.animationQueue;
    var firstAnim = !aq.length;
    aq.push(func);
    if (firstAnim)
        Meteor.setTimeout(function(){AccountsTemplates.nextAnimation();}, 50);
};


// --------------------------------------------------
// Adds animation configurations to AccountsTemplates
// --------------------------------------------------

AccountsTemplates.animations = {
    render: {
        default: fallFromTop,
    },
    destroy: {
        default: spinOut,
        atSocial: blastOut,
    },
    state_switch: {
        default: vflip,
    },
};


// ----------------------------------------------
// Add the animate functions to AccountsTemplates
// ----------------------------------------------

AccountsTemplates.animate = function(fview, tmplt, kind){
    var anims = this.animations[kind];
    var animFunc = anims[tmplt] || anims.default;
    if (animFunc)
        animFunc(fview);
};


// -----------------------------------------------------
// Adds an object to keep track of rendered famous views
// -----------------------------------------------------

AccountsTemplates.fviews = {};


// --------------------------------------------------------------------------
// Adds an object to keep track of the height of views rendered inside atForm
// --------------------------------------------------------------------------

AccountsTemplates.atFormHeights = new ReactiveDict();

// -----------------------------------------------------------------------------------------
// Overrides the original setState method to be able to trigger switchState renderAnimations
// -----------------------------------------------------------------------------------------

AccountsTemplates.setState = function(state) {
    var delay = false;
    _.each(AccountsTemplates.fviews, function(data, fview_key){
        if (data){
            var fview = data.fview;
            var tmplt = data.tmplt;
            var visible = data.visible;
            if (fview && Template.atForm[visible]() && Template.atForm[visible](state)){
                AccountsTemplates.animate(fview, tmplt, 'state_switch');
                delay = true;
            }
        }
    });
    // Calls the original setState method that this overrides
    var setState = AccountsTemplates.__proto__.setState;
    var self = this;
    if (delay)
        Meteor.setTimeout(function(){ setState.call(self, state);}, 200);
    else
        setState.call(self, state);
};
