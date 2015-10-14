
define(['./Class', './Lexer', './Parser'], function(Class, Lexer, Parser){

  var Main = Class('Main', Object)
    .classmethod('run', function(){
      var lexer = Lexer();
      var parser = Parser();

      try{
        var beautify = require('js-beautify').js_beautify;
      }
      catch (e){
        var beautify = function(a){return a};
      }
      var fs = require('fs');
      var code = fs.readFileSync('./test.code', 'utf8');
      //var token_stream = lexer.parse('"asfd" aaa #');
      var token_stream = lexer.parse(code);
      var ast = parser.parse(token_stream);

      var library_code = fs.readFileSync('./library.js', 'utf8');
      var target_code = ast.toJavaScript();

      fs.writeFileSync('./test_dist.js', beautify(library_code+target_code));
    });

  return Main;
});

require('./Main.js').run();
