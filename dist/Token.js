
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
    .method('constructor', function(type, content, position){
      this.type = type;
      if (content){
        this.content = content;
      }

      this.position = {};
      this.position.offset = position.offset;
      this.position.line_nu = position.line_nu;
      this.position.char_nu = position.char_nu;
    })
    .method('equal', function equal(token){
      return (this.type === token.type) && (this.content === token.content);
    })
    .method('isType', function isType(token){
      return this.type === token.type;
    })
    .method('isContent', function isType(token){
      return this.content === token.content;
    })
    .method('getPosition', function getPosition(){
      return this.position;
    })
    .method('inspect', '*', function inspect(){
      //var pair = function(string){return '('+string+')';};
      //return [this.type.slice(0,2), pair(this.content)].join('#');
      return this.content;
    });

  Token.IdentifierToken = Class('IdentifierToken', Token)
    .method('constructor', function(content, position){
      Token
        .apply(this, ['Identifier', content, position]);
    })
    .method('toJavaScript', function(){
      return this.content;
    });

  Token.SymbolToken = Class('SymbolToken', Token)
    .method('constructor', function(content, position){
      Token
        .apply(this, ['Symbol', content, position]);
    });

  Token.SpaceToken = Class('SpaceToken', Token)
    .method('constructor', function(content, position){
      Token
        .apply(this, ['Space', content, position]);
    });

  Token.LiteralToken = Class('LiteralToken', Token)
    .method('constructor', function(content_type, content, position){
      Token
        .apply(this, ['Literal', content, position]);
      this.content_type = content_type;
    })
    .method('equal', function equal(token){
      return (this.type === token.type) 
        && (this.content_type === token.content_type)
        && (this.content === token.content);
    })
    .method('inspect', '*', function (){
      //var pair = function(string){return '('+string+')';};
      //return [this.content_type.slice(0,3),
        //pair(JSON.stringify(this.content))].join('#');
      if (this.content_type === 'Number'){
        return this.content;
      }
      else if (this.content_type === 'String'){
        return JSON.stringify(this.content); 
      }
    })
    .method('toJavaScript', function(){
      if (this.content_type === 'Number'){
        return this.content;
      }
      else if (this.content_type === 'String'){
        return JSON.stringify(this.content); 
      }
    });

  Token.EOLToken = Class('EOLToken', Token)
    .method('constructor', function(position){
      Token
        .apply(this, ['EOL', undefined, position]);
    })
    .method('equal', function equal(token){
      return (this.type === token.type)
    })
    .method('inspect', '*', function (){
      return 'EOL';
    });


  Token.EOFToken = Class('EOFToken', Token)
    .method('constructor', function(position){
      Token
        .apply(this, ['EOF', undefined, position]);
    })
    .method('inspect', '*', function (){
      return 'EOF';
    });

  Token.EmptyToken = Class('EmptyToken', Token)
    .method('constructor', function(position){
      Token
        .apply(this, ['Empty', undefined, position]);
    })
    .method('inspect', '*', function (){
      return 'Empty';
    });

  Token.fack_position = {offset:0, line_nu:0, char_nu:0,};

  return Token;
});


})(this, typeof define !== 'undefined' && define);
