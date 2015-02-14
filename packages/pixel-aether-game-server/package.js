Package.describe({
  summary: 'Serve a PixelAether universe'
});

Package.onUse(function(api){
  api.use(['coffeescript', 'urlz', 'login-game-server', 'tracker']);
  api.imply([
    'accounts-password',
    'maps-server',
    'characters-server',
    'tilesets-server',
    'login-game-server'
  ], 'server');
  api.addFiles(['launch.coffee'], 'server')
});
