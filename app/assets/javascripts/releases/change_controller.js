gonzo.controller('ChangeCtrl', ['$scope', 'listener', 'changeWrapper', function($scope, listener, changeWrapper) {

  $scope.submit = function() {
    changeWrapper.add($scope.text).then(function(res) {
      $scope.text = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.remove = function(id) {
    changeWrapper.remove(id).then(function(res) {
//      console.log(res);
    }, function(reason) {
      console.log(reason);
    });
  };
  
  $scope.query = function() {
    changeWrapper.query($scope.changes).then(function(res) {
      $scope.changes = '';
    }, function(reason) {
      console.log(reason);
    });
  };
  

  $scope.results = [];
  $scope.changes = []; 
  console.log("in ChangeCtrl"); 

  $scope.$on('newResult', function(event, result) {
    if (result.collection == "report") {
      $scope.results.push(result);
      // console.log(result);
    }
  });

  $scope.$on('newChange', function(event, result) {
    if (result.collection == "change") {
      $scope.changes.push(result);
      console.log(result);
    }
  });
  
  $scope.$on('delResult', function(event, id) {
    for (var i = 0; i<$scope.results.length; i++) {
      if ($scope.results[i]._id === id) {
        $scope.results.splice(i,1);
      }
    }
  });

  $scope.$on('delChange', function(event, id) {
    for (var i = 0; i<$scope.changes.length; i++) {
      if ($scope.changes[i]._id === id) {
        $scope.changes.splice(i,1);
      }
    }
  });

}]);