angular.module('gonzoFilters', []).filter('sanitise_revision', function() {
  return function(input) {
    return input.match(/^\d+/).shift();
  };
});

var gonzo = angular.module('gonzo', ['ngRoute', 'gonzoFilters']);

gonzo.config([
  '$routeProvider', function($routeProvider) {
    return $routeProvider.when('/releases/:version/check_results', {
      controller: 'ResultCtrl'
    });
  }
]);

gonzo.factory('myPouch', [function() {

  var mydb = new PouchDB('ng-pouch');
  // PouchDB.replicate('ng-pouch', 'http://127.0.0.1:5984/v1_0_0', {continuous: true});
  PouchDB.replicate('http://127.0.0.1:5984/v1_0_0', 'ng-pouch', {continuous: true});
  return mydb;

}]);

gonzo.factory('pouchWrapper', ['$q', '$rootScope', 'myPouch', function($q, $rootScope, myPouch) {

  return {
    add: function(text) {
      var deferred = $q.defer();
      var doc = {
        type: 'result',
        text: text
      };
      myPouch.post(doc, function(err, res) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(res);
          }
        });
      });
      return deferred.promise;
    },
    remove: function(id) {
      var deferred = $q.defer();
      myPouch.get(id, function(err, doc) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            myPouch.remove(doc, function(err, res) {
              $rootScope.$apply(function() {
                if (err) {
                  deferred.reject(err);
                } else {
                  deferred.resolve(res);
                }
              });
            });
          }
        });
      });
      return deferred.promise;
    }
  };

}]);

gonzo.factory('listener', ['$rootScope', 'myPouch', function($rootScope, myPouch) {

  myPouch.changes({
    continuous: true,
    onChange: function(change) {
      if (!change.deleted) {
        $rootScope.$apply(function() {
          myPouch.get(change.id, function(err, doc) {
            $rootScope.$apply(function() {
              if (err) console.log(err);
              // console.log("listener: new result");
              $rootScope.$broadcast('delResult', change.id);
              $rootScope.$broadcast('newResult', doc);
            });
          });
        });
      } else {
        $rootScope.$apply(function() {
          $rootScope.$broadcast('delResult', change.id);
        });
      }
    }
  });
}]);

gonzo.controller('ResultCtrl', ['$scope', 'listener', 'pouchWrapper', function($scope, listener, pouchWrapper) {

  $scope.submit = function() {
    pouchWrapper.add($scope.text).then(function(res) {
      $scope.text = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.remove = function(id) {
    pouchWrapper.remove(id).then(function(res) {
//      console.log(res);
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.results = [];

  $scope.$on('newResult', function(event, result) {
    $scope.results.push(result);
  });

  $scope.$on('delResult', function(event, id) {
    for (var i = 0; i<$scope.results.length; i++) {
      if ($scope.results[i]._id === id) {
        $scope.results.splice(i,1);
      }
    }
  });

}]);