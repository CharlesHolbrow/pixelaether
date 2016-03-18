Package.describe({
  name: 'is-dev-mode',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  documentation: null,
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.export('isDevMode')
  api.addFiles('is-dev-mode.js');
});
