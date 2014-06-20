var fs = require('fs');

var extractLibrary = function(content, libQuery) {
  var regex = new RegExp("require\\(\\s*[\\'\\\"]"+ libQuery +"[\\'\\\"]\\s*\\)");

  var libIndex = content.match(regex).index;

  var libVar = [];
  var foundLib = false;

  for ( var i = libIndex - 1; i >= 0; i-- ) {
    if ( content[i] !== '=' && content[i] !== ' ' ) {
      foundLib = true;
      libVar.unshift( content[i] );
    }

    if ( foundLib && content[i] === ' ' ) {
      break;
    }
  }

  return libVar.join('').trim();
};

var extractSnippit = function(result) {
  var content = result.input;
  var startIndex = result.index;
  var query = result[0].split('.');
  var libVarStr = query[0];
  var fnQuery = query[1];
  var endIndex;

  var bracketCounter = {
   '{': 0,
   '(': 0,
   ')': 0,
   '}': 0,
   '[': 0,
   ']': 0
  };

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

module.exports = function(content, libQuery, fnQuery) {

  var libVarStr = extractLibrary(content, libQuery);

  var regex = new RegExp(libVarStr + '\\.' + fnQuery, 'g');

  var result;
  var resultsArr = [];

  while( (result = regex.exec(content)) != null ) {
    resultsArr.push( extractSnippit(result) );
  }

  // console.log(resultsArr);

  return resultsArr;
};
