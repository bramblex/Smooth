
define(['./Class', './Lexer', './Parser', './CPS'], function(Class, Lexer, Parser, CPS){

  var Main = Class('Main', Object)
    .classmethod('parse', function(source_code){

      var lexer = Lexer();
      var parser = Parser();

      var token_stream = lexer.parse(source_code+'\n');
      var ast = parser.parse(token_stream);
      var target_code = ast.toJavaScript();

      return target_code;
    })
    .classmethod('cps', function(source_code){

      var lexer = Lexer();
      var parser = Parser();

      var token_stream = lexer.parse(source_code+'\n');
      var ast = parser.parse(token_stream);

      return CPS.transform(ast).inspect(0);
    });

  return Main;
});
