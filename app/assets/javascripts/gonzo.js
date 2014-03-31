var gonzo = angular.module('gonzo', [
  'ngRoute',
  'restangular',
  'ui.bootstrap',
  'ui.router',
  'ngTagsInput',
  'nvd3ChartDirectives',
  'skipFilter',
  'timeagoFilter',
  'capitalizeFilter',
  'releaseFilter',
  'md5shortFilter',
  'revisionFilter'
]);

gonzo.config([
'$locationProvider', '$stateProvider', '$urlRouterProvider', 'RestangularProvider', 'tagsInputConfigProvider',
function($locationProvider, $stateProvider, $urlRouterProvider, RestangularProvider, tagsInputConfigProvider) {
  api_token = {'X-CSRF-Token':$('meta[name=csrf-token]').attr('content')};
  $locationProvider.html5Mode(true);

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
    .state("releases.refresh", {
      url: "/refresh",
      controller: 'ReleaseListCtrl',
      resolve: {
        release: function(Restangular, $route) {
          return Restangular.one('releases').customPUT(null, 'refresh', null, api_token);
        }
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
      url: "/tiers/:tier",
      views: {
        'summary@': {
           templateUrl: '/assets/tiers/summary.html',
           controller: 'ReleaseListCtrl'
         },
        'detail@': {
           templateUrl: '/assets/tiers/list.html',
           controller: 'NodeCtrl'
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

    // Can probably remove this, and set manually when we call the directive
    tagsInputConfigProvider
      .setDefaults('tagsInput', {
        placeholder: '',
      })
      .setDefaults('autoComplete', {
        minLength: 0,
      });

  }]);

gonzo.run(['$state', '$rootScope', '$urlRouter', function ($state, $rootScope, $urlRouter) {
}])