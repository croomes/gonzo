gonzo.controller('ReleaseListCtrl', ['$scope', '$stateParams', 'Restangular', function($scope, $stateParams, Restangular) {
  $scope.version = $stateParams.version;
  $scope.releases = Restangular.all("releases.json").getList().$object;
  $scope.deployment = {};

  // Default sort
  $scope.predicate = 'slug';

  $scope.getDeploymentData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/mcollective/_design/releasedeployment/_view/all?reduce=true&group=true').get().then(function(res) {
      res.rows.forEach(function(row) {
        total = 0;
        $scope.deployment[row['key']] = row['value'];
        for(var tier in row['value']) {
          total += row['value'][tier];
        }
        $scope.deployment[row['key']]['total'] = total;
      });

    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getReleaseMaxNodes = function(release) {
    return $scope.deployment[release] ? $scope.deployment[release]['total'] : 0;
  }

  $scope.row_class = function(version) {
    if (version === $scope.version) {
      return "list-container-selected";
    }
  }

  $scope.getDeploymentData();

}]);