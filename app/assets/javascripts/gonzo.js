var gonzo = angular.module('gonzo', [
  'ngRoute',
  'restangular',
  'ui.bootstrap',
  'ui.router',
  'nvd3ChartDirectives',
  'skipFilter',
  'timeagoFilter',
  'capitalizeFilter',
  'md5shortFilter',
  'revisionFilter'
]);

gonzo.config([
'$locationProvider', '$stateProvider', '$urlRouterProvider', 'RestangularProvider',
function($locationProvider, $stateProvider, $urlRouterProvider, RestangularProvider) {
  api_token = {'X-CSRF-Token':$('meta[name=csrf-token]').attr('content')};
  $locationProvider.html5Mode(true);

  // For any unmatched url, redirect to /gonzo
  // $urlRouterProvider.otherwise("");

  // Now set up the states
  $stateProvider
    .state("index", {
      url: "/",
      views: {
        'toc': {
           templateUrl: '/assets/toc.html',
           controller: 'ReleaseListCtrl'
         },
        'detail': {
           templateUrl: '/assets/releases.html',
           controller: 'ReleaseListCtrl'
         },
      }
    })
    .state("releases", {
      url: "/releases",
      views: {
        'toc': {
           templateUrl: '/assets/toc.html',
           controller: 'ReleaseListCtrl'
         },
        'summary': {
           templateUrl: '/assets/releases/summary.html',
           controller: 'ReleaseListCtrl'
         },
        'detail': {
           templateUrl: '/assets/releases/list.html',
           controller: 'ReleaseListCtrl'
         },
      }
    })
    .state("nodes", {
      url: "/nodes",
      views: {
        'toc': {
           templateUrl: '/assets/toc.html',
           controller: 'ReleaseListCtrl'
         },
        'detail': {
           templateUrl: '/assets/nodes.html',
           controller: 'NodeCtrl'
         },
      }
    })

    RestangularProvider.setBaseUrl('/api/v1');
  }]);

gonzo.run(['$state', function ($state) {
  $state.transitionTo('index');
}])

// gonzo.config([
//   '$locationProvider', '$routeProvider', 'RestangularProvider',
//   function($locationProvider, $routeProvider, RestangularProvider) {
//     api_token = {'X-CSRF-Token':$('meta[name=csrf-token]').attr('content')};
//     $locationProvider.html5Mode(true);
//     $routeProvider.when('/releases/', {
//       templateUrl: '/assets/releases/index.html',
//       controller: 'ReleaseListCtrl'
//     });
//     $routeProvider.when('/releases/refresh', {
//       templateUrl: '/assets/releases/index.html',
//       controller: 'ReleaseListCtrl',
//       resolve: {
//         release: function(Restangular, $route) {
//           return Restangular.one('releases').customPUT(null, 'refresh', null, api_token);
//         }
//       }
//     });
//     $routeProvider.when('/releases/:version', {
//       templateUrl: '/assets/releases/view.html',
//       controller: 'ReleaseEditCtrl',
//       resolve: {
//         release: function(Restangular, $route) {
//           return Restangular.one('releases', $route.current.params.version).get();
//         }
//       }
//     });
//     $routeProvider.when('/releases/:version/check', {
//       templateUrl: '/assets/releases/summary.html',
//       controller: 'ChangeCtrl',
//       resolve: {
//         release: function(Restangular, $route) {
//           return Restangular.one('releases', $route.current.params.version).customPUT(null, 'check', null, api_token);
//         }
//       }
//     });
//     $routeProvider.when('/releases/:version/summary', {
//       templateUrl: '/assets/releases/summary.html',
//       controller: 'ChangeCtrl'
//     });
//     $routeProvider.when('/releases/:version/changes', {
//       templateUrl: '/assets/releases/changes.html',
//       controller: 'ChangeCtrl'
//     });
//     $routeProvider.when('/releases/:version/reports', {
//       templateUrl: '/assets/releases/reports.html',
//       controller: 'ChangeCtrl'
//     });
//     $routeProvider.when('/nodes/:nodeId', {
//       templateUrl: '/assets/nodes/view.html',
//       controller: 'NodeCtrl'
//     });
//     $routeProvider.when('/nodes/', {
//       templateUrl: '/assets/nodes/index.html',
//       controller: 'NodeCtrl'
//     });
//     $routeProvider.when('/agents/:name', {
//       templateUrl: '/assets/agents/view.html',
//       controller: 'AgentCtrl'
//     });
//     $routeProvider.when('/agents/', {
//       templateUrl: '/assets/agents/index.html',
//       controller: 'AgentCtrl'
//     });

//     // NEW!
//     $routeProvider.when('/', {
//       templateUrl: '/assets/gonzo.html',
//       controller: 'GonzoCtrl'
//     });
//     RestangularProvider.setBaseUrl('/api/v1');
//   }
// ]);

// TODO: This breaks CouchDB, but without it we need to specify api_token in individual Restangular callss
// gonzo.config([
//   "$httpProvider", function(provider) {
//     return provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
//   },
// ]);