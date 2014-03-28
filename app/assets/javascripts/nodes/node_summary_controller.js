gonzo.controller('NodeSummaryCtrl', ['$scope', '$stateParams', '$location', 'nodeListener', 'nodeWrapper',
function($scope, $stateParams, $location, nodeListener, nodeWrapper) {

  // Default sort
  $scope.predicate = 'facts.gonzo_tier';

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

  $scope.row_class = function(certname) {
    if (certname === $scope.certname) {
      return "list-container-selected";
    }
  }

  // Load initial data
  if ($stateParams.certname) {
    $scope.certname = $stateParams.certname;
  }
  if (! $scope.nodes) {
    $scope.nodes = [];
    $scope.list();
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

}]);