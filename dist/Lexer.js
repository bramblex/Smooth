
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

  
define(['./Class', './Token', './Position'], function(Class, Token, Position){

  var LexerError = Class('LexerError', Error)
    .method('constructor', function(position){
      this.position = position;
      this.message = 'Lexer Error At Line ' + (position.line_nu + 1) + ', Char ' + (position.char_nu + 1);
      Error.captureStackTrace(this, Lexer.LexerError);
    });

  var TokenStream = Class('TokenStream', Array)
    .method('push', function(token){
      if (token.instanceOf(Token.IGNORE)){
        return token; 
      }
      else {
        return upper(TokenStream, 'push').call(this, token);
      }
    })
    .method('inspect', '*', function(){
      return this.map(function(token){
        if (token.instanceOf()){
          return token.inspect() + '\n';
        }
        else{
          return token.inspect();
        }
      }).join(' ');
    });

  var Lexer = Class('Lexer', Array)
    .method('constructor', function(components){
      this.push.apply(this, components);
    })
    .method('__tryAll__', function(stream, position, token_stream){
      var components = this.components;
      var l = components.length;
      for (var i=0; i<l; i++){
        var component = components[i];
        var token = component(stream, position, token_stream);
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

      return token_stream;
    });

  return Lexer;
});


})(this, typeof define !== 'undefined' && define);
