gonzo.factory('Agent', ['$resource', function($resource) {
  function Agent() {
    this.service = $resource('/api/agents/:name', {name: '@name'});
  };
  Agent.prototype.all = function() {
    return this.service.query();
  };
  return new Agent;
}]);