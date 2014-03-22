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
        'summary': {
           templateUrl: '/assets/toc.html',
           controller: 'ReleaseListCtrl'
         },
        'detail': {
           templateUrl: '/assets/releases/list.html',
           controller: 'ReleaseListCtrl'
         },
      }
    })
    .state("releases", {
      url: "/releases",
      views: {
        'summary@': {
           templateUrl: '/assets/toc.html',
           controller: 'ReleaseListCtrl'
         },
        'detail@': {
           templateUrl: '/assets/releases/list.html',
           controller: 'ReleaseListCtrl'
         },
      }
    })
    .state("releases.detail", {
      url: "/:version",
      views: {
        'summary@': {
           templateUrl: '/assets/releases/summary.html',
           controller: 'ReleaseListCtrl'
         },
        'detail@': {
           templateUrl: '/assets/releases/detail.html',
           controller: 'ChangeListCtrl'
         },
      }
    })
    .state("releases.detail.change", {
      url: "/changes/:changeid",
      views: {
        'summary@': {
           templateUrl: '/assets/changes/summary.html',
           controller: 'ChangeSummaryCtrl'
         },
        'detail@': {
           templateUrl: '/assets/changes/detail.html',
           controller: 'ChangeDetailCtrl'
         },
      }
    })
    .state("releases.detail.tier", {
      url: "/tier/:tier",
      views: {
        'summary@': {
           templateUrl: '/assets/tiers/summary.html',
           controller: 'ChangeSummaryCtrl'
         },
        'detail@': {
           templateUrl: '/assets/tiers/detail.html',
           controller: 'ChangeDetailCtrl'
         },
      }
    })
    .state("nodes", {
      url: "/nodes",
      views: {
        'summary@': {
           templateUrl: '/assets/toc.html',
           controller: 'ReleaseListCtrl'
         },
        'detail@': {
           templateUrl: '/assets/nodes/list.html',
           controller: 'NodeCtrl'
         },
      }
    })
    .state("nodes.detail", {
      url: "/:certname",
      views: {
        'summary@': {
           templateUrl: '/assets/nodes/summary.html',
           controller: 'NodeSummaryCtrl'
         },
        'detail@': {
           templateUrl: '/assets/nodes/detail.html',
           controller: 'NodeDetailCtrl'
         },
      }
    })

    RestangularProvider.setBaseUrl('/api/v1');
  }]);

gonzo.run(['$state', '$rootScope', '$urlRouter', function ($state, $rootScope, $urlRouter) {
  console.log("gonzo run");
  console.log($state);
  // $state.transitionTo('index');

  // $rootScope.$on('$locationChangeSuccess', function(evt) {
  //   // console.log(evt);
  //   // Halt state change from even starting
  //   evt.preventDefault();
  //   // Perform custom logic
  //   var meetsRequirement = true;
  //   // Continue with the update and state transition if logic allows
  //   if (meetsRequirement) $urlRouter.sync();
  // });

  // $rootScope.$on('$viewContentLoading', function(event, viewConfig) {
  //   console.log(viewConfig);
  //     // Access to all the view config properties.
  //     // and one special property 'targetView'
  //     // viewConfig.targetView
  // });

  // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
  //   console.log('$stateChangeStart');
  // });
  // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
  //   console.log('$stateChangeSuccess');
  // });
  // $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
  //   console.log('$stateChangeError:');
  //   console.log(error);
  // });

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