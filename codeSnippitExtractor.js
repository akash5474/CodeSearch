var fs = require('fs');


module.exports = function(content, query) {
  var startIndex = content.indexOf(query);
  var endIndex;

  var bracketCounter = {
   '{': 0,
   '(': 0,
   ')': 0,
   '}': 0,
   '[': 0,
   ']': 0
  };

  // console.log(startIndex);

  // console.log(content[startIndex + query.length]);

  for ( var i = startIndex + query.length; i < content.length; i++ ) {
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


  // console.log(bracketCounter);
  console.log('startIndex:', startIndex);
  console.log('endIndex:', endIndex);
  console.log('snippit:', content.substring(startIndex, endIndex + 1));

  if ( startIndex === -1 ) {
    return;
  } else {
    return content.substring(startIndex, endIndex + 1);
  }
};
