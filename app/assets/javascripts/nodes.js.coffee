@gonzo.factory "pouchdb", ->
  PouchDB.enableAllDbs = true
  pouchdb = new PouchDB("nodes")
  opts =
    continuous: true
  pouchdb.replicate.from "http://localhost:5984/mcollective", opts
  pouchdb

@gonzo.controller 'Node', ['$scope', 'pouchdb', ($scope, pouchdb) -> 
  $scope.nodes = [];
  $scope.title = "Nodes"
  pouchdb.allDocs (err, response) ->
    if err
      console.log err
    else
      $scope.loadNodes response.rows

  $scope.loadNodes = (nodes) ->
    i = 0
    while i < nodes.length - 1
      node = nodes[i]
      pouchdb.get node.id, (err, doc) ->
        if err
          console.log err
        else
          $scope.$apply ->
            $scope.nodes.push doc
      i++
]