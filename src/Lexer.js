define(['./Class', './Token', './Position'], function(Class, Token, Position){

  var LexerError = Class('LexerError', Error)
    .method('constructor', function(position){
      this.position = position;
      this.name = 'Lexer Error'
      this.message = 'Lexer Error At ' + position.inspect();
      Error.captureStackTrace(this, LexerError);
    });

  var PairStack = Class('PairStack', Array)
    .method('push', function(pair_token){
      if (pair_token.instanceOf(Token.LeftPairToken)){
        PairStack.upper('push').call(this, pair_token);
      }
      else if (pair_token.instanceOf(Token.RightPairToken)){
        var top = this.pop();
        if ( !top || !pair_token.match(top)){
          throw LexerError(pair_token.position);
        }
      }
    });

  var TokenStream = Class('TokenStream', Array)
    .method('constructor', function(){
      this.pair_stack = PairStack();
    })
    .method('last', function(){
      return (this[this.length-1] || Token.IGNORE);
    })
    .method('inPair', function(){
      return this.pair_stack.length > 0;
    })
    .method('push', function(token){
      if (token === Token.IGNORE){
        return token;
      }
      else if (token.instanceOf(Token.EmptyToken)){
        var last = this.last();
        if (last.instanceOf(Token.EmptyToken)){
          return token;
        }
        else if (last.instanceOf(Token.IndentToken)){
          this.pop();
          return token;
        }
        else if (this.inPair()){
          return token;
        }
      }
      else if (token.instanceOf(Token.PairToken)){
        this.pair_stack.push(token);
      }
      return TokenStream.upper('push').call(this, token);
    })
    .method('inspect', '*', function(){
      return this.map(function(token){
        if (token.instanceOf(Token.EmptyToken)){
          return token.inspect() + '\n';
        }
        else{
          return token.inspect() + ' ';
        }
      }).join('').slice(0,-1);
    });

  var Lexer = Class('Lexer', Array)
    .method('constructor', function(components){
      this.push.apply(this, components);
    })
    .method('push', function(component){
      Lexer.upper('push').call(this, component);
      return this;
    })
    .method('__tryAll__', function(stream, position, token_stream){
      var components = this;
      var l = components.length;
      for (var i=0; i<l; i++){
        var component = components[i];
        var token = component.parse(stream, position, token_stream);
        if (token instanceof Token){
          return token;
        }
      }
      return false;
    })
    .method('parse', function(stream){
      var position = Position();
      var token_stream = TokenStream();

      for (var i=0, l=stream.length; i<l; i++){
        var token = this.__tryAll__(stream, position, token_stream);
        if (token instanceof Token){
          token_stream.push(token);
          i = position.offset - 1;
        }
        else if (token === false){
          throw LexerError(position);
        }
        else {
          throw Error('Unknown Error');
        }
      }

      if (!token_stream.inPair()){
        return token_stream;
      }
      else {
        throw LexerError(position);
      }
    });

  return Lexer;
});
