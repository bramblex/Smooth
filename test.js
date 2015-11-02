
var source_code = require('fs').readFileSync('./code', 'utf-8');
console.log(require('./dist/Main').parse(source_code));
