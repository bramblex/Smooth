define(['./Class'], function(Class){

  var Token = Class('Token', Object)
    .method('instanceOf', function(TokenClass){
      return (this.instanceof TokenClass);
    })
    .method('inspect', '*', function(){
      return [this.__class__.name, JSON.stringify(this.content)].join('#');
    })
    .method('constructor', function(content, position){
      this.position = position.copy();
      this.content = content;
    });

  Token.IdentifierToken = Class('Identifier', Token);

  Token.SymbolToken = Class('Symbol', Token);

  Token.IndentToken = Class('Indent', Token)
    .method('constructor', function(content, position){
      this.position = position.copy();
      this.content = content.length;
    });

  Token.LiteralToken = Class('Literal', Token);
  Token.LiteralToken.NumberToken = Class('Number', Token.LiteralToken)
    .method('constructor', function(content, position){
      this.position = position.copy();
      this.content = parseFloat(content);
    });

  Token.LiteralToken.StringToken = Class('String', Token.LiteralToken);

  Token.EmptyToken = Class('Empty', Token)
    .method('constructor', function(){})
    .method('constructor', function(position){
      this.position = position.copy();
    });

  Token.SOFToken = Class('SOF', Token.EmptyToken);
  Token.EOLToken = Class('EOL', Token.EmptyToken);
  Token.EOFToken = Class('EOF', Token.EmptyToken);

  Token.IGNORE = Token.EmptyToken();

  return Token;
});
