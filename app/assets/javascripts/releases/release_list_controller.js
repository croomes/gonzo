gonzo.controller('ReleaseListCtrl', ['$scope', '$stateParams', 'Restangular', function($scope, $stateParams, Restangular) {
  $scope.version = $stateParams.version;
  $scope.releases = Restangular.all("releases.json").getList().$object;
  $scope.deployment = {};
  $scope.tiers = {};

  // Default sort
  $scope.predicate = 'slug';

  $scope.getReleaseDeploymentData = function() {
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

  $scope.getTierDeploymentData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/mcollective/_design/tier/_view/all?reduce=true&group=true').get().then(function(res) {
      res.rows.forEach(function(row) {
        $scope.tiers[row['key']] = row['value'];
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getReleaseMaxNodes = function(release) {
    return $scope.deployment[release] ? $scope.deployment[release]['total'] : 0;
  }

  $scope.getTierMax = function() {
    total = 0;
    for(var tier in $scope.tiers) {
      total += $scope.tiers[tier];
    }
    return total;
  }

  $scope.row_class = function(version) {
    if (version === $scope.version) {
      return "list-container-selected";
    }
  }

  $scope.getReleaseDeploymentData();
  $scope.getTierDeploymentData();

}]);