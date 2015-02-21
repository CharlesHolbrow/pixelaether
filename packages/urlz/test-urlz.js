/*
  foo://example.com:8042/over/there?name=ferret#nose
  \_/   \______________/\_________/ \_________/ \__/
   |           |            |            |        |
scheme     authority       path        query   fragment

rel1Url: 'blah/ok.jpg',            // should be considered relative url
rel2Url: '/blah/ok.jpg',           // ditto
abs1Url: 'google.io/great.wav',    // should be considered absolute url
abs2Url: 'http://blah.net/ok.jpg', // ditto
*/

Tinytest.add('urlz - .match splits url sections into array', function(test){
  var ans = urlz.match('https://www.blah.com/okay/one/two/three?n=blah#house');
  test.equal(ans[1], 'https://', 'detect https');
  test.equal(ans[2], 'www.blah.com', 'authority');
  test.equal(ans[3], '/okay/one/two/three', 'path');
  test.equal(ans[4], '?n=blah', 'query');
  test.equal(ans[5], '#house', 'fragment');

  ans = urlz.match('www.blah.com');
  test.equal(ans[3], undefined, 
    'path is undefined when no path is present');
});

/*
urls.clean


These should be the same
- http://www.pixelaether.com/test
- www.pixelaether.com/test/
- http://localhost.com/test
- http://localhost.com///test///

these should be the same. Note that when the path ends in .html or .anything, we don't append a slash by default
- http://charles.com:80/test.html?okay
- charles.com:80/test.html///?okay

should be same:
- charles.com/.blah
- charles.com/.blah/

should be same
charles.com/blah.
charles.com/blah./

should be the same
charles.com/blah.h
charles.com/blah.h/


these may be different
http://charles.com:80/
http://charles.com/

these should be different
https://charles.com:80/okay
http://charles.com:80/okay

*/
Tinytest.add('urlz - urlz.clean once', function(test){

  ans = urlz.clean('http://www.blah.com/okay///one////two//three?n=blah#house', true, true);
  test.equal(ans, 'http://www.blah.com/okay/one/two/three?n=blah#house',
    'clean extra /// slash chars');
});

Tinytest.add('urlz - urlz.clean one short url', function(test){

  ans = urlz.clean('www.blah.com', true, true);
  test.equal(ans, 'http://www.blah.com/',
    'clean a short url');
});

Tinytest.add('urlz - urlz.clean lots of times', function(test){

  ans = urlz.clean('http://abc.io/blah.html/?asdf=s&blah=okay', true);
  test.equal(ans, 'http://abc.io/blah.html?asdf=s&blah=okay',
    'remove trailing slash from path');

  // These should all evaluate to inputs[0]
  var inputs = [
    'http://localhost:3000/',
    'http://localhost:3000////',
    'http://localhost:3000',
    'localhost:3000',
    'localhost:3000/'
  ];
  _(inputs).each(function(value){
    test.equal(urlz.clean(value), inputs[0],
      'path should never be shorter than "/". INPUT: ' + value);
  });

});

Tinytest.add('urlz - urlz.isRelative', function(test){
  test.equal(urlz.isRelative('blau/ok.jpg'), true, 'should be relative - 1')
  test.equal(urlz.isRelative('/ok.jpg'), true, 'should be relative - 2')
  test.equal(urlz.isRelative('ok.jpg'), true, 'should be relative - 3')
  test.equal(urlz.isRelative('/blah/ok.jpg'), true, 'should be relative - 4')
  test.equal(urlz.isRelative('http://blah.net/ok.jpg'), false, 'should be absolute - 6')
  test.equal(urlz.isRelative('//cdn.example.com/lib.js'), false, 'should be absolute')
  test.equal(urlz.isRelative('http://blah.net:80/ok.jpg'), false, 'should be absolute')
});
