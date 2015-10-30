
define(['./Class', './Token'], function(Class, Token){

  var TokenStream = Class('TokenStream', Array)
    .method('last', function(){
      return this[this.length-1];
    })
    .method('inspect', '*', function(){
      var content_str = this.map(function(i){
        if (i.instanceOf(Token.EmptyToken)){
          return i.inspect() + '\n';
        }
        else {
          return i.inspect()
        }
      }).join(' ');
      return '[ TokenStream ' + content_str +' ]';
    });

  var CharSet = Class('CharSet', String)
    .method('has', function(c){
      return this.indexOf(c) >= 0;
    })
    .method('inspect', '*', function(){
      var char_set = Array.prototype.slice.apply(this);
      var content_str = char_set
        .map(function(i){return JSON.stringify(i)})
        .join(' ');
      return '[ CharSet ' + content_str + ' ]';
    });

  var WholeCharSet = Class('CharSet', CharSet)
    .method('has', function(c){
      return true;
    })
    .method('inspect', '*', function(){
      return '[ WholeCharSet ]';
    });

  var Position = Class('Position', Object)
    .method('constructor', function(){
      this.offset = 0;
      this.line_nu = 1;
      this.char_nu = 1;
    })
    .method('constructor', function(position){
      this.offset = position.offset;
      this.line_nu = position.line_nu;
      this.char_nu = position.char_nu;
    })
    .method('copy', function(){
      return Position(this);
    })
    .method('set', function(offset){
      this.char_nu = this.char_nu + (offset - this.offset);
      this.offset = offset;
    })
    .method('addLine', function(){
      this.line_nu = this.line_nu + 1;
      this.char_nu = 1;
    })
    .position('inspect', '*', function(){
      return 'Line ' + this.line_nu + ', Char ' + this.char_nu;
    });

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

  var Lexer = Class('Lexer', Array)
    .method('tryAll', function(func){
      for (var i=0, l=this.length, result=false; i<l; i++){
        result = func(this[i]);
        if (result !== false) return result;
      }
      return false;
    })
    .method('parse', function(stream){
      var token_stream = TokenStream();
      var position = Position();
      for (var i=position.offset,l=stream.length; i<l; i++){
        var token = this.tryAll(function(lexer){
          return lexer.parse(stream, position, token_stream);
        });
        if (token === false){
          throw Error(position);
        }
        else{
          token_stream.push(token);
          i = position.offset - 1;
        }
      }
    });

});
