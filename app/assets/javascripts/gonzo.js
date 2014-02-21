var gonzo = angular.module('gonzo', ['ngRoute', 'restangular', 'ui.bootstrap', 'nvd3ChartDirectives', 'skipFilter', 'timeagoFilter']);

gonzo.config([
  '$locationProvider', '$routeProvider', 'RestangularProvider', function($locationProvider, $routeProvider, RestangularProvider) {
    api_token = {'X-CSRF-Token':$('meta[name=csrf-token]').attr('content')};
    $locationProvider.html5Mode(true);
    $routeProvider.when('/releases/', {
      templateUrl: '/assets/releases/index.html',
      controller: 'ReleaseListCtrl'
    });
    $routeProvider.when('/releases/:version', {
      templateUrl: '/assets/releases/view.html',
      controller: 'ReleaseEditCtrl',
      resolve: {
        release: function(Restangular, $route) {
          return Restangular.one('releases', $route.current.params.version).get();
        }
      }
    });
    $routeProvider.when('/releases/:version/check', {
      templateUrl: '/assets/releases/summary.html',
      controller: 'ChangeCtrl',
      resolve: {
        release: function(Restangular, $route) {
          return Restangular.one('releases', $route.current.params.version).customPUT(null, 'check', null, api_token);
        }
      }      
    });    
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
    RestangularProvider.setBaseUrl('http://localhost:3000/api/v1');
  }
]);

// TODO: This breaks CouchDB, but without it we need to specify api_token in individual Restangular callss
// gonzo.config([
//   "$httpProvider", function(provider) {
//     return provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
//   },
// ]);