// angular.module('skipFilter', []).filter('skip', function() {
//   return function(input, empty) {
//     // Do nothing is we need to include empty nodes
//     if (! input) {
//       return;
//     }
//     if (empty) {
//       return input;
//     }
//     output = [];
//     input.forEach(function(entry) {
//       if (entry.nodes && entry.nodes.length > 0) {
//         output.push(entry);
//       }
//     })
//     return output;
//   };
// });