gonzo.factory('nodes', [function() {

  var nodedb = new PouchDB('nodes');
  PouchDB.replicate('http://127.0.0.1:5984/mcollective', 'nodes', {continuous: true});
  // PouchDB.DEBUG = true;
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