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

  describe('promiseOneForUser', function(){
    beforeEach(function(){
      StubCollections.stub([GameServers, Meteor.users]);
    });

    afterEach(function(){
      StubCollections.restore();
    });

    it('Possible to retrieve a test user', function(){
      Meteor.users.insert(testUser1);
      const user = Meteor.users.findOne(testUser1._id);
      expect(user).to.be.ok;
      expect(user._id).to.equal(testUser1._id);
    });
  });

});