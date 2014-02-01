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