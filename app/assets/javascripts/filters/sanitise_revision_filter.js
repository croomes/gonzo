angular.module('gonzoFilters', []).filter('sanitise_revision', function() {
  return function(input) {
    return input.match(/^\d+/).shift();
  };
});