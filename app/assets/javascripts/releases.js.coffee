# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
# @gonzo.controller 'Release', ['$scope', 'release_results', ($scope, release_results) -> 
#   $scope.results = [];
#   $scope.title = "Release results"
#   release_results.allDocs (err, response) ->
#     if err
#       console.log err
#     else
#       $scope.loadReleaseResults response.rows
# 
#   $scope.loadReleaseResults = (results) ->
#     i = 0
#     while i < results.length - 1
#       release = results[i]
#       release_results.get results.id, (err, doc) ->
#         if err
#           console.log err
#         else
#           $scope.$apply ->
#             $scope.results.push doc
#       i++
# ]

# gonzo.controller "ReleaseResults", ["$scope", "listener", "releaseResultsWrapper", ($scope, listener, releaseResultsWrapper) ->
#   $scope.submit = ->
#     releaseResultsWrapper.add($scope.text).then ((res) ->
#       $scope.text = ""
#     ), (reason) ->
#       console.log reason
# 
# 
#   $scope.remove = (id) ->
#     releaseResultsWrapper.remove(id).then ((res) ->
#     
#     #      console.log(res);
#     ), (reason) ->
#       console.log reason
# 
# 
#   $scope.results = []
#   $scope.$on "newResult", (event, result) ->
#     $scope.results.push result
# 
#   $scope.$on "delResult", (event, id) ->
#     i = 0
# 
#     while i < $scope.results.length
#       $scope.results.splice i, 1  if $scope.results[i]._id is id
#       i++
# 
# ]