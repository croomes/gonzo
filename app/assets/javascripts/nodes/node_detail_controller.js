gonzo.controller('NodeDetailCtrl', ['$scope', '$stateParams', 'nodeWrapper',
function($scope, $stateParams, nodeWrapper) {

  $scope.get = function(id) {
    nodeWrapper.get(id).then(function(res) {
      $scope.node = res;
    }, function(reason) {
      console.log(reason);
    });
  };

  // Load initial data
  if ($stateParams.certname) {
    $scope.certname = $stateParams.certname;
    if (! $scope.node) {
      $scope.get($scope.certname);
    }
  }

  // Listen for changes
  $scope.$on('newNode', function(event, node) {
    if (node._id === $scope.certname) {
      $scope.node = node;
    }
  });

  $scope.$on('delNode', function(event, id) {
    if (id === $scope.certname) {
      $scope.node = null;
    }
  });

  $scope.$on('loadNode', function(event, node) {
    if (node._id === $scope.certname) {
      $scope.node = node;
    }
  });

}]);