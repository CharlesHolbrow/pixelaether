// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by tileset-basic.js.
import { name as packageName } from "meteor/tileset-basic";

// Write your tests here!
// Here is an example.
Tinytest.add('tileset-basic - example', function (test) {
  test.equal(packageName, "tileset-basic");
});
