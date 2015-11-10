define(['./Class'], function(Class){
  var pair = function(str){
    return '(' + str + ')';
  };

  var Token = Class('Token', Object)
    .method('instanceOf', function(TokenClass){
      return (this instanceof TokenClass);
    })
    .method('inspect', '*', function(){
      if (this.content !== undefined){
        return [this.__class__.name, pair(this.content)].join('#');
      }
      else {
        return this.__class__.name;
      }
    })
    .method('constructor', function(content, position){
      this.position = position.copy();
      this.content = content;
    });

  Token.IdentifierToken = Class('Identifier', Token);
  Token.KeywordToken = Class('Keyword', Token);

  Token.SymbolToken = Class('Symbol', Token);

  Token.PairToken = Class('Pair', Token);
  Token.LeftPairToken = Class('LeftPair', Token.PairToken)
    .method('match', function(token){
      if (token.instanceOf(Token.RightPairToken)){
        return true;
      }
      else {
        return false;
      }
    });
  Token.RightPairToken = Class('RightPair', Token.PairToken)
    .method('match', function(token){
      if (token.instanceOf(Token.LeftPairToken)){
        return true;
      }
      else {
        return false;
      }
    });

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

  Token.LiteralToken.StringToken = Class('String', Token.LiteralToken)
    .method('inspect', '*', function(){
        return [this.__class__.name, pair(JSON.stringify(this.content))].join('#');
    });

  Token.LiteralToken.BooleanToken = Class('Boolean', Token.LiteralToken)
    .method('constructor', function(content, position){
      this.position = position.copy();
      if (content === 'true'){
        this.content = true;
      }
      else if (content === 'false'){
        this.content === 'false'
      }
    });

  Token.LambdaToken = Class('Lambada', Token);

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
