gonzo.controller('ChangeDetailCtrl', ['$scope', '$stateParams', 'changeWrapper', 'listener',
function($scope, $stateParams, changeWrapper, listener) {

  $scope.get = function(id) {
    changeWrapper.get(id).then(function(res) {
      $scope.change = res;
       if (res.nodes) {console.log(res.nodes);}
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.set_risk = function(id, risk) {
    changeWrapper.get(id).then(function(doc) {
      doc.risk = risk;
      changeWrapper.put(doc).then(function(res) {
        // ok
      }, function(reason) {
        console.log(reason);
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.unset_risk = function(id) {
    changeWrapper.get(id).then(function(doc) {
      doc.risk = null;
      changeWrapper.put(doc).then(function(res) {
        // ok
      }, function(reason) {
        console.log(reason);
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  // Set variables from params
  if ($stateParams.changeid) {
    $scope.get($stateParams.changeid);
  }
  if ($stateParams.version) {
    $scope.version = $stateParams.version;
  }

  // Event listeners
  $scope.$on('newChange', function(event, result) {
    if (result._id == $scope.change._id) {
      // We're getting the old revision back - ask for a new copy
      $scope.get(result._id);
    }
  });

  $scope.$on('delChange', function(event, id) {
    if (id == $scope.change._id) {
      $scope.change == null;
    }
  });

}]);