
define(['./Class', './Lexer', './Parser'], function(Class, Lexer, Parser){

  var Main = Class('Main', Object)
    .classmethod('parse', function(source_code){

      var lexer = Lexer();
      var parser = Parser();

      var token_stream = lexer.parse(source_code+'\n');
      var ast = parser.parse(token_stream);
      var target_code = ast.toJavaScript();

      return target_code;
    });

  return Main;
});
