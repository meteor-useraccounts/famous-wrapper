FView.ready(function(require) {
    FView.registerView('SequentialLayout', famous.views.SequentialLayout);
});

// Uses this template in place of the original atForm
Template.atFamousForm.replaces("atForm");
