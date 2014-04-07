angular.module('nodeFilter', []).filter('node', function() {
  return function(input, tier) {
    if (input && tier) {
      output = [];
      input.forEach(function(node) {
        if (node.facts.gonzo_tier === tier) {
          output.push(node);
        }
      })
      return output;
    }
    else {
      return input;
    }
  };
});