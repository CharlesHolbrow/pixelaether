Package.describe({
  name: 'time-of-day',
  version: '0.0.1',
  summary: 'Time of Day for pixelaether maps',
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4.1');
  api.use('meteor');
  api.use('ecmascript');
  api.mainModule('GameTicker.js', 'client');
  api.mainModule('time-of-day.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('time-of-day');
  api.mainModule('time-of-day-tests.js');
});
