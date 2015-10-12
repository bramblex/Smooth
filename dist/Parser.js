
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

  define(['./Class', './Token'], function(Class, Token){

  var ParserError = Class('ParserError', Error)
    .method('constructor', function(token){
      var position = token.position;
      this.position = position;
      this.token = token;
      this.name = 'ParserError';
      this.message = 'Unexpected Token ' + token.inspect() + ' At Line ' + (position.line_nu + 1) + ', Char ' + (position.char_nu + 1);
      Error.captureStackTrace(this, ParserError);
    });

  var space_token = Token.SpaceToken(0, Token.fack_position);
  var eol_token = Token.EOLToken(Token.fack_position);
  var eof_token = Token.EOFToken(Token.fack_position);
  var esacpe_char_token =  Token.SymbolToken('\\', Token.fack_position);

  var Line = Class('Line', Array)
    .method('constructor', function(raw_line){
    })
    .method('constructor', function(token_stream, i, j){
    })
    .classmethod('parse', function(token_stream){
    });

  var Block = Class('Block', Array)
    .method('constructor', function(line_stream, i){
    });

  var Parser = Class('Parser', Object)
    .method('constructor', function(){
    });

  return Parser;
});


})(this, typeof define !== 'undefined' && define);
