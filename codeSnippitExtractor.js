var fs = require('fs');
var esprima = require('esprima');


var extractSnippit = function(result) {


  var content = result.input;
  var startIndex = result.index;
  var endIndex;
  var fnQuery = result.query;
  // console.log('extractSnippit fnQuery', result.query, startIndex);
  // console.log('fnQuery', fnQuery);
  // console.log('content', content);


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


module.exports = function(content, fnQuery) {
  var resultsArr = [];
  var parsedData = esprima.tokenize(content, {range: true});
  var methodMatches = fnQuery.match(/\./g);

  if (methodMatches && methodMatches.length === 1 ) {
    var dotPosition = fnQuery.indexOf('.');
    var fnQueryPartOne = fnQuery.substring(0, dotPosition);
    var fnQueryPartTwo = fnQuery.substring(dotPosition+1);
    for (var i = 0; i <parsedData.length; i++) {
      var o = parsedData[i];
      if (o.type === 'Identifier' &&
          o.value === fnQueryPartOne &&
          parsedData[ i+1 ].value === '.' &&
          parsedData[ i+1 ].type === 'Punctuator' &&
          parsedData[ i+2 ].value === fnQueryPartTwo &&
          parsedData[ i+2 ].type === 'Identifier') {

        fnQuery = fnQueryPartOne + '.' + fnQueryPartTwo;
        // console.log('extracting snippit', {input: content, index: parsedData[ i ].range[0], query: fnQuery});
        var snippit = extractSnippit({input: content, index: parsedData[ i ].range[0], query: fnQuery});
        resultsArr.push(snippit);
        // console.log('snippit', snippit);
      }
    }
  } else if ( !methodMatches ) {
    for ( var i = 0; i < parsedData.length; i++ ) {
      var o = parsedData[i];
      if (o.type === 'Identifier' &&
        o.value === fnQuery &&
        parsedData[ i-1 ].type === 'Punctuator' &&
        parsedData[ i-1 ].value === '.' &&
        parsedData[ i-2 ].type === 'Identifier') {

        fnQuery = parsedData[ i-2 ].value + '.' + fnQuery;
        var snippit = extractSnippit({ input: content, index: parsedData[ i-2 ].range[0], query: fnQuery });
        // console.log('method snippit', snippit);
        resultsArr.push(snippit);
      } else if (o.type === 'Identifier' &&
                 o.value === fnQuery &&
                 parsedData[ i+1 ].type === 'Punctuator' &&
                 parsedData[ i+1 ].value === '.' &&
                 parsedData[ i+2 ].type === 'Identifier') {

        fnQuery = fnQuery + '.' + parsedData[ i+2 ].value;
        var snippit = extractSnippit({ input: content, index: o.range[0], query: fnQuery });
        // console.log('library snippit', snippit);
        resultsArr.push(snippit);
      }
    }
  }

  return resultsArr;
};
