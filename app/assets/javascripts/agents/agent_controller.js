gonzo.controller('AgentCtrl', ['$scope', '$routeParams', 'Agent', function($scope, $routeParams, Agent) {
  
  $scope.agents = Agent.all();
  // $scope.agents = agents.get({name: $routeParams.name}, function(agent) {
  //   $scope.name = agent.name;
  // });
}]);