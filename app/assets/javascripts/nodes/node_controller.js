gonzo.controller('NodeCtrl', ['$scope', '$stateParams', '$location', 'nodeListener', 'nodeWrapper',
function($scope, $stateParams, $location, nodeListener, nodeWrapper) {

  $scope.get = function() {
    nodeWrapper.get($stateParams.nodeId).then(function(res) {
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
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.view = function(id) {
    return $location.path('/nodes/'+id);
  };

  // Load initial data
  $scope.tier = $stateParams.tier;

  if ($stateParams.nodeId) {
    $scope.nodes = [];
    $scope.nodeId = $stateParams.nodeId;
    if (! $scope.node) {
      $scope.get($stateParams.nodeId);
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
    // Skip design docs
    if (node.identity) {
      $scope.nodes.push(node);
    }
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