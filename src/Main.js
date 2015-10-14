
define(['./Class', './Lexer', './Parser'], function(Class, Lexer, Parser){

  var Main = Class('Main', Object)
    .classmethod('run', function(){
      var lexer = Lexer();
      var parser = Parser();

      var fs = require('fs');
      var code = fs.readFileSync('./test.code', 'utf8');
      //var token_stream = lexer.parse('"asfd" aaa #');
      var token_stream = lexer.parse(code);
      var ast = parser.parse(token_stream);
      console.log(ast);
    });

  return Main;
});

require('./Main.js').run();
