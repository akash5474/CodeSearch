var fs = require('fs');

module.exports = function(content, libQuery, fnQuery) {

  var regex = new RegExp("require\\(\\s*[\\'\\\"]"+ libQuery +"[\\'\\\"]\\s*\\)");

  var libIndex = content.match(regex);

  var libVar = [];
  var foundLib = false;

  for ( var i = libIndex.index - 1; i >= 0; i-- ) {
    if ( content[i] !== '=' && content[i] !== ' ' ) {
      foundLib = true;
      libVar.unshift( content[i] );
    }

    if ( foundLib && content[i] === ' ' ) {
      break;
    }
  }

  var libVarStr = libVar.join('').trim()

  // console.log( libVarStr );

  var startIndex = content.indexOf(libVarStr + '.' + fnQuery);
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

  // console.log(content[startIndex + fnQuery.length]);

  for ( var i = startIndex + fnQuery.length; i < content.length; i++ ) {
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
  // console.log('startIndex:', startIndex);
  // console.log('endIndex:', endIndex);
  // console.log('snippit:', content.substring(startIndex, endIndex + 1));

  if ( startIndex === -1 ) {
    return;
  } else {
    return content.substring(startIndex, endIndex + 1);
  }
};
