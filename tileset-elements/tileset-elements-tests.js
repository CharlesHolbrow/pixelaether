// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by tileset-elements.js.
import { name as packageName } from "meteor/tileset-elements";

// Write your tests here!
// Here is an example.
Tinytest.add('tileset-elements - example', function (test) {
  test.equal(packageName, "tileset-elements");
});
