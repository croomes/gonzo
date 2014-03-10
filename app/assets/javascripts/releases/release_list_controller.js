gonzo.controller('ReleaseListCtrl', ['$scope', 'Restangular', function($scope, Restangular) {
  $scope.releases = Restangular.all("releases.json").getList().$object;
  $scope.deployment = {};

  $scope.getDeploymentData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/mcollective/_design/releasedeployment/_view/all?reduce=true&group=true').get().then(function(res) {
      res.rows.forEach(function(row) {
        $scope.deployment[row['key']] = row['value'];
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getDeploymentData();

}]);