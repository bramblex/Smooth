
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


})(this, typeof define !== 'undefined' && define);
