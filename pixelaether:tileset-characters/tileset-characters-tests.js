// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by tileset-characters.js.
import { name as packageName } from "meteor/tileset-characters";

// Write your tests here!
// Here is an example.
Tinytest.add('tileset-characters - example', function (test) {
  test.equal(packageName, "pixelaether:tileset-characters");
});
