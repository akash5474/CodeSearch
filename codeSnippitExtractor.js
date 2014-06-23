var fs = require('fs');
var esprima = require('esprima');

var extractLibrary = function(content, libQuery) {
  // var regex = new RegExp("require\\(\\s*[\\'\\\"]"+ libQuery +"[\\'\\\"]\\s*\\)");

  // var libIndex = content.match(regex).index;

  // var libVar = [];
  // var foundLib = false;

  // for ( var i = libIndex - 1; i >= 0; i-- ) {
  //   if ( content[i] !== '=' && content[i] !== ' ' ) {
  //     foundLib = true;
  //     libVar.unshift( content[i] );
  //   }

  //   if ( foundLib && content[i] === ' ' ) {
  //     break;
  //   }
  // }

  // return libVar.join('').trim();











};

var extractSnippit = function(result) {


  var content = result.input;
  var startIndex = result.index;
  var endIndex;
  var fnQuery = result.query;
  console.log('extractSnippit fnQuery', result.query, startIndex);
  // var libVarStr;

  // if ( result[0].indexOf('.') === -1 ) {
  //   fnQuery = result[0];
  // } else {
  //   query = result[0].split('.');
  //   libVarStr = query[0];
  //   fnQuery = query[1];
  // }

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

  // if (libQuery && libQuery !== fnQuery){
  //   var libVarStr = extractLibrary(content, libQuery);
  //   var regex = new RegExp(libVarStr + '\\.' + fnQuery, 'g');
  // } else  {
  //   var regex = new RegExp(fnQuery, 'g');
  // }

  // var result;
  var resultsArr = [];

  // while( (result = regex.exec(content)) != null ) {
  //   resultsArr.push( extractSnippit(result) );
  // }

  // console.log(resultsArr);

  if( libQuery === fnQuery ) {
    fnQuery = undefined;
  }

  var parsedData = esprima.tokenize(content, {range: true});

  var libVarStr;

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

  console.log("LIBVARSTRING:", libVarStr)

  for (var i = 0; i < parsedData.length; i++) {
    var o = parsedData[i];
    if ( o.type === 'Identifier' && o.value === libVarStr ) {
      if ( fnQuery ) {
        if ( parsedData[ i+1 ].value === '.' &&
             parsedData[ i+1 ].type === 'Punctuator' &&
             parsedData[ i+2 ].value === fnQuery &&
             parsedData[ i+2 ].type === 'Identifier' ) {

          console.log({index: parsedData[i].range[0], query: libVarStr + '.' + fnQuery});
          resultsArr.push(extractSnippit({index: parsedData[i].range[0], input:content, query: libVarStr + '.' + fnQuery}));
        }
      } else {
        if ( parsedData[ i+1 ].value === '(' &&
             parsedData[ i+1 ].type === 'Punctuator' ) {

          console.log({index: parsedData[i].range[0], query: libVarStr});
          resultsArr.push(extractSnippit({index: parsedData[i].range[0], input:content, query: libVarStr}));
        }
      }
    }
  }

  return resultsArr;
};
