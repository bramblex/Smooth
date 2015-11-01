
define(['./Class', './Lexer', './LexerComponent'], function(Class, Lexer, LexerComponent){

  var Main = Class('Main', Object)
    .classmethod('parse', function(source_code){

      var lexer = Lexer();

      return lexer.parse(source_code);
    });

  return Main;
});
