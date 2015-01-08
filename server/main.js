Meteor.startup(function(){

  AetherUplink.setServerName('test-server');
  AetherUplink.connect('localhost:3000');
  AetherUplink.connection.onReconnect = function(){
    console.log("Loggin to " + AetherUplink.name);
    AetherUplink.login('a@a.a', 'qwerty');
  };

  try {
    AetherUplink.createGameServer();
  } catch (err){
    console.log('createGameServer:', err);
  }

  Deps.autorun(function(){
    console.log('AetherUplink status:', AetherUplink.connection.status());
  });

})

staticServerContent();
