# This is basically how we tell
# Angular about the existence of our application.
@gonzo = angular.module('gonzo', ['ngRoute'])

# This routing directive tells Angular about the default
# route for our application. The term "otherwise" here
# might seem somewhat awkward, but it will make more
# sense as we add more routes to our application.
@gonzo.config(['$routeProvider', ($routeProvider) ->
  $routeProvider.
    when('/nodes', {
      controller: 'Node'
    })
])
