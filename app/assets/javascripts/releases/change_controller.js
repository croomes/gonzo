gonzo.controller('ChangeCtrl', ['$scope', '$routeParams', '$interval', 'Restangular', 'listener', 'changeWrapper', 'nodeWrapper',
function($scope, $routeParams, $interval, Restangular, listener, changeWrapper, nodeWrapper) {

  $scope.analyse = function() {
    Restangular.oneUrl('nodes', "/releases/" + $routeParams.version + "/check.json").get().then(function(res) {
      console.log("analyse");
      console.log(res);
    }, function(reason) {
      console.log(reason);
    });
  };

  // Uses bulk get/save to remove nodes from "change" documents.
  // Keeps the changes in place so we don't lose metadata, just
  // the association to nodes, and removing the node reports.
  $scope.reset = function() {
   changeWrapper.alldocs().then(function(docs) {
     reset_changes = [];
     docs.rows.forEach(function(entry) {
       if (entry.doc.collection == "change") {
         entry.doc.nodes = [];
       }
       else {
         entry.doc._deleted = true;
       }
       reset_changes.push(entry.doc);
     });
     changeWrapper.bulkdocs(reset_changes).then(function(res) {
       console.log("Cleared node associations from changes");
     }, function(reason) {
       console.log(reason);
     });
   }, function(reason) {
     console.log(reason);
   });
  };

  $scope.set_risk = function(id, risk) {
    changeWrapper.get(id).then(function(doc) {
      doc.risk = risk;
      changeWrapper.put(doc).then(function(res) {
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
      }, function(reason) {
        console.log(reason);
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.submit = function() {
    changeWrapper.add($scope.text).then(function(res) {
      $scope.text = '';
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.remove = function(id) {
    changeWrapper.remove(id).then(function(res) {
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

  $scope.get_tier = function(host) {
    // TODO: enforce FQDNs everywhere!!
    nodeWrapper.get_tier(host + '.croome.org').then(function(res) {
      console.log(res);
      return res;
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getNodeTierData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/mcollective/_design/tier/_view/all?reduce=true&group=true').get().then(function(res) {
      res.rows.forEach(function(row) {
        $scope.tiernodes[row['key']] = row['value'];
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getDeploymentData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/mcollective/_design/releasedeployment/_view/all?reduce=true&group=true').get().then(function(res) {
      res.rows.forEach(function(row) {
        $scope.deployment[row['key']] = row['value'];
      });
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getDeployedCount = function(version, tier) {
    if ($scope.deployment[version] && $scope.deployment[version][tier]) {
      return $scope.deployment[version][tier];
    }
  };

  $scope.getHostRiskData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/' + $scope.version + '/_design/hostrisk/_view/all?reduce=true&group=true').get().then(function(res) {
      $scope.hosts = {};

      ['dev', 'uat', 'prod'].forEach(function(cur_tier) {
        $scope.hostriskdata[cur_tier] = [];

        ['high', 'medium', 'low', 'unassessed'].forEach(function(cur_risk) {
          res.rows.forEach(function(row) {
            if (row['key'] == cur_risk) {
              Object.keys(row['value']).forEach(function(host, value) {
                if (! $scope.hosts[host]) {
                  // TODO: remove hardcoding - need to enforce FQDNs everywhere
                  nodeWrapper.get_tier(host + '.croome.org').then(function(host_tier) {
                    if (host_tier == cur_tier) {
                      found = false;
                      for(var i = 0, len = $scope.hostriskdata[cur_tier].length; i < len; i++) {
                        if( $scope.hostriskdata[cur_tier][ i ].key === cur_risk ) {
                          $scope.hostriskdata[cur_tier][ i ].key++;
                          found = true;
                        }
                      }
                      if ( ! found) {
                        $scope.hostriskdata[cur_tier].push({
                          'key': cur_risk,
                          'type': $scope.getRiskType(cur_risk),
                          'value': 1
                        });
                      }

                      // Keeping track of hosts lets us only count them once, in order of high, med, low.
                      $scope.hosts[host] = {'tier': cur_tier, 'risk': cur_risk};
                    }
                  }, function(reason) {
                    console.log(reason);
                  });
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

  $scope.getRiskData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/' + $scope.version + '/_design/risk/_view/all?reduce=true&group=true').get().then(function(res) {
      results = [];
      res.rows.forEach(function(row) {
        row.type = $scope.getRiskType(row.key);
        results.push(row);
      });
      $scope.riskdata = $scope.sortByRisk(results);
      console.log($scope.riskdata);

      total = 0;
      $scope.riskdata.forEach(function(entry) {
        total += entry.value;
      })
      $scope.risk_max = total;
    }, function(reason) {
      console.log(reason);
    });
  };

  $scope.getRiskType = function(risk) {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'info';
    }
  }

  $scope.sortByRisk = function(data) {
    results = [];
    tmprisk = {};

    data.forEach(function(row) {
      tmprisk[row.key] = row;
    });

    ['unassessed', 'low', 'medium', 'high'].forEach(function(risk) {
    // ['high', 'medium', 'low', 'unassessed'].forEach(function(risk) {
      if (tmprisk[risk]) {
        results.push(tmprisk[risk]);
      }
    })
    return results;
  }

  $scope.getNodeCount = function() {
    if (! $scope.nodecount) {
      nodeWrapper.nodecount().then(function(res) {
        $scope.nodecount = res.rows[0].value;
        $scope.getNodeCountByTier();
      }, function(reason) {
        console.log(reason);
      });
    }
  }

  // TODO: this sucks, but progress bar doesn't take objects
  $scope.getNodeCountByTier = function() {
    if ($scope.nodecount) {
      $scope.nodecount_dev = $scope.nodecount['dev'];
      $scope.nodecount_uat = $scope.nodecount['uat'];
      $scope.nodecount_prod = $scope.nodecount['prod'];
    }
  }

  $scope.getResultMax = function() {
    return $scope.results.length;
  }

  $scope.getVersion = function() {
    return angular.lowercase($routeParams.version);
  }

  $scope.version = $scope.getVersion();
  $scope.results = [];
  $scope.changes = [];
  $scope.tiernodes = {};
  $scope.deployment = {};
  $scope.hostriskdata = {};
  $scope.getRiskData();
  $scope.getDeploymentData();
  $scope.getHostRiskData();
  $scope.getNodeTierData();
  $scope.getNodeCount();

  // Summary progressbar
  $interval(function() {
    $scope.result_value = $scope.getResultMax();
    $scope.result_max = $scope.getResultMax();
    // $scope.getRiskData();
    // $scope.risk_max = $scope.getRiskMax();
  },1000);

  var colorArray = ['#000000', '#660000', '#CC0000', '#FF6666', '#FF3333', '#FF6666', '#FFE6E6'];
  $scope.colorFunction = function() {
    return function(d, i) {
      return colorArray[i];
    };
  }
  $scope.xFunction = function() {
    return function(d){
        return d.key;
    };
  };

  $scope.yFunction = function() {
    return function(d){
      return d.value;
    };
  };

  $scope.$on('newResult', function(event, result) {
    if (result.collection == "report") {
      $scope.results.push(result);
    }
  });

  $scope.$on('newChange', function(event, result) {
    if (result.collection == "change") {
      $scope.changes.push(result);
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