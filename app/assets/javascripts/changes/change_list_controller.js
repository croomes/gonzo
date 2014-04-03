gonzo.controller('ChangeListCtrl', ['$scope', '$stateParams', '$interval', '$modal', 'Restangular', 'listener', 'changeWrapper', 'nodeWrapper',
function($scope, $stateParams, $interval, $modal, Restangular, listener, changeWrapper, nodeWrapper) {

  // Trigger mcollective noop run from the UI
  $scope.analyse = function() {

    var modalInstance = $modal.open({
      templateUrl: '/assets/releases/progress.html',
      controller: 'ReleaseProgressCtrl',
    });

    modalInstance.result.then(function (selectedItem) {
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

    Restangular.oneUrl('nodes', "/releases/" + $stateParams.version + "/check.json").get().then(function(res) {
      console.log("analyse");
      $scope.reset();
      console.log(res);
    }, function(reason) {
      console.log(reason);
    });
  };

  // Main data-loader.  Triggered whenver version changes
  $scope.change_version = function(version) {
    changeWrapper.reset(version);
    changeWrapper.get_changes().then(function(res) {
      $scope.changes = res;
    }, function(reason) {
      console.log(reason);
    });
    changeWrapper.get_reports().then(function(res) {
      $scope.reports = res;
      $scope.update_stats();
    }, function(reason) {
      console.log(reason);
    });
  };

  // Wrapper to call methods that need re-running when the version
  // changes
  $scope.update_stats = function() {
    $scope.refreshAnalysed();
    $scope.getRiskData();
    $scope.getHostRiskData();
    $scope.getTierRiskData();
  }

  // Uses bulk get/save to remove nodes from "change" documents.
  // Keeps the changes in place so we don't lose metadata, just
  // the association to nodes, and removing the node reports.
  $scope.reset = function() {
    changeWrapper.alldocs().then(function(docs) {
      reset_changes = [];
      // $scope.analysed = {};
      $scope.reports = {};
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
        console.log("Cleared node associations from changes and removed reports");
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

  $scope.get_tier = function(host) {
    nodeWrapper.get_tier(host).then(function(res) {
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

  $scope.refreshAnalysed = function() {
    if ($scope.reports) {
      $scope.reports.forEach(function(report) {
        $scope.addAnalysedReport($scope.version, report._id);
      });
    }
  };

  $scope.addAnalysedReport = function(version, id) {
    if (version && id) {
      $scope.analysed = $scope.analysed || {};
      $scope.analysed[version] = $scope.analysed[version] || {};
      nodeWrapper.get_tier(id).then(function(tier) {
        $scope.analysed[version][tier] = $scope.analysed[version][tier] || {};
        $scope.analysed[version][tier].length = $scope.analysed[version][tier].length || 0;
        if (! $scope.analysed[version][tier][id]) {
          $scope.analysed[version][tier][id] = true;
          $scope.analysed[version][tier].length++
        }
      });
    }
  }

  $scope.removeAnalysedReport = function(version, id) {
    nodeWrapper.get_tier(id).then(function(tier) {
      if ($scope.analysed[version][tier] && $scope.analysed[version][tier][id]) {
        delete $scope.analysed[$scope.version][tier];
        if ($scope.analysed[$scope.version][tier].length > 0) {
          $scope.analysed[$scope.version][tier].length--;
        }
      }
    });
  }

  // Used by release detail template
  $scope.getDeployedCount = function(version, tier) {
    if ($scope.deployment[version] && $scope.deployment[version][tier]) {
      return $scope.deployment[version][tier];
    }
    else if ($scope.deployment[version]) {
      total = 0;
      for (var tier in $scope.deployment[version]) {
        total += $scope.deployment[version][tier];
      }
      return total;
    }
  };

  $scope.getHostRiskData = function() {
    Restangular.oneUrl('nodes', 'http://localhost:5984/r' + $scope.version + '/_design/hostrisk/_view/all?reduce=true&group=true').get().then(function(res) {
      $scope.hosts = {};

      ['dev', 'uat', 'prod', 'unknown'].forEach(function(cur_tier) {
        $scope.hostriskdata[cur_tier] = [];

        ['high', 'medium', 'low', 'unassessed'].forEach(function(cur_risk) {
          res.rows.forEach(function(row) {
            if (row['key'] == cur_risk && row['value']) {
              Object.keys(row['value']).forEach(function(host, value) {
                if (! $scope.hosts[host]) {
                  nodeWrapper.get_tier(host).then(function(host_tier) {
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
    Restangular.oneUrl('nodes', 'http://localhost:5984/r' + $scope.version + '/_design/risk/_view/all?reduce=true&group=true').get().then(function(res) {
      results = [];
      res.rows.forEach(function(row) {
        row.type = $scope.getRiskType(row.key);
        results.push(row);
      });
      $scope.riskdata = $scope.sortByRisk(results);

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
      if (tmprisk[risk]) {
        results.push(tmprisk[risk]);
      }
    })
    return results;
  }

  $scope.getTierRiskData = function() {

    $scope.tierhosts = $scope.tierhosts || {};
    $scope.tierriskdata = $scope.tierriskdata || {};

    // First populate with all hosts and their tier
    nodeWrapper.nodelist().then(function(res) {
      res.rows.forEach(function(row) {
        if (! $scope.tierhosts[row.key]) {
          $scope.tierhosts[row.key] = {'tier': Object.keys(row.value).splice(1, 1).shift()};
        }
      });
    }, function(reason) {
      console.log(reason);
    });

    Restangular.oneUrl('nodes', 'http://localhost:5984/r' + $scope.version + '/_design/hostrisk/_view/all?reduce=true&group=true').get().then(function(res) {

      ['dev', 'uat', 'prod', 'unknown'].forEach(function(cur_tier) {
        $scope.tierriskdata[cur_tier] = {};
        ['high', 'medium', 'low', 'unassessed'].forEach(function(cur_risk) {
          res.rows.forEach(function(row) {
            if (row.key === cur_risk && row.value) {
              Object.keys(row.value).forEach(function(host) {
                nodeWrapper.get_tier(host).then(function(host_tier) {
                  if (host_tier === cur_tier) {
                    if (! $scope.tierriskdata[cur_tier][cur_risk]) {
                      $scope.tierriskdata[cur_tier][cur_risk] = [];
                    }

                    // Store the highest-rated change,
                    // keeping track in tierhosts
                    if (! $scope.tierhosts[host]['risk']) {
                      $scope.tierriskdata[cur_tier][cur_risk].push(host);
                      $scope.tierhosts[host] = {'tier': cur_tier, 'risk': cur_risk};
                    }

                    // And the count of every change
                    if ($scope.tierhosts[host][cur_risk]) {
                      $scope.tierhosts[host][cur_risk] =+ row.value[host];
                    }
                    else {
                      $scope.tierhosts[host][cur_risk] = row.value[host];
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
    return $scope.reports.length;
  }

  $scope.getVersion = function() {
    // console.log("Setting version to: " + $stateParams.version);
    return angular.lowercase($stateParams.version);
  }

  // Set data from params
  $scope.version = $scope.getVersion();

  $scope.tiernodes = {};
  $scope.deployment = {};
  $scope.hostriskdata = {};
  $scope.getRiskData();
  $scope.getDeploymentData();
  // $scope.getHostRiskData();
  // $scope.getTierRiskData();
  $scope.getNodeTierData();
  $scope.getNodeCount();

  // TODO: Shouldn't need to do this...
  $scope.$watch('version', function(version) {
    console.log("version changed!!  reloading data");
    $scope.change_version(version);
  });

  $scope.$watch('changes'), function(changes) {
    $scope.update_stats();
  }

  // Listen for changes
  $scope.$on('newResult', function(event, report) {
    if (report.collection == "report") {
      if (! $scope.reports) {
        $scope.reports = [];
      }
      $scope.reports.push(report);

      // Needed for analysed stat on summary page
      if ($scope.version && report._id) {
        $scope.addAnalysedReport($scope.version, report._id);
      }
    }
  });

  $scope.$on('newChange', function(event, result) {
    if (result.collection == "change") {
      if (! $scope.changes) {
        $scope.changes = [];
      }
      $scope.changes.push(result);
    }
  });

  $scope.$on('delResult', function(event, id) {
    if ($scope.reports) {
      for (var i = 0; i<$scope.reports.length; i++) {
        if ($scope.reports[i]._id === id) {
          $scope.reports.splice(i, 1);

          // Needed for analysed stat on summary page
          $scope.removeAnalysedReport($scope.version, id);
        }
      }
    }
  });

  $scope.$on('delChange', function(event, id) {
    if ($scope.changes) {
      for (var i = 0; i<$scope.changes.length; i++) {
        if ($scope.changes[i]._id === id) {
          $scope.changes.splice(i,1);
        }
      }
    }
  });

}]);