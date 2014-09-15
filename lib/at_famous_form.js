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

var renderAnimation = function(target){
    var modifier = FView.from(this).modifier;
    modifier.setTransform(Transform.translate(0, -1500));
    animationQueue.push(function() {
        modifier.setTransform(
            Transform.translate(0,0),
            { duration : 150, curve: 'easeInOut' }
        );
    });
};



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
atFormSizes.set('pwdInput', 0);
atFormSizes.set('pwdLink', 0);
atFormSizes.set('pwdButton', 0);



var timeoutVal = 100;
var timeoutHeight = function(target, inc){
    var view = FView.fromTemplate(this).view;
    var content = view.content;
    //console.log(target);
    //console.dir(FView.fromTemplate(this));
    //console.dir(content);
    Meteor.setTimeout(function(){
        //console.log(target);
        //console.log(inc);
        //console.dir(view);
        //console.dir(content);
        var height = content.parentNode.clientHeight;
        //console.log('height: ' + height);
        //var height = content.parentElement.clientHeight;
        if (inc)
            atFormSizes.set(target, atFormSizes.get(target) + height);
        else
            atFormSizes.set(target, height);
        //console.log(target);
        //console.log('total height: ' + atFormSizes.get(target));
    }, timeoutVal);
};

var getSize = function(helper, target){
    var atFH = AccountsTemplates.atFormHelpers;
    if (!atFH[helper]()){
        atFormSizes.set(target, 0);
        //console.log('hiding ' + helper);
    }
    //else
    //    console.log('counting ' + helper);
    return [undefined, atFormSizes.get(target)];
};


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
    titleSize: function(){
        return getSize('showTitle', 'title');
    },
    signInLinkSize: function(){
        return getSize('showSignInLink', 'signInLink');
    },
    oauthSize: function(){
        return getSize('showOauthServices', 'oauth');
    },
    sepSize: function(){
        return getSize('showServicesSeparator', 'sep');
    },
    errorSize: function(){
        return getSize('showError', 'error');
    },
    resultSize: function(){
        return getSize('showResult', 'result');
    },
    pwdFormSize: function(){
        return getSize('showPwdForm', 'pwdForm');
    },
    signUpLinkSize: function(){
        return getSize('showSignUpLink', 'signUpLink');
    },
    termsLinkSize: function(){
        return getSize('showTermsLink', 'termsLink');
    },
});

Template.atPwdForm.helpers({
    formSize: function(){
        var height = atFormSizes.get('pwdForm');
        console.log('form size: ' + height);
        return [undefined, height];
    },
    inputSize: function(){
        var height = atFormSizes.get('pwdInput');
        console.log('input size: ' + height);
        return [undefined, height];
    },
    linkSize: function(){
        var atPwd = AccountsTemplates.atPwdFormHelpers;
        if (!atPwd.showForgotPasswordLink()){
            atFormSizes.set('pwdLink', 0);
            //console.log('hiding ' + helper);
        }
        //else
        //    console.log('counting ' + helper);
        console.log('link size: ' + atFormSizes.get('pwdLink'));
        return [undefined, atFormSizes.get('pwdLink')];
    },
    btnSize: function(){
        var height = atFormSizes.get('pwdBtn');
        console.log('button size: ' + height);
        return [undefined, height];
    },
});

Template.atTitle.rendered = function(){
    timeoutHeight.apply(this, ['title']);
    renderAnimation.apply(this, ['title']);
};
Template.atSigninLink.rendered = function(){
    timeoutHeight.apply(this, ['signInLink']);
    renderAnimation.apply(this, ['signInLink']);
};
/*
Template.atOauth.rendered = function(){
    timeoutHeight.apply(this, ['oauth']);
    renderAnimation.apply(this, ['oauth']);
};
*/
Template.atSep.rendered = function(){
    timeoutHeight.apply(this, ['sep']);
    renderAnimation.apply(this, ['sep']);
};
Template.atError.rendered = function(){
    timeoutHeight.apply(this, ['error']);
    renderAnimation.apply(this, ['error']);
};
Template.atResult.rendered = function(){
    timeoutHeight.apply(this, ['result']);
    renderAnimation.apply(this, ['result']);
};
Template.atPwdForm.rendered = function(){
    this.firstNode.parentNode._uihooks = {
        insertElement: function (node, next) {

            var $node = $(node);

            $node.insertBefore(next);
            console.log('Inserted element!');
            console.dir(node);
            /*
            if($node.hasClass('animate')) {
                // add to animation elements array
                animationElements.push(node);

                // animate
                $node.width(); // force-draw before animation
                Meteor.defer(function(){
                    $node.removeClass('animate');
                });
            }
            */

        },
        removeElement: function (node) {

            var $node = $(node);
            $node.remove();
            console.log('Removed element!');
            console.dir(node);
            $node = null;

            /*
            var indexOfElement = _.indexOf(animationElements, node);

            if(document.hasFocus() && indexOfElement !== -1) {
                // remove from animation elements array
                delete animationElements[indexOfElement];
                $node.addClass('animate').on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
                    $node.remove();
                    $node = null;
                });

            // otherwise remove immedediately
            } else {
                $node.remove();
                $node = null;
            }
            */

        }
    };

    //console.log('pwdForm');
    //console.dir(Template.instance());
    //timeoutHeight.apply(this, ['pwdForm']);
    //renderAnimation.apply(this, ['pwdForm']);
};
Template.atSignupLink.rendered = function(){
    timeoutHeight.apply(this, ['signUpLink']);
    renderAnimation.apply(this, ['signUpLink']);
};
Template.atTermsLink.rendered = function(){
    timeoutHeight.apply(this, ['termsLink']);
    renderAnimation.apply(this, ['atTermsLink']);
};

Template.atSocial.rendered = function(){
    timeoutHeight.apply(this, ['oauth', 'inc']);
    renderAnimation.apply(this, ['atSocial']);
};
Template.atInput.rendered = function(){
    var content = this;
    Meteor.setTimeout(function(){
        var height = content.firstNode.parentNode.parentNode.clientHeight;
        console.log('II input height: ' + height);
        atFormSizes.set('pwdForm', atFormSizes.get('pwdForm') + height);
        atFormSizes.set('pwdInput', height);
    }, timeoutVal);
    renderAnimation.apply(this, ['atInput']);
};
Template.atPwdLink.rendered = function(){
    var content = this;
    Meteor.setTimeout(function(){
        var height = content.firstNode.parentNode.parentNode.clientHeight;
        console.log('LL link height: ' + height);
        atFormSizes.set('pwdForm', atFormSizes.get('pwdForm') + height);
        atFormSizes.set('pwdLink', height);
    }, timeoutVal);
    renderAnimation.apply(this, ['pwdLink']);
};
Template.atPwdFormBtn.rendered = function(){
    var content = this;
    Meteor.setTimeout(function(){
        window.pippo = content;
        var height = content.firstNode.parentNode.parentNode.clientHeight;
        console.log('BB button height: ' + height);
        atFormSizes.set('pwdForm', atFormSizes.get('pwdForm') + height);
        atFormSizes.set('pwdBtn', height);
    }, timeoutVal);
    renderAnimation.apply(this, ['pwdFormBtn']);
};

Template.atPwdFormBtn.events({
    'click #at-btn': function(event){
        var t = $('div.at-pwd-form');
        console.dir(t);
        console.dir(this.$);
        AccountsTemplates.atPwdFormEvents['submit #at-pwd-form'](event, t);
    }
});

Template.atSigninLink.events({
   'click #at-signIn': AccountsTemplates.atFormEvents['click .at-link']
});

Template.atSignupLink.events({
   'click #at-signUp': AccountsTemplates.atFormEvents['click .at-link']
});

Template.atPwdLink.events({
   'click #at-forgotPwd': AccountsTemplates.atFormEvents['click .at-link']
});