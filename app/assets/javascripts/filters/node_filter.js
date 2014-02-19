// angular.module('gonzoFilters', []).filter('skip', function() {
//   return function(input, comp) {
//     // return input.nodes.length > 0 ? true : false;
//     return [1, 2, 3];
//   };
// });

// angular.module('gonzoFilters', []).
//   filter('skip', function() {
//     return function(input, uppercase) {
//       var out = "";
//       for (var i = 0; i < input.length; i++) {
//         out = input.charAt(i) + out;
//       }
//       // conditional based on optional argument
//       if (uppercase) {
//         out = out.toUpperCase();
//       }
//       return out;
//     };
//   });