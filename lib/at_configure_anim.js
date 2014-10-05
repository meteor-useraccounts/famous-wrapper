// --------------------------------------------------
// Adds configureAnimations to AccountsTemplates
// --------------------------------------------------

ANIMATION_SUB_PAT = {
    default: Match.Optional(Match.Where(_.isFunction)),
    atTitle: Match.Optional(Match.Where(_.isFunction)),
    atSigninLink: Match.Optional(Match.Where(_.isFunction)),
    atSocial: Match.Optional(Match.Where(_.isFunction)),
    atSep: Match.Optional(Match.Where(_.isFunction)),
    atError: Match.Optional(Match.Where(_.isFunction)),
    atResult: Match.Optional(Match.Where(_.isFunction)),
    atPwdForm: Match.Optional(Match.Where(_.isFunction)),
    atSignupLink: Match.Optional(Match.Where(_.isFunction)),
    atTermsLink: Match.Optional(Match.Where(_.isFunction)),
};

ANIMATION_PAT = {
    render: Match.Optional(ANIMATION_SUB_PAT),
    destroy: Match.Optional(ANIMATION_SUB_PAT),
    state_change: Match.Optional(ANIMATION_SUB_PAT),
};


AccountsTemplates.configureAnimations = function(options){
    if (Meteor.isClient){
        check(options, ANIMATION_PAT);
        if (options.render)
            _.defaults(this.animations.render, options.render);
        if (options.destroy)
            _.defaults(this.animations.destroy, options.destroy);
        if (options.state_change)
            _.defaults(this.animations.state_change, options.state_change);
    }
};