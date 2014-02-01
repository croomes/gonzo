angular.module('gonzoFilters', []).filter('timeago', function() {
  return function(date){
    return moment.unix(date).fromNow();
  };
});