
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

  var BaseLexer = Class('BaseLexer', Object)
    .method('constructor', function(TokenClass, first_char_set, content_char_set){
      this.TokenClass = TokenClass;
      this.first_char_set = first_char_set;
      this.content_char_set = content_char_set;
    })
    .method('parse', function(stream, position, token_stream){
      var i= position.offset;
      var j=i;

      if (!first_char_set.has(stream[i])){
        return false;
      }

      var l = stream.length;
      for (j; j<l; j++){
        if (!content_char_set.has(stream[j])){
          break;
        }
      }
      position.set(j);
      return this.TokenClass(stream.slice(i, j));
    });

  var MixLexer = Class('MixLexer', BaseLexer)
    .method('constructor', function(lexer1, lexer2){
      this.lexer1 = lexer1;
      this.lexer2 = lexer2;
    })
    .method('parse', function(stream, position, token_stream){
      return this.lexer2.parse(this.lexer1.parse(stream, position, token_stream));
    })

  var Surround = Class('Surround', BaseLexer)
    .method('constructor', function(TokenClass, surround_pair, content_char_set){
      this.TokenClass = TokenClass;
      this.surround_pair = surround_pair;
      this.content_char_set = content_char_set;
    })
    .method('parse', function(stream, position, token_stream){
      var left_pair = this.surround_pair.left;
      var right_pair = this.surround_pair.right;

      var i= position.offset;

      if (stream[i]!==left_pair){
        return false;
      }

      var l = stream.length;
      i = i + 1;
      var j=i;
      for (j; j<l; j++){
        var c = stream[j];
        if ( c === right_pair && c !== '\\'){
          break;
        }
        else if (!content_char_set.has(c)){
          return false;
        }
      }
      position.set(j+1);
      return this.TokenClass(stream.slice(i, j));
    });

  var Indent = Class('Indent', BaseLexer)
    .method('constructor', function(TokenClass, EOLTokenClass, indent_char_set){
      this.TokenClass = TokenClass;
      this.EOLTokenClass = EOLTokenClass;
      this.indent_char_set = indent_char_set;
    })
    .method('parse', function(stream, position, token_stream){

      var i = position.offset;
      if(!this.indent_char_set.has(stream[i])){
        return false;
      }
      if (!(token_stream.last() instanceof this.EOLTokenClass)){
        return false;
      }

      var l = stream.length;
      for (var j = i; j<l; j++){
        var c = stream[j];
        if (!this.indent_char.has(c)){
          break;
        }
      }

      position.set(j);
      return this.TokenClass(stream.slice(i,j));
    });

  var Ignore = Class('Ignore', BaseLexer)
    .method('constructor', function(content_char_set){
      this.content_char_set = content_char_set;
    })
    .method('parse', function(stream, position, token_stream){
      var i = position.offset;

      if (!this.content_char_set.has(stream[i])){
        return false;
      }

      var l = stream.length;
      for (var j=i; j<l; j++){
        if (this.content_char_set.has(stream[j])){
          break;
        }
      }
      position.set(j);
      return Token.IGNORE;
    });

  var EOL = Class('EOL', BaseLexer)
    .method('constructor', function(TokenClass){})
    .method('parse', function(stream, position, token_stream){
      var i = position.offset;
      if(stream[i] !== '\n'){
        return false;
      }
      if (token_stream.last().instanceOf(Token.EmptyToken)){
        return Token.IGNORE;
      }
      else {
        var token = this.TokenClass(position);
        position.set(i+1);
        return token;
      }
    });

  var CommentL = Class('Comment', Ignore)
    .method('constructor', function(comment_start_char){
      this.comment_start_char = comment_start_char;
    })
    .method('parse', function(stream, position, token_stream){
      var i = position.offset;
      if (stream[i] !== this.comment_start_char){
        return false;
      }
      var l = stream.length
      for (i; i<l; i++){
        if (stream[i] === '\n'){
          break;
        }
      }
      position.set(i);
      return Token.IGNORE;
    });

});


})(this, typeof define !== 'undefined' && define);
