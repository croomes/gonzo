gonzo.controller('ReleaseListCtrl', ['$scope', 'Restangular', function($scope, Restangular) {
  $scope.releases = Restangular.all("releases.json").getList().$object;
}]);