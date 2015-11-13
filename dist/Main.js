
(function(__root__, __define__){
  var define = function define(dependencies, factory) {

    var factory = factory || dependencies;
    var dependencies = (Array.isArray(dependencies) && dependencies) || [];

    if ( typeof __define__ === 'function' && __define__.amd){
      __define__(dependencies, factory);
    } else if ( typeof __define__ === 'function' && __define__.cmd){
      __define__(dependencies, function(require, exports, module){
        module.exports = factory.apply(__root__, dependencies.map(function(m){
          return require(m);
        }));
      });
    } else if (typeof exports === 'object'){
      module.exports = factory.apply(__root__, dependencies.map(function(m){
        return require(m);
      }));
    } else{
      var name = document.currentScript.src.replace(/(^.*?)([^\/]+)\.(js)(\?.*$|$)/, '$2');
      name = name.replace('.min', '');
      __root__[name] = factory.apply(__root__, dependencies.map(function(m){
        return __root__[m.replace(/^.*\//, '')];
      }));
    }
  };

  define(
  ['./Class', './Lexer', './LexerComponent', './CharSet', './Token', './PreProcess'],
  function(Class, Lexer, LC, CharSet, Token, PreProcess){

  var Main = Class('Main', Object)
    .classmethod('parse', function(source_code){

      var digit = CharSet('0', '9');
      var alpha = CharSet('a', 'z').or(CharSet('A', 'Z')).or(CharSet('_'));
      var pair = CharSet('[]{}()'); 
      var symbol = CharSet('~!@$%^&*+-=|:;<>,.?/').or(CharSet('♂'));
      var indent = CharSet(' ');

      var lexer = Lexer();
      lexer
        // ======== Identifier ========
        .push(
          LC.BaseLexer( Token.IdentifierToken, alpha, alpha.or(digit))
            // Keyword
            .mix(LC.Keyword(
              Token.KeywordToken,
              ['let', 'if', 'else', 'while', 'break', 'continue', 'return',
                'infixr', 'infixl', 'perfix']))
            // Literal Boolean
            .mix(LC.Keyword(Token.LiteralToken.BooleanToken, ['true', 'false']))
        )
        .push(LC.Surround(
          Token.IdentifierToken, {left: '(', right: ')'}, symbol, false))
        // ======= Literal ========
        .push(LC.NumberL(Token.LiteralToken.NumberToken))
        .push(LC.StringL(Token.LiteralToken.StringToken))
        // ======== Symbol ========
        .push(LC.Pair(
          Token.LeftPairToken, Token.RightPairToken, '(', ')'))
        .push(LC.BaseLexer( Token.SymbolToken, symbol, symbol))
        // ======== Lambada =========
        .push(LC.Surround(
          Token.LambdaToken, {left: '\\', right: '.'}, alpha, false))
        .push(LC.Surround(
          Token.LambdaToken, {left: 'λ', right: '.'}, alpha, false))
        // ======== EOL ======== 
        .push(LC.EOL(Token.EOLToken))
        // ======== Indent =======
        .push(LC.Indent(Token.IndentToken, Token.EmptyToken, indent))
        // ======== Ignore Space And Comment ========
        .push(LC.CommentL('#'))
        .push(LC.Ignore(CharSet(' ')));

      var token_stream = lexer.parse(source_code)

      var preprocess = PreProcess();
      var block = preprocess.parse(token_stream);

      //return block;
      return '';
    });


  var Match = require('./Match');
  var Position = require('./Position');
  var position = Position();

  var match_rule = [
    Match.Unit(Token.KeywordToken, 'let'),
    Match.Unit(Token.IdentifierToken).noneOrMore().capture(),
    Match.Unit(Token.SymbolToken, '='),
    Match.Unit(Token.IdentifierToken).noneOrMore().capture()
  ]

  var token_line = [
    Token.KeywordToken('let', position),
    Token.IdentifierToken('aaa', position),
    Token.IdentifierToken('aaa', position),
    Token.SymbolToken('=', position),
    Token.IdentifierToken('aaa', position),
    Token.IdentifierToken('aaa', position),
  ]

  var dfa = Match.createByRule(match_rule);

  token_line.forEach(function(token){
    dfa.input(token);
  });

  console.log(match_rule);
  console.log(token_line);
  console.log(dfa.captured);

  return Main;
});


})(this, typeof define !== 'undefined' && define);
