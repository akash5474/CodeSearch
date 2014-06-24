var fs = require('fs');
var esprima = require('esprima');


var extractSnippit = function(result) {


  var content = result.input;
  var startIndex = result.index;
  var endIndex;
  var fnQuery = result.query;
  console.log('extractSnippit fnQuery', result.query, startIndex);


  var bracketCounter = {
   '{': 0,
   '(': 0,
   ')': 0,
   '}': 0,
   '[': 0,
   ']': 0
  };

  for ( var i = startIndex + fnQuery.length; i < content.length; i++ ) {
    if ( i < 1750 ) console.log(content[i]);
    if ( content[i] in bracketCounter ) {
      bracketCounter[ content[i] ]++;
    }

    if ( bracketCounter['{'] === bracketCounter['}']
      && bracketCounter['('] === bracketCounter[')']
      && bracketCounter['['] === bracketCounter[']'] )
    {
      endIndex = i;
      break;
    }
  }

  if ( startIndex === -1 ) {
    return;
  } else {
    return content.substring(startIndex, endIndex + 1);
  }
};


module.exports = function(content, libQuery, fnQuery) {

  var resultsArr = [];
  var parsedData = esprima.tokenize(content, {range: true});
  var libVarStr;

  if( libQuery === fnQuery ) {
    fnQuery = undefined;
  }

  // Extract variable name assigned to library

  for ( var j = 0; j < parsedData.length; j++ ) {
    var o = parsedData[j];

      if ( o.type === 'String' &&
           o.value === "'"+ libQuery + "'" &&
           parsedData[ j+1 ].value === ')' &&
           parsedData[ j-1 ].value === '(' &&
           parsedData[ j-2 ].value === 'require' &&
           parsedData[ j-3 ].value === '=' &&
           parsedData[ j-4 ].type === 'Identifier' ) {

        libVarStr = parsedData[ j-4 ].value;
      }
  }

  // Extract code snippet

  for (var i = 0; i < parsedData.length; i++) {
    var o = parsedData[i];
    if ( o.type === 'Identifier' && o.value === libVarStr ) {
      if ( fnQuery ) {
        if ( parsedData[ i+1 ].value === '.' &&
             parsedData[ i+1 ].type === 'Punctuator' &&
             parsedData[ i+2 ].value === fnQuery &&
             parsedData[ i+2 ].type === 'Identifier' ) {

              resultsArr.push(extractSnippit({index: parsedData[i].range[0], input:content, query: libVarStr + '.' + fnQuery}));
        }
      } else {
        if ( parsedData[ i+1 ].value === '(' &&
             parsedData[ i+1 ].type === 'Punctuator' ) {

              resultsArr.push(extractSnippit({index: parsedData[i].range[0], input:content, query: libVarStr}));
        }
      }
    }
  }

  return resultsArr;
};
