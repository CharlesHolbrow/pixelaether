// Import and rename a variable exported by location.js.
import { chai } from 'meteor/practicalmeteor:chai';
import { Loc }  from 'meteor/location';


const expect = chai.expect;

describe('Loc', () => {
  it('exists', () => {
    expect(Loc).to.exist;
  });
});
