var gonzo = angular.module('gonzo', ['ngRoute', 'restangular', 'ui.bootstrap', 'gonzoFilters']);

gonzo.config([
  '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/releases/:version/summary', {
      templateUrl: '/assets/releases/summary.html',      
      controller: 'ChangeCtrl'
    });
    $routeProvider.when('/releases/:version/changes', {
      templateUrl: '/assets/releases/changes.html',      
      controller: 'ChangeCtrl'
    });
    $routeProvider.when('/releases/:version/reports', {
      templateUrl: '/assets/releases/reports.html',      
      controller: 'ChangeCtrl'
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

// This breaks CouchDB, but without it can't query Rails...
// gonzo.config([
//   "$httpProvider", function(provider) {
//     return provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
//   },
// ]);