var ReleaseProgressCtrl = function ($scope, $interval, $modalInstance) {

  // Summary progressbar
  var progressInterval = $interval(function() {
    $scope.result_value = $scope.getResultMax();
    $scope.result_max = $scope.getResultMax();
    console.log("results=");
    console.log($scope.results);
  }, 1000);

  $scope.close = function () {
    $modalInstance.dismiss('close');
  };

  $scope.getResultMax = function() {
    return $scope.reports.length;
  }

  // Empty reports
  $scope.reports= [];

  // Clear up timer when we lose scope
  $scope.$on(
    "$destroy", function( event ) {
      if (angular.isDefined(progressInterval)) {
        $interval.cancel(progressInterval);
        progressInterval = undefined;
      }
    }
  );

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