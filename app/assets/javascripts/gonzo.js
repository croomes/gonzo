var gonzo = angular.module('gonzo', ['ngRoute', 'ngResource', 'gonzoFilters']);

gonzo.config([
  '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/releases/:version/check_results', {
      templateUrl: '/assets/releases/results.html',      
      controller: 'ResultCtrl'
    });
    $routeProvider.when('/nodes/:nodeId', {
      templateUrl: '/assets/nodes/view.html',
      controller: 'NodeCtrl'
    });
    $routeProvider.when('/nodes/', {
      templateUrl: '/assets/nodes/index.html',
      controller: 'NodeCtrl'
    });
    $routeProvider.when('/agents/:name', {
      templateUrl: '/assets/agents/view.html',
      controller: 'AgentCtrl'
    });
    $routeProvider.when('/agents/', {
      templateUrl: '/assets/agents/index.html',
      controller: 'AgentCtrl'
    });
  }
]);

gonzo.config([
  "$httpProvider", function(provider) {
    return provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
  }
]);