var ReleaseProgressCtrl = function ($scope, $interval, $modalInstance, nodeWrapper) {

  $scope.close = function () {
    $modalInstance.dismiss('close');
  };

  $scope.getResultMax = function() {
    nodeWrapper.nodecount().then(function(res) {
      $scope.result_max = res.rows[0].value['total'];
    }, function(reason) {
      console.log(reason);
    });
  }

  // Empty reports
  $scope.reports= [];

  // Set expected node total
  $scope.getResultMax();

  // Listen for changes
  $scope.$on('newResult', function(event, result) {
    if (result.collection == "report") {
      if (! $scope.reports) {
        $scope.reports = [];
      }
      $scope.reports.push(result);
    }
  });

  $scope.$on('delResult', function(event, id) {
    if ($scope.reports) {
      for (var i = 0; i<$scope.reports.length; i++) {
        if ($scope.reports[i]._id === id) {
          $scope.reports.splice(i,1);
        }
      }
    }
  });

};