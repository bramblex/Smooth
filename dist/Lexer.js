
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


  var TokenStream = Class('TokenStream', Array)
    .method('inspect', '*', function(){
      var reslut = '';
      var eol = Token.EOLToken({});

      this.forEach(function(token){
        reslut = reslut + ' ' + token.inspect();
        if( eol.equal(token) ){
          reslut = reslut + '\n';
        }
      });
      return reslut;
    });

  var isA = function isAlpha(c){
    var code = c.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  };

  var isD = function isDigit(c){
    var code = c.charCodeAt(0);
    return (code >= 48 && code <= 57);
  };

  var each = function each(list, func){
    var l = list.length;
    var reslut;
    for (var i=0; i<l; i++){
      reslut = func(list[i]);
      if (reslut !== false)
        return reslut;
    }
    return false;
  };

  var Lexer = Class('Lexer', Object)
  .method('constructor', function(){
    this.__lexer__ = [];

    this
      .addLexer(Lexer.IdentifierLexer)
      .addLexer(Lexer.SymbolLexer)
      .addLexer(Lexer.SpaceLexer)
      .addLexer(Lexer.LiteralLexer)
      .addLexer(Lexer.EOLLexer)
      .addLexer(Lexer.CommentLexer)
  })
  .method('addLexer', function addLexer(lexer){
    this.__lexer__.push(lexer);
    return this;
  })
  .method('clearLexer', function clearLexer(){
    this.__lexer__ = [];
  })
  .method('parse', function parse(stream){

    var length = stream.length;

    var position = {
      offset: 0,
      line_nu: 0,
      char_nu: 0,
      setOffset: function setOffset(offset){
        this.char_nu = this.char_nu + (offset - this.offset);
        this.offset = offset;
      },
      addLine: function addLine(){
        this.offset = this.offset + 1;
        this.line_nu = this.line_nu + 1;
        this.char_nu = 0;
      },
    };

    var token_stream = TokenStream();
    var empty_token = Token.EmptyToken(position);

    for (var i=0; i<length; i++){
      var token = each(this.__lexer__, function(lexer){
        return lexer(stream, length, position);
      });
      if(token === false){
        throw Lexer.LexerError(position);
      }
      else{
        if (!empty_token.equal(token)){
          token_stream.push(token);
        }
        i = position.offset - 1;
      }
    }
    token_stream.push(Token.EOFToken(position));
    return token_stream;
  })

  // classmethod
  .classmethod('IdentifierLexer', function IdentifierLexer(stream, length, position){

    var i = position.offset;
    var l = length;

    if (!isA(stream[i]) && stream[i] !== '_'){
      return false;
    }

    for (var j=i; j<l; j++){
      if (!(isA(stream[j]) || isD(stream[j]) || stream[j] === '_')){
        break;
      }
    };

    var token = Token.IdentifierToken(stream.slice(i, j), position);
    position.setOffset(j);
    return token;
  }) 
  .classmethod('SymbolLexer', function SymbolLexer(stream, length, position){

    var i = position.offset;
    var l = length;

    var operator_list = '`~!@$%^&*()-+=[]{}\\|:;<>,./?';
    var single_list = '()[]{}';
    if (operator_list.indexOf(stream[i]) < 0){
      return false;
    }

    if (single_list.indexOf(stream[i]) > 0 ){
      var j=i+1;
    }
    else{
      for (var j=i; j<l; j++){
        if (operator_list.indexOf(stream[j]) >= 0){
          continue;
        }
        else{
          break;
        }

      }
    }

    var token = Token.SymbolToken(stream.slice(i, j), position);
    position.setOffset(j);
    return token;
  })
  .classmethod('SpaceLexer', function SpaceLexer(stream, length, position){
    var i = position.offset;
    var l = length;

    if (stream[i] !== ' '){
      return false
    }

    var count = 0;
    for (var j=i; j<l; j++){
      if (stream[j] === ' '){
        count = count + 1;
      }
      else {
        break;
      }
    }

    var token = Token.SpaceToken(count, position);
    position.setOffset(j);
    return token;

  })
  .classmethod('LiteralLexer', function LiteralLexer(stream, length, position){

    var NumberLexer = function NumberLexer(stream, length, position){
      var i = position.offset;
      var l = length;
      if(!isD(stream[i])){
        return false;
      }

      var is_in_fractional = false;
      for(var j=i; j<l; j++){
        var c = stream[j];

        if(isD(c)){
          continue;
        }
        else if(c === '.' ){
          if(is_in_fractional){
            break;
          }
          if (isD(stream[j+1])){
            is_in_fractional = true;
            continue;
          }
          else{
            break;
          }
        }
        else if(!isD(c) && !isA(c) && c !== '_'){
          var token = Token.LiteralToken('Number', stream.slice(i, j), position);
          position.setOffset(j)
          return token;
        }
        else{
          break;
        }

      }
      return false;
    };

    var StringLexer = function StringLexer(stream, length, position){
      var i = position.offset;
      var l = length;
      var sign;
      if(stream[i] === '"' || stream[i] === "'"){
        sign = stream[i]; 
      }
      else {
        return false;
      }

      var esacpe_map = {
        'n': '\n',
        'r': '\r',
        't': '\t',
        'b': '\b',
        'f': '\f',
      }

      var str = '';
      var is_in_esacpe = false;
      for(var j=i+1; j<l; j++){
        var c = stream[j];

        if (is_in_esacpe){
          str = str + (esacpe_map[c] || c);
          is_in_esacpe = false;
        }
        else if (c === '\\'){
          is_in_esacpe = true;
        }
        else if (c === sign){

          var token = Token.LiteralToken('String', str, position);
          position.setOffset(j+1);
          return token;
        }
        else if (c === '\n'){
          return false;
        }
        else{
          str = str + c;
        }
      }
      return false;
    };

    return each([NumberLexer, StringLexer], function(func){
      return func(stream, length, position);
    });
  })
  .classmethod('EOLLexer', function EOLLexer(stream, length, position){
    var i = position.offset;
    if (stream[i] === '\n'){
      var token = Token.EOLToken(position);
      position.addLine();
      return token;
    }
    else{
      return false;
    }
  })
  .classmethod('CommentLexer', function CommentLexer(stream, length, position){
    var i = position.offset;
    var l = length;

    if (stream[i] !== '#'){
      return false;
    }
    else {
      for (var j=i; j<l; j++){
        if (stream[j] === '\n'){
          break;
        }
      }
    }

    var token = Token.EmptyToken(position);
    position.setOffset(j);
    return token;
  });

  Lexer.LexerError = Class('LexerError', Error)
    .method('constructor', function(position){
      this.position = position;
      this.name = 'LexerError';
      this.message = 'Lexer Error At Line ' + (position.line_nu + 1) + ', Char ' + (position.char_nu + 1);
      Error.captureStackTrace(this, Lexer.LexerError);
      // info at: http://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm 
      //this.type = 'LexerError';
      //this.description = this.message;
      //Error.call(this, this.message);
      //Error.captureStackTrace( this, ( implementationContext || AppError ) );
    });

  return Lexer;
});


})(this, typeof define !== 'undefined' && define);
