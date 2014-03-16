gonzo.controller('ChangeSummaryCtrl', ['$scope', '$stateParams', 'changeWrapper', 'listener',
function($scope, $stateParams, changeWrapper, listener) {

  $scope.getVersion = function() {
    return angular.lowercase($stateParams.version);
  }

  // Set data from params
  $scope.version = $scope.getVersion();

  // Get the current changes - don't listen for updates
  if (! $scope.changes) {
    changeWrapper.get_changes().then(function(res) {
      $scope.changes = res;
    }, function(reason) {
      console.log(reason);
    });
  }

  // Listen for changes
  $scope.$on('newChange', function(event, result) {
    if (result.collection == "change") {
      if (! $scope.changes) {
        $scope.changes = [];
      }
      $scope.changes.push(result);
    }
  });

  $scope.$on('delChange', function(event, id) {
    if ($scope.changes) {
      for (var i = 0; i<$scope.changes.length; i++) {
        if ($scope.changes[i]._id === id) {
          $scope.changes.splice(i,1);
        }
      }
    }
  });

}]);