SnipSnap - Code Snippits in a Snap!

SnipSnap is a search engine meant to help Javascript developers find code examples to reference for help when implementing various modules. If a user is confused about implementing a specific method/function, we hope that SnipSnap will help them find an example. 

We first wrote a web crawler to clone GitHub repositories of projects which depend upon the most popular node modules on npmjs.org. Upon a user search, we parse the GitHub repos for specified methods by using a code snippet algorithm we developed as well as Esprima. Users are able to vote on the most and least helpful code snippets and search results are then ordered by their rankings.

www.snipsnap.io
