
define(['./Class', './Lexer'], function(Class, Lexer){

  var Main = Class('Main', Object)
    .classmethod('run', function(){
      var lexer = Lexer();

      var fs = require('fs');
      var code = fs.readFileSync('./test.code', 'utf8');
      //var token_stream = lexer.parse('"asfd" aaa #');
      var token_stream = lexer.parse(code);
      console.log(token_stream);
    });

  return Main;
});

require('./Main.js').run();
