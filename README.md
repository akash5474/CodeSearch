SnipSnap - Code Snippits in a Snap!

SnipSnap is a search engine meant to help Javascript developers find code examples to reference for help when implementing various modules. If a user is confused about implementing a specific method/function, we hope that SnipSnap will help them find an example.

We first wrote a web crawler to clone GitHub repositories of projects which depend on the most popular node modules on npmjs.org. Upon a user search, the GitHub repos are parsed for specific methods through a code snippet algorithm we developed using Esprima and Async libraries. After the documents have been parsed, the individual code snippets, along with the source code, are displayed on the front-end using factories, directives, filters, and modals (as well as highlight.js) to allow for the users to easily browse the results. Individual snippets also have an associated score that users can vote on after they log into GitHub.

www.snipsnap.io
