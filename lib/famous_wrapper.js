
// ---------------------------------------------------
// Adds to AccountsTemplates a list of templates to be
// rendered within surfaces with corresponding helpers
// from atForm to be  used to  determine  whether  the
// template is visible or not
// ---------------------------------------------------

AccountsTemplates.surfaces = {
    atTitle: Template.atForm.showTitle,
    atSigninLink: Template.atForm.showSignInLink,
    atSocial: Template.atForm.showOauthServices,
    atSep: Template.atForm.showServicesSeparator,
    atError: Template.atForm.showError,
    atResult: Template.atForm.showResult,
    atPwdForm: Template.atForm.showPwdForm,
    atSignupLink: Template.atForm.showSignUpLink,
    atTermsLink: Template.atForm.showTermsLink,
};


// -----------------------------------------------------
// Adds an object to keep track of rendered famous views
// -----------------------------------------------------

AccountsTemplates.fviews = {};


// --------------------------------------------
// Adds an animation queue to AccountsTemplates
// --------------------------------------------

AccountsTemplates.animationQueue = [];

AccountsTemplates.nextAnimation = function(){
    var aq = AccountsTemplates.animationQueue;
    if (aq.length){
        aq.shift()();
        if (aq.length)
            Meteor.setTimeout(function(){AccountsTemplates.nextAnimation();}, 150);
    }
};

AccountsTemplates.pushToAnimationQueue = function(func, at_begin){
    var aq = AccountsTemplates.animationQueue;
    var firstAnim = !aq.length;
    if (at_begin === true)
        aq.unshift(func);
    else
        aq.push(func);
    if (firstAnim)
        Meteor.setTimeout(function(){AccountsTemplates.nextAnimation();}, 100);
};

// ----------------------------------------------------------
// Adds default animation configurations to AccountsTemplates
// ----------------------------------------------------------

AccountsTemplates.animations = {
    render: {
        default: fallFromTop,
    },
    destroy: {
        //default: spinOutDestroy,
        default: slideRightDestroy,
        atSocial: blastOutDestroy,
    },
    state_change: {
        default: vFlip,
    },
};


// ----------------------------------------------
// Add the animate functions to AccountsTemplates
// ----------------------------------------------

AccountsTemplates.animate = function(fview, tmplt, kind){
    // Retrieves configured animations for 'kind'
    // (which can be 'render', 'destroy', 'state_change')
    var anims = this.animations[kind];
    // Takes the animation for the specified 'tmplt'
    // or falls back to the 'default' one (if any...)
    var animFunc = anims[tmplt] || anims.default;
    // Triggers the animation only in case one was found...
    if (animFunc)
        animFunc(fview);
    else if(kind === 'destroy')
        fview.destroy();
};


// -----------------------------------------------------------------------------------------
// Overrides the original setState method to be able to trigger switchState renderAnimations
// -----------------------------------------------------------------------------------------

AccountsTemplates.setState = function(state) {
    var delay = false;
    // Goes through each rendered surface...
    _.each(this.fviews, function(tmplt, fview_id){
        var fview = FView.byId(fview_id);
        var visible = AccountsTemplates.surfaces[tmplt];
        // ...to check whether it is already visible and will
        // still be visible in next state...
        if (fview && visible() && visible(state)){
            // ...so to trigger a state change animation.
            AccountsTemplates.animate(fview, tmplt, 'state_change');
            delay = true;
        }
    });
    // Calls the original setState method that this overrides
    var setState = this.__proto__.setState;
    if (delay){
        // Applies the new state after a certain delay only
        // in case there is some state change animation to perform...
        var self = this;
        Meteor.setTimeout(function(){ setState.call(self, state);}, 150);
    }
    else
        // ...otherwise changes state straight away!
        setState.call(this, state);
};




// Associates to each template to be rendered within a Surface
// a 'rendered' function which triggers the animation for the
// entrance and register another callback to trigger another
// animation on destruction...

_.each(_.keys(AccountsTemplates.surfaces), function(tmplt){
    Template[tmplt].rendered = function(){
        var fview = FView.from(this);
        // Register the fview among rendered ones...
        AccountsTemplates.fviews[fview.id] = tmplt;
        // Trigger entrance animation
        AccountsTemplates.animate(fview, tmplt, 'render');
        // Asks not to destroy the surface right away...
        fview.preventDestroy();
        // ...and register a destroy callback...
        fview.onDestroy = function(){
            // ...to trigger destroy animation!
            AccountsTemplates.animate(fview, tmplt, 'destroy');
            // Finally de-register the surface from the list of rendered ones
            delete AccountsTemplates.fviews[fview.id];
        };
    };
});