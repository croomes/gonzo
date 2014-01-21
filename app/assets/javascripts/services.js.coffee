# # @gonzo.factory "pouchdb", ->
# #   PouchDB.enableAllDbs = true
# #   pouchdb = new PouchDB("nodes")
# #   opts =
# #     continuous: true
# #   pouchdb.replicate.from "http://localhost:5984/mcollective", opts
# #   pouchdb
# #   
# @gonzo.factory "nodes", ->
#   PouchDB.enableAllDbs = true
#   nodes = new PouchDB("nodes")
#   opts =
#     continuous: true
#   nodes.replicate.from "http://localhost:5984/mcollective", opts
#   nodes
# 
# # @gonzo.factory "release_results", ->
# #   PouchDB.enableAllDbs = true
# #   release_results = new PouchDB("v1_0_0")
# #   opts =
# #     continuous: true
# #   release_results.replicate.from "http://localhost:5984/v1_0_0", opts
# #   release_results
# #   
# #   
# @gonzo.factory "releaseResults", [->
#   releaseResultsDB = new Pouch("v1_0_0")
#   releaseResultsDB.replicate.from "http://localhost:5984/v1_0_0",
#     continuous: true
#   releaseResultsDB
# ]
# @gonzo.factory "releaseResultsWrapper", ["$q", "$rootScope", "releaseResults", ($q, $rootScope, releaseResults) ->
#   add: (text) ->
#     deferred = $q.defer()
#     doc =
#       type: "releaseResult"
#       text: text
# 
#     releaseResults.post doc, (err, res) ->
#       $rootScope.$apply ->
#         if err
#           deferred.reject err
#         else
#           deferred.resolve res
# 
#     deferred.promise
# 
#   remove: (id) ->
#     deferred = $q.defer()
#     releaseResults.get id, (err, doc) ->
#       $rootScope.$apply ->
#         if err
#           deferred.reject err
#         else
#           releaseResults.remove doc, (err, res) ->
#             $rootScope.$apply ->
#               if err
#                 deferred.reject err
#               else
#                 deferred.resolve res
# 
#     deferred.promise
# ]  
