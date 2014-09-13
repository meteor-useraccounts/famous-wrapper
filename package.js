Package.describe({
    summary: "Accounts Templates styled for Famo.us.",
    version: "1.0.0",
    name: "splendido:accounts-templates-famous",
    git: "https://github.com/splendido/accounts-templates-famous.git",
});

Package.on_use(function(api, where) {
    api.use([
        'templating',
        'gadicohen:famous-views',
        'aldeed:template-extension',
    ], 'client');
    api.imply([
        'splendido:accounts-templates-core@1.0.0',
        'gadicohen:famous-views@0.1.6',
        'aldeed:template-extension@2.0.0',
    ], ['client', 'server']);

    //api.use('splendido:accounts-templates-bootstrap@1.0.0', ['client', 'server'] /*, { weak: true } */);
    //api.use('splendido:accounts-templates-foundation@1.0.0', ['client', 'server'] /*, { weak: true } */);
    //api.use('splendido:accounts-templates-semantic-ui@1.0.0', ['client', 'server'] /*, { weak: true } */);

    api.add_files([
        'lib/at_famous_form.html',
        'lib/at_famous_form.js',
        'lib/at_famous_oauth.html',
        'lib/at_famous_oauth.js',
        'lib/at_famous_pwd_form.html',
        'lib/at_famous_pwd_form.js',
    ], ['client']);
});

Package.on_test(function(api) {
    api.use([
        'splendido:accounts-templates-core@1.0.0',
    ]);
    api.use(['tinytest', 'test-helpers'], ['client', 'server']);
    api.add_files('tests/accounts-templates-bootstrap_tests.js', ['client', 'server']);
});
