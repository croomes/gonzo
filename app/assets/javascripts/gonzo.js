angular.module('gonzoFilters', []).filter('sanitise_revision', function() {
  return function(input) {
    return input.match(/^\d+/).shift();
  };
});

angular.module('gonzoFilters', []).filter('timeago', function() {
  return function(date){
    return moment.unix(date).fromNow();
  };
});

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
    $routeProvider.otherwise({
      templateUrl: '../assets/nodes/index.html',
      controller: 'NodeCtrl'
    });
  }
]);

gonzo.factory('myPouch', [function() {

  var mydb = new PouchDB('ng-pouch');
  PouchDB.replicate('http://127.0.0.1:5984/v1_0_0', 'ng-pouch', {continuous: true});
  return mydb;

}]);

gonzo.factory('nodes', [function() {

  var nodedb = new PouchDB('nodes');
  PouchDB.replicate('http://127.0.0.1:5984/mcollective', 'nodes', {continuous: true});
  // PouchDB.DEBUG = true;
  return nodedb;

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

gonzo.factory('nodeWrapper', ['$q', '$rootScope', 'nodes', function($q, $rootScope, nodes) {

  return {
    get: function(id) {
      var deferred = $q.defer();
      nodes.get(id, function(err, doc) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(doc);
          }
        });
      });
      return deferred.promise;
    },
    list: function() {
      var deferred = $q.defer();
      nodes.allDocs({include_docs: true}, function(err, res) {
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
    add: function(text) {
      var deferred = $q.defer();
      var doc = {
        type: 'result',
        text: text
      };
      nodes.post(doc, function(err, res) {
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
      nodes.get(id, function(err, doc) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            nodes.remove(doc, function(err, res) {
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

gonzo.factory('nodeListener', ['$rootScope', 'nodes', function($rootScope, nodes) {
  nodes.changes({
    continuous: true,
    onChange: function(change) {
      if (!change.deleted) {
        $rootScope.$apply(function() {
          nodes.get(change.id, function(err, doc) {
            $rootScope.$apply(function() {
              if (err) console.log(err);
              // console.log("listener: new result");
              $rootScope.$broadcast('delNode', change.id);
              $rootScope.$broadcast('newNode', doc);
              $rootScope.$broadcast('loadNode', doc);
            });
          });
        });
      } else {
        $rootScope.$apply(function() {
          $rootScope.$broadcast('delNode', change.id);
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

gonzo.controller('NodeCtrl', ['$scope', '$routeParams', '$location', 'nodeListener', 'nodeWrapper',
function($scope, $routeParams, $location, nodeListener, nodeWrapper) {

  $scope.get = function() {
    nodeWrapper.get($routeParams.nodeId).then(function(res) {
      $scope.node = res;
    }, function(reason) {
      console.log(reason);
    });
  };
  
  $scope.list = function() {
    nodeWrapper.list().then(function(res) {
      res.rows.forEach(function(element) {
        if (element.id.indexOf('_design/')) {
          $scope.nodes.push(element.doc);
        }
      });
    }, function(reason) {
      console.log(reason);
    });
  };  

  $scope.submit = function() {
    nodeWrapper.add($scope.text).then(function(res) {
      $scope.text = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.remove = function(id) {
    nodeWrapper.remove(id).then(function(res) {
//      console.log(res);
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.view = function(id) {
    return $location.path('/nodes/'+id);
  };
  
  // Load initial data
  if ($routeParams.nodeId) {
    $scope.nodes = [];
    $scope.nodeId = $routeParams.nodeId;
    if (! $scope.node) {
      $scope.get($routeParams.nodeId);
    }
  }
  else {
    if (! $scope.nodes) {
      $scope.nodes = [];
      $scope.list();
    }
  }

  // Listen for changes
  $scope.$on('newNode', function(event, node) {
    $scope.nodes.push(node);
  });

  $scope.$on('delNode', function(event, id) {
    for (var i = 0; i<$scope.nodes.length; i++) {
      if ($scope.nodes[i]._id === id) {
        $scope.nodes.splice(i,1);
      }
    }
  });

  $scope.$on('loadNode', function(event, node) {
    if ($scope.nodeId == node._id) {
      // console.log("Setting node for " + $scope.nodeId);
      $scope.node = node;
    }
  });

}]);
