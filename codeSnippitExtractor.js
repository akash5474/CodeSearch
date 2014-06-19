var fs = require('fs');


module.exports = function(content, query) {
  var index = content.indexOf(query);
  var endIndex;

  var bracketCounter = {
   '{': 0,
   '(': 0,
   ')': 0,
   '}': 0,
   '[': 0,
   ']': 0
  };

  console.log(index);

  console.log(content[index + query.length]);

  for ( var i = index + query.length; i < content.length; i++ ) {
   if ( content[i] in bracketCounter ) {
     bracketCounter[ content[i] ]++;
   }

   if ( bracketCounter['{'] === bracketCounter['}']
     && bracketCounter['('] === bracketCounter[')']
     && bracketCounter['['] === bracketCounter[']'] )
   {
     if ( content[ i + 1 ] !== ' '
       && content[ i + 1 ] !== ';' ) {
       continue;
     } else {
       endIndex = i;
       break;
     }
   }
  }


  console.log(bracketCounter);
  console.log('startIndex', index);
  console.log('endIndex', endIndex);
  console.log('snippit');

  return content.substring(index, endIndex + 1);

};