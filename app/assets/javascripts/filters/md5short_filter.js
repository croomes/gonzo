angular.module('md5shortFilter', []).filter('md5short', function() {
  return function(input, scope) {
    if (input != null) {
      input = input.substring(0,7);
    }
    return input
  }
});