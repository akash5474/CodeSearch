var fs = require('fs');


fs.readFile('./thecode.js', function(err, data) {
  if (err) throw err;
  var content = data.toString();
  var query = 'wikipedia_page';
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
  console.log(content.substring(index, endIndex + 1));

});