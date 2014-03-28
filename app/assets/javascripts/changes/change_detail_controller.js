gonzo.controller('ChangeDetailCtrl', ['$scope', '$stateParams', 'changeWrapper', 'nodeWrapper', 'listener', 'Restangular',
function($scope, $stateParams, changeWrapper, nodeWrapper, listener, Restangular) {

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

  $scope.getTierRiskData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/r' + $scope.version + '/_design/hostrisk/_view/all?reduce=true&group=true').get().then(function(res) {
      $scope.tierhosts = $scope.tierhosts || {};
      $scope.tierriskdata = $scope.tierriskdata || {};

      ['dev', 'uat', 'prod', 'unknown'].forEach(function(cur_tier) {
        $scope.tierriskdata[cur_tier] = {};

        ['high', 'medium', 'low', 'unassessed'].forEach(function(cur_risk) {
          res.rows.forEach(function(row) {
            if (row['key'] == cur_risk) {
              Object.keys(row['value']).forEach(function(host, value) {

                // TODO: issues with some hostnames - need to enforce FQDNs everywhere
                nodeWrapper.get_tier(host).then(function(host_tier) {
                  if (host_tier == cur_tier) {
                    if (! $scope.tierriskdata[cur_tier][cur_risk]) {
                      $scope.tierriskdata[cur_tier][cur_risk] = [];
                    }

                    // Store the highest-rated change,
                    // keeping track in tierhosts
                    if (! $scope.tierhosts[host]) {
                      $scope.tierriskdata[cur_tier][cur_risk].push(host);
                      $scope.tierhosts[host] = {'tier': cur_tier, 'risk': cur_risk};
                    }

                    // And the count of every change
                    if ($scope.tierhosts[host][cur_risk]) {
                      $scope.tierhosts[host][cur_risk]++;
                    }
                    else {
                      $scope.tierhosts[host][cur_risk] = 1;
                    }

                  }
                }, function(reason) {
                  console.log(reason);
                });

              });
            }
          });
        });
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
  $scope.getTierRiskData();

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