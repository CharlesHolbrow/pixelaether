Meteor.startup(function(){

  AetherUplink.setServerName('test-server');
  AetherUplink.connect('localhost:3000');
  AetherUplink.login('a@a.a', 'qwerty');

  try {
    AetherUplink.createGameServer();
  } catch (err){
    console.log('error creating game server', err);
  }

  Deps.autorun(function(){
    console.log('AetherUplink status:', AetherUplink.connection.status());
  });

})

staticServerContent();
