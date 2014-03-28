angular.module('releaseFilter', []).filter('release', function() {
  return function(input) {
    if (input) {
      return input.replace(/_/g,".");
    }
    else {
      return '-';
    }
  };
});