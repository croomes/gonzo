function ReleaseEditCtrl($scope, $location, Restangular, release) {
  var original = release;
  $scope.release = Restangular.copy(original);
  

  $scope.isClean = function() {
    return angular.equals(original, $scope.release);
  }

  $scope.destroy = function() {
    original.remove().then(function() {
      $location.path('/releases');
    });
  };

  $scope.save = function() {
    $scope.release.put().then(function() {
      $location.path('/releases');
    });
  };
}