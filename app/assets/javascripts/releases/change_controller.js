gonzo.controller('ChangeCtrl', ['$scope', '$routeParams', '$interval', 'Restangular', 'listener', 'changeWrapper', 'nodeWrapper',
                 function($scope, $routeParams, $interval, Restangular, listener, changeWrapper, nodeWrapper) {

  $scope.analyse = function() {
    Restangular.oneUrl('nodes', '/releases/1.0.0/check.json').get().then(function(res) {
      console.log("analyse");      
      console.log(res);
    }, function(reason) {
      console.log(reason);
    });
  };

  // Uses bulk get/save to remove nodes from "change" documents.
  // Keeps the changes in place so we don't lose metadata, just
  // the association to nodes, and removing the node reports.
  $scope.reset = function() {
   changeWrapper.alldocs().then(function(docs) {
     reset_changes = [];
     docs.rows.forEach(function(entry) {
       if (entry.doc.collection == "change") {
         entry.doc.nodes = [];
       }
       else {
         entry.doc._deleted = true;
       }
       reset_changes.push(entry.doc);
     });
     changeWrapper.bulkdocs(reset_changes).then(function(res) {
       console.log("Cleared node associations from changes");
     }, function(reason) {
       console.log(reason);
     });
   }, function(reason) {
     console.log(reason);
   });
  };  
  
  $scope.submit = function() {
    changeWrapper.add($scope.text).then(function(res) {
      $scope.text = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.remove = function(id) {
    changeWrapper.remove(id).then(function(res) {
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.query = function() {
    changeWrapper.query($scope.changes).then(function(res) {
      $scope.changes = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getNodeCount = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/mcollective/_design/nodelist/_view/all?reduce=true').get().then(function(res) {
      console.log(res);
      if (res.rows && res.rows[0].value) {
        $scope.nodecount = res.rows[0].value;
        return res.rows[0].value;
      }
    }, function(reason) {
      console.log(reason);
    });
  };
  
  $scope.getResultCount = function() {
    return $scope.results.length;
  }

  $scope.results = [];
  $scope.changes = [];
  $scope.version = $routeParams.version;
 
  // Summary progressbar
  $interval(function() {
    $scope.dynamic = $scope.getResultCount();
    $scope.max = $scope.getResultCount();
  },1000);

  $scope.$on('newResult', function(event, result) {
    if (result.collection == "report") {
      $scope.results.push(result);
    }
  });

  $scope.$on('newChange', function(event, result) {
    if (result.collection == "change") {
      $scope.changes.push(result);
    }
  });

  $scope.$on('delResult', function(event, id) {
    for (var i = 0; i<$scope.results.length; i++) {
      if ($scope.results[i]._id === id) {
        $scope.results.splice(i,1);
      }
    }
  });

  $scope.$on('delChange', function(event, id) {
    for (var i = 0; i<$scope.changes.length; i++) {
      if ($scope.changes[i]._id === id) {
        $scope.changes.splice(i,1);
      }
    }
  });

}]);