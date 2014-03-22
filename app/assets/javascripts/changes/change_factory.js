gonzo.factory('changedb', ['$stateParams', function($stateParams) {

  // CouchDB breaks on uppercase.
  // TODO: There are a few other rules we should check for.

  if ($stateParams.version) {
    version = angular.lowercase($stateParams.version);
  }
  else {
    version = '1.0.0';
  }

  console.log("change factory, version: " + version);
  var changedb = new PouchDB(version);
  PouchDB.replicate('http://127.0.0.1:5984/' + version, version, {continuous: true});
  PouchDB.replicate(version, 'http://127.0.0.1:5984/' + version, {continuous: true});
  return changedb;

}]);

gonzo.factory('listener', ['$rootScope', 'changedb', function($rootScope, changedb) {
  changedb.changes({
    continuous: true,
    onChange: function(change) {
      if (!change.deleted) {
        $rootScope.$apply(function() {
          changedb.get(change.id, function(err, doc) {
            $rootScope.$apply(function() {
              if (err) console.log(err);
              // console.log("listener: new result");
              $rootScope.$broadcast('delResult', change.id);
              $rootScope.$broadcast('delChange', change.id);

              $rootScope.$broadcast('newChange', doc);
              $rootScope.$broadcast('newResult', doc);
            });
          });
        });
      } else {
        $rootScope.$apply(function() {
          $rootScope.$broadcast('delResult', change.id);
          $rootScope.$broadcast('delChange', change.id);
        });
      }
    }
  });
}]);

gonzo.factory('changeWrapper', ['$q', '$rootScope', 'changedb', function($q, $rootScope, changedb) {

  return {
    reset: function(version) {
      changedb = new PouchDB(version);
      console.log("reset change factory to version: " + version);
      PouchDB.replicate('http://127.0.0.1:5984/' + version, version, {continuous: true});
      PouchDB.replicate(version, 'http://127.0.0.1:5984/' + version, {continuous: true});
    },
    query: function(text) {
      var deferred = $q.defer();
      var doc = {
        type: 'result',
        text: text
      };
      changedb.query({map:
        function(doc) {
          if ("changes" == doc.collection) {
            emit([doc._id, 0], doc.output);
          }
          if ("report") {
            if (doc.changes) {
              for (var i in doc.changes) {
                emit([doc.changes[i], doc.senderid], doc._id);
              }
            }
          }
        }
      }, {reduce: false}, function(err, res) {
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
    get_changes: function(text) {
      var deferred = $q.defer();
      changedb.query({map:
        function(doc) {
          if ("change" == doc.collection) {
            emit([doc._id, 0], doc);
          }
        }
      }, {reduce: false}, function(err, res) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            changes = [];
            res.rows.forEach(function(element, index) {
              if (element.value) {
                changes.push(element.value);
              }
            })
            deferred.resolve(changes);
          }
        });
      });
      return deferred.promise;
    },
    get_reports: function(text) {
      var deferred = $q.defer();
      changedb.query({map:
        function(doc) {
          if ("report" == doc.collection) {
            emit([doc._id, 0], doc);
          }
        }
      }, {reduce: false}, function(err, res) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            reports = [];
            res.rows.forEach(function(element, index) {
              if (element.value) {
                reports.push(element.value);
              }
            })
            deferred.resolve(reports);
          }
        });
      });
      return deferred.promise;
    },
    get: function(id) {
      var deferred = $q.defer();
      changedb.get(id, function(err, res) {
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
    put: function(doc) {
      var deferred = $q.defer();
      changedb.put(doc, function(err, res) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            console.log("put ok:");
            console.log(res);
            console.log(doc);
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
      changedb.post(doc, function(err, res) {
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
      changedb.get(id, function(err, doc) {
        $rootScope.$apply(function() {
          if (err) {
            deferred.reject(err);
          } else {
            changedb.remove(doc, function(err, res) {
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
    },
    alldocs: function() {
      var deferred = $q.defer();
      changedb.allDocs({include_docs: true}, function(err, res) {
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
    bulkdocs: function(docs) {
      var deferred = $q.defer();
      // console.log(docs);
      changedb.bulkDocs({docs: docs}, function(err, res) {
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
  };

}]);
