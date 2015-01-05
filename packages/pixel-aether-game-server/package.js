Package.describe({
  summary: 'Serve a PixelAether universe'
});

Package.onUse(function(api){
  api.imply([
    'accounts-password',
    'maps-server',
    'characters-server',
    'tilesets-server',
    'login-game-server'
  ], 'server');
});
