/*------------------------------------------------------------
This is a url:

  foo://example.com:8042/over/there?name=ferret#nose
  \_/   \______________/\_________/ \_________/ \__/
   |           |            |            |        |
scheme     authority       path        query   fragment
------------------------------------------------------------*/

urlz = {};

urlz.match = function(){
  var r = new RegExp(
    '^(https?://)?' + // 1 optional scheme
    '([^/]*)'       + // 2 Authority
    '(/[^#?]*)?'    + // 3 optional path (anything other than a # or ?)
    '(\\?[^#]*)?'   + // 4 optional query
    '(#.*)?'        + // 5 optional fragment
    '\s*'             // trailing white space
  );

  return function(url){
    return url.match(r);
  };
}();

urlz.clean = function(url, includeQuery, includeFragment){
  var match = urlz.match(url);

  if (!includeQuery) match[4] = '';
  if (!includeFragment) match[5] = '';
  // don't allow empty scheme
  if (!match[1]) match[1] = 'http://'

  if (match[3]){
    // remove extra slashes from path
    match[3] = match[3].replace(/[\/]+/g, '/');
    // remove last slash
    match[3] = match[3].replace(/\/$/, '');
  }

  // don't allow empty path
  match[3] = match[3] || '/';
  return match.slice(1).join('');
};

urlz.isRelative = function(){
  var r = new RegExp('^(?:[a-z]+:)?//', 'i');
  return function(url){
    return (!r.test(url));
  };
}();
