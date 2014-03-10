angular.module('revisionFilter', []).filter('revision', function() {
  return function(input) {
    return input.match(/^\d+/).shift();
  };
});