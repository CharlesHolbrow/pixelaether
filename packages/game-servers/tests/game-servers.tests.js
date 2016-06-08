import StubCollections  from 'meteor/hwillson:stub-collections';
import { chai }         from 'meteor/practicalmeteor:chai';

const expect = chai.expect;


// Two test user documents without the 'services' sub-document
const testUser1 = {
  "_id" : "F33do6abmXFXBR47b_DMASTER27f2191eb2",
  "createdAt" : new Date("2016-06-08T15:19:31.488Z"),
  "username" : "test",
  "emails" : [
    {
      "address" : "b@b.b",
      "verified" : false
    }
  ],
  "devGameServersById" : {
    "D2ma059183fd54dc7" : {
      "_id" : "D2ma059183fd54dc7",
      "url" : "http://localhost:3005/",
      "name" : "test-server",
      "rootUserId" : "F33do6abmXFXBR47b_DMASTER27f2191eb2"
    }
  },
  "focusCharacterId" : "tYf7wZ2Zv8kMGiMrF_DMASTER27f2191eb2",
  "tokensByServerId" : {
    "D2ma059183fd54dc7" : "YEJqdyShVpHf69KrNcGnXGYJUP6rtHJEhjO7NzoZky9"
  }
};

const testUser2 = {
  "_id" : "zrH7EMEkiYetGxp3x_DMASTER27f2191eb2",
  "createdAt" : new Date("2016-06-08T15:19:31.488Z"),
  "username" : "orchestra",
  "emails" : [
    {
      "address" : "a@b.c",
      "verified" : false
    }
  ],
  "devGameServersById" : {
    "D1md6t117a43be5cb" : {
      "_id" : "D1md6t117a43be5cb",
      "url" : "http://localhost:3003/",
      "name" : "orchestra",
      "rootUserId" : "zrH7EMEkiYetGxp3x_DMASTER27f2191eb2"
    }
  },
  "focusCharacterId" : "h78qXzdXRKdx2yALR_DMASTER27f2191eb2",
  "tokensByServerId" : {
    "D1md6t117a43be5cb" : "Nn09XlJRi-lmixmN9sGVAvVFhpRmON5DJYsDu8yapd8",
    "P1md6t117a43be5cb" : "E0lbBtorKsahHqKusk2ddDH9Uofse1L_iKvanqe2e6f"
  }
};


describe('GameServers', function(){

  const serverName =  Meteor.settings &&
                      Meteor.settings.public &&
                      Meteor.settings.public.SERVER_NAME;

  console.log(`testing game-servers on ${serverName}`)

  it('exists', function(){
    expect(GameServers).to.exist;
  });


  describe('.promiseOneForUser', function(){
    this.timeout(15000);

    beforeEach(function(){
      StubCollections.stub([GameServers, Meteor.users]);
    });

    afterEach(function(){
      StubCollections.restore();
    });

    it('is possible to retrieve a test user', function(){
      Meteor.users.insert(testUser1);
      const user = Meteor.users.findOne(testUser1._id);
      expect(user).to.be.ok;
      expect(user._id).to.equal(testUser1._id);
    });

    // reference about testing promises in mocha/chai:
    // http://stackoverflow.com/questions/26571328/how-do-i-properly-test-promises-with-mocha-and-chai
    it('finds the server when it does exist on the user document', function(){
      const serverId        = Object.keys(testUser2.devGameServersById)[0];
      const serverDocument  = testUser2.devGameServersById[serverId];
      const userId = testUser2._id;
      Meteor.users.insert(testUser2);

      return GameServers.promiseOneForUser(serverId, userId).then((server) =>{
        expect(server).to.be.ok;
        expect(server).to.deep.equal(serverDocument);
      });
    });

    it('finds the server when it is inserted into the user document shortly after the promise is requested', function(){
      const serverId        = Object.keys(testUser2.devGameServersById)[0];
      const serverDocument  = testUser2.devGameServersById[serverId];
      const userId = testUser2._id;

      Meteor.setTimeout(() => {
        Meteor.users.insert(testUser2);
      }, 250);

      return GameServers.promiseOneForUser(serverId, userId).then((server) => {
        expect(server).to.be.ok;
        expect(server).to.deep.equal(serverDocument);
      });
    });

    it('finds the server when it is inserted into GameServers shortly after the promise is requested', function(){
      const serverId        = 'testserverid00000'
      const serverDocument  = {
        _id: serverId,
        url: Meteor.absoluteUrl(),
        name: 'testServerName',
      };

      Meteor.users.insert(testUser2);
      Meteor.setTimeout(() => {
        GameServers.insert(serverDocument);
      }, 250);

      return GameServers.promiseOneForUser(serverId, testUser2._id).then((server) => {
        expect(server).to.be.ok;
        expect(server).to.deep.equal(serverDocument);
      });
    });


    it('returns null when the serverId does not exist', function(){
      return GameServers.promiseOneForUser('does-not-exist', testUser1._id).then((server) => {
        expect(server).to.be.null;
      });
    });

  });

});