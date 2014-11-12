Package.describe({
    summary: "Famo.us wrapper for Accounts Templates.",
    version: "1.2.3",
    name: "useraccounts:famous-wrapper",
    git: "https://github.com/meteor-useraccounts/famous-wrapper.git",
});

Package.on_use(function(api, where) {
    api.versionsFrom("METEOR@1.0");

    api.use([
        "reactive-dict",
        "templating",
    ], "client");

    api.use([
        "check",
        "underscore",
        "useraccounts:core",
        "gadicohen:famous-views",
        "aldeed:template-extension"
    ], ["client", "server"]);

    api.imply([
        "useraccounts:core@1.2.3",
        "gadicohen:famous-views@0.1.22",
        "aldeed:template-extension@3.1.1",
    ], ["client", "server"]);

    //api.use('mjnetworks:famous@0.2.2-1', ['client']/*, { weak: true }*/);

    api.use("useraccounts:unstyled@1.2.3", ["client", "server"], { weak: true });
    api.use("useraccounts:bootstrap@1.2.3", ["client", "server"], { weak: true });
    api.use("useraccounts:foundation@1.2.3", ["client", "server"], { weak: true });
    api.use("useraccounts:semantic-ui@1.2.3", ["client", "server"], { weak: true });

    api.add_files([
        "lib/at_famous_form.html",
        "lib/at_famous_form.js",
        "lib/at_famous_oauth.html",
        "lib/at_famous_oauth.js",
        "lib/at_pwd_form_btn.js",
        "lib/full_page_at_famous_form.html",
        "lib/full_page_at_famous_form.js",
        "lib/default_animations.js",
        "lib/famous_wrapper.js",
    ], ["client"]);

    api.add_files([
        "lib/at_configure_anim.js",
    ], ["client", "server"]);
});

Package.on_test(function(api) {
    api.use([
        "useraccounts:core@1.2.3",
    ]);
    api.use(["tinytest", "test-helpers"], ["client", "server"]);
    api.add_files("tests/tests.js", ["client", "server"]);
});
