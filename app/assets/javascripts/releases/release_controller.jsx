gonzo.controller('ResultCtrl', ['$scope', 'listener', 'pouchWrapper', function($scope, listener, pouchWrapper) {

  $scope.submit = function() {
    pouchWrapper.add($scope.text).then(function(res) {
      $scope.text = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.remove = function(id) {
    pouchWrapper.remove(id).then(function(res) {
//      console.log(res);
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.results = [];

  $scope.$on('newResult', function(event, result) {
    $scope.results.push(result);
  });

  $scope.$on('delResult', function(event, id) {
    for (var i = 0; i<$scope.results.length; i++) {
      if ($scope.results[i]._id === id) {
        $scope.results.splice(i,1);
      }
    }
  });

}]);