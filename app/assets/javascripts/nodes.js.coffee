# @gonzo.controller 'Nodes', ['$scope', 'nodes', ($scope, nodes) -> 
#   $scope.nodes = [];
#   $scope.title = "Nodes"
#   nodes.allDocs (err, response) ->
#     if err
#       console.log err
#     else
#       $scope.loadNodes response.rows
# 
#   $scope.loadNodes = (nodes) ->
#     i = 0
#     while i < nodes.length - 1
#       node = nodes[i]
#       nodes.get node.id, (err, doc) ->
#         if err
#           console.log err
#         else
#           $scope.$apply ->
#             $scope.nodes.push doc
#       i++
# ]