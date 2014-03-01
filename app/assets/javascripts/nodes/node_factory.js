gonzo.factory('nodes', ['$location', '$interval', function($location, $interval) {

  var nodedb = new PouchDB('nodes');
  PouchDB.replicate("http://" + $location.host() + ":5984/mcollective", 'nodes', {continuous: true});
  PouchDB.DEBUG = true;

  $interval(function() {
    nodedb.compact(function(err, ok) {
      console.log("compacting nodes");
    })
  },60000); // 1 minute

  return nodedb;

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

gonzo.factory('nodeWrapper', ['$q', '$rootScope', 'nodes', function($q, $rootScope, nodes) {
  // 
  // function map_count(doc) {
  //   if(doc.type == 'Node') {
  //     emit(doc.id, null);
  //   }
  // }
  // function reduce_count(keys, values) {
  //   return sum(values);
  // }  
  
  return {
    // count: function() {
    //   console.log("in nodeWrapper: count");
    //   var deferred = $q.defer();
    //   nodes.query({map: map_count}, {reduce: reduce_count}, function(err, doc) {
    //     $rootScope.$apply(function() {
    //       if (err) {
    //         console.log("nodeWrapper: count: err");
    //         deferred.reject(err);
    //       } else {
    //         console.log("nodeWrapper: count: not err");
    //         console.log(doc);
    //         deferred.resolve(doc);
    //       }
    //     });
    //   });
    //   return deferred.promise;
    // },
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

// gonzo.factory('nodeSummary', ['$q', '$rootScope', 'nodes', function($q, $rootScope, nodes) {
//   function map(doc) {
//     if(doc.type == 'Node') {
//       emit(doc.id, null);
//     }
//   }
//   
//   console.log("nodeSummary");
//   console.log(nodes);
//   var nodeCount = nodes.query({map: map}, {reduce: false}, function(err, response) { console.log(err); });
//   console.log(nodeCount);
//   console.log(nodes.get("master.croome.org"));
//   
//   return {
//     nodeCount: nodeCount,
//   }; 
//   
// }]);
