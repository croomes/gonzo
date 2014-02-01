var gonzo = angular.module('gonzo', ['ngRoute', 'gonzoFilters']);

gonzo.config([
  '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/releases/:version/check_results', {
      controller: 'ResultCtrl'
    });
    $routeProvider.when('/nodes/:nodeId', {
      templateUrl: '../assets/nodes/view.html',
      controller: 'NodeCtrl'
    });
    $routeProvider.when('/nodes/', {
      templateUrl: '../assets/nodes/index.html',
      controller: 'NodeCtrl'
    });
  }
]);

