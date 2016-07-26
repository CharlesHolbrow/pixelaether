Package.describe({
  name: 'pixelaether:game-servers-test-data',
  version: '0.0.1',
  summary: 'Subsitute Meteor.settings when testing',
  testOnly: true,
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('ecmascript');
  api.use('meteor');
  api.mainModule('game-servers-test-data.js');
});
