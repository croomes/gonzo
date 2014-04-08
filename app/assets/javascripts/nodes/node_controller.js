gonzo.controller('NodeCtrl', ['$scope', '$stateParams', '$location', 'nodeListener', 'nodeWrapper', 'Restangular',
function($scope, $stateParams, $location, nodeListener, nodeWrapper, Restangular) {

  $scope.get = function() {
    nodeWrapper.get($stateParams.nodeId).then(function(res) {
      $scope.node = res;
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.list = function() {
    nodeWrapper.list().then(function(res) {
      res.rows.forEach(function(element) {
        if (element.id.indexOf('_design/')) {
          $scope.nodes.push(element.doc);
        }
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.submit = function() {
    nodeWrapper.add($scope.text).then(function(res) {
      $scope.text = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.remove = function(id) {
    nodeWrapper.remove(id).then(function(res) {
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.view = function(id) {
    return $location.path('/nodes/'+id);
  };

  // TODO: Duplicates from change_list_controller, find a way to share
  $scope.getTierHosts = function(host) {
    $scope.tierhosts = $scope.tierhosts || {};
    nodeWrapper.nodelist().then(function(res) {
      res.rows.forEach(function(row) {
        $scope.tierhosts[row.key] = $scope.tierhosts[row.key] || {};
        $scope.tierhosts[row.key]['tier'] = Object.keys(row.value).splice(1, 1).shift();
      });

      // Trigger stats update
      $scope.getTierRiskData();

    }, function(reason) {
      console.log(reason);
    });
  };

  // TODO: check only current tier (or take as function)
  // TODO: Duplicates from change_list_controller, find a way to share
  $scope.getTierRiskData = function() {

    $scope.tierriskdata = $scope.tierriskdata || {};

    Restangular.oneUrl('nodes', 'http://localhost:5984/r' + $scope.version + '/_design/hostrisk/_view/all?reduce=true&group=true').get().then(function(res) {
      ['dev', 'uat', 'prod', 'unknown'].forEach(function(cur_tier) {
        $scope.tierriskdata[cur_tier] = {};
        ['high', 'medium', 'low', 'unassessed'].forEach(function(cur_risk) {
          res.rows.forEach(function(row) {
            if (row.key === cur_risk && row.value) {
              Object.keys(row.value).forEach(function(host) {

                if ($scope.tierhosts[host] && $scope.tierhosts[host]['tier'] === cur_tier) {
                  if (! $scope.tierriskdata[cur_tier][cur_risk]) {
                    $scope.tierriskdata[cur_tier][cur_risk] = [];
                  }

                  // Store the highest-rated change,
                  // keeping track in tierhosts
                  if (! $scope.tierhosts[host]['risk']) {
                    $scope.tierhosts[host]['risk'] = cur_risk;
                  }

                  if ($scope.tierhosts[host]['risk'] === cur_risk) {
                    $scope.tierriskdata[cur_tier][cur_risk].push(host);
                  }

                  // And the count of every change
                  if ($scope.tierhosts[host][cur_risk]) {
                    $scope.tierhosts[host][cur_risk] =+ row.value[host];
                  }
                  else {
                    $scope.tierhosts[host][cur_risk] = row.value[host];
                  }
                }
              });
            }
          });
        });
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  // Load initial data
  $scope.tier = $stateParams.tier;
  $scope.version = $stateParams.version;
  $scope.getTierHosts();

  if ($stateParams.nodeId) {
    $scope.nodes = [];
    $scope.nodeId = $stateParams.nodeId;
    if (! $scope.node) {
      $scope.get($stateParams.nodeId);
    }
  }
  else {
    if (! $scope.nodes) {
      $scope.nodes = [];
      $scope.list();
    }
  }

  // Listen for changes
  $scope.$on('newNode', function(event, node) {
    // Skip design docs
    if (node.identity) {
      $scope.nodes.push(node);
    }
  });

  $scope.$on('delNode', function(event, id) {
    for (var i = 0; i<$scope.nodes.length; i++) {
      if ($scope.nodes[i]._id === id) {
        $scope.nodes.splice(i,1);
      }
    }
  });

  $scope.$on('loadNode', function(event, node) {
    if ($scope.nodeId == node._id) {
      // console.log("Setting node for " + $scope.nodeId);
      $scope.node = node;
    }
  });

}]);