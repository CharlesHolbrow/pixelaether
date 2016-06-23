// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by light.js.
import { name as packageName } from "meteor/light";

// Write your tests here!
// Here is an example.
Tinytest.add('light - example', function (test) {
  test.equal(packageName, "light");
});
