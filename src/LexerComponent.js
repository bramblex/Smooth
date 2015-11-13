
define(['./Class', './Token', './CharSet'], function(Class, Token, CharSet){

  var BaseLexer = Class('BaseLexer', Object)
    .method('constructor', function(TokenClass, first_char_set, content_char_set){
      this.TokenClass = TokenClass;
      this.first_char_set = first_char_set;
      this.content_char_set = content_char_set;
    })
    .method('parse', function(stream, position, token_stream){
      var i= position.offset;
      var j=i;

      if (!this.first_char_set.has(stream[i])){
        return false;
      }

      var l = stream.length;
      for (j; j<l; j++){
        if (!this.content_char_set.has(stream[j])){
          break;
        }
      }
      var token = this.TokenClass(stream.slice(i, j), position);
      position.set(j);
      return token;
    })
    .method('mix', function(lexer){
      return MixLexer(this, lexer);
    });

  var MixLexer = Class('MixLexer', BaseLexer)
    .method('constructor', function(lexer1, lexer2){
      this.lexer1 = lexer1;
      this.lexer2 = lexer2;
    })
    .method('parse', function(stream, position, token_stream){
      return this.lexer2.parse(this.lexer1.parse(stream, position, token_stream), position, token_stream);
    });

  var Surround = Class('Surround', BaseLexer)
    .method('constructor', function(TokenClass, surround_pair, content_char_set, allow_empty){
      this.TokenClass = TokenClass;
      this.surround_pair = surround_pair;
      this.content_char_set = content_char_set;
      this.allow_empty = allow_empty;
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
        if ( c === right_pair){
          break;
        }
        else if (!this.content_char_set.has(c)){
          return false;
        }
      }

      var content = stream.slice(i, j);
      if (!this.allow_empty && content.length === 0){
        return false;
      }
      var token = this.TokenClass(content, position);
      position.set(j+1);
      return token;
    });

  var Keyword = Class('Keyword', BaseLexer)
    .method('constructor', function(TokenClass, keywords){
      this.keywords = keywords;
      this.TokenClass = TokenClass;
    })
    .method('parse', function(token, position, token_stream){
      if ( this.keywords.indexOf(token.content) < 0){
        return token;
      }
      return this.TokenClass(token.content, token.position);
    });

  var Exclude = Class('Exclude', BaseLexer)
    .method('constructor', function(exclude_list){
      this.exclude_list = exclude_list;
    })
    .method('parse', function(token, position, token_stream){
      if (this.exclude_list.indexOf(token.content) >= 0){
        return false;
      }
      return token;
    });

  var Pair = Class('Pair', BaseLexer)
    .method('constructor', function(LeftTokenClass, RightTokenClass, left, right){
      this.LeftTokenClass = LeftTokenClass;
      this.RightTokenClass = RightTokenClass;
      this.left = left;
      this.right = right;
    })
    .method('parse', function(stream, position, token_stream){
      var i = position.offset;
      var c = stream[i];
      if ( c === this.left){
        var token = this.LeftTokenClass(c, position);
        position.set(i+1);
        return token; 
      }
      else if ( c === this.right){
        var token = this.RightTokenClass(c, position);
        position.set(i+1);
        return token; 
      }
      else {
        return false;
      }
    });

  var Indent = Class('Indent', BaseLexer)
    .method('constructor', function(TokenClass, EmptyTokenClass, indent_char_set){
      this.TokenClass = TokenClass;
      this.EmptyTokenClass = EmptyTokenClass;
      this.indent_char_set = indent_char_set;
    })
    .method('parse', function(stream, position, token_stream){

      var i = position.offset;
      var is_in_new_line = token_stream.last().instanceOf(this.EmptyTokenClass); 
      if (!is_in_new_line){
        return false;
      }
      if(!this.indent_char_set.has(stream[i])){
        return this.TokenClass('', position);
      }

      var l = stream.length;
      for (var j = i; j<l; j++){
        var c = stream[j];
        if (!this.indent_char_set.has(c)){
          break;
        }
      }

      var token = this.TokenClass(stream.slice(i,j), position); 
      position.set(j);
      return token;
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
        if (!this.content_char_set.has(stream[j])){
          break;
        }
      }
      position.set(j);
      return Token.IGNORE;
    });

  var EOL = Class('EOL', BaseLexer)
    .method('constructor', function(TokenClass){
      this.TokenClass = TokenClass;
    })
    .method('parse', function(stream, position, token_stream){
      var i = position.offset;
      if(stream[i] !== '\n'){
        return false;
      }
      var token = this.TokenClass(position);
      position.addLine();
      return token;
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

  var NumberL = Class('NumberL', BaseLexer)
    .method('constructor', function(TokenClass){
      this.TokenClass = TokenClass;
      this.digit = CharSet('0', '9');
    })
    .method('parse', function(stream, position, token_stream){
      var i = position.offset;
      var j = i;
      var l = stream.length;
      if(!this.digit.has(stream[i])){
        return false;
      }

      var is_in_fractional = false;
      for (j; j<l; j++){
        var c = stream[j];
        if (this.digit.has(c)){
          continue;
        }
        else if (c === '.'){
          if (is_in_fractional){
            return false;
          }
          if (this.digit.has(stream[j+1])){
            is_in_fractional = true;
            continue;
          }
          else {
            return false;
          }
        }
        else {
          break;
        }
      }

      var token = this.TokenClass(stream.slice(i, j), position);
      position.set(j);
      return token;
    });

  var StringL = Class('StringL', BaseLexer)
    .method('constructor', function(TokenClass){
      this.TokenClass = TokenClass;
      this.esacpe_map = {
        'n': '\n',
        'r': '\r',
        't': '\t',
        'b': '\b',
        'f': '\f',
      };
    })
    .method('parse', function(stream, position, token_stream){
      var i = position.offset;
      var l = stream.length;
      var j = i;
      var sign;
      if(stream[i] === '"' || stream[i] === "'"){
        sign = stream[i]; 
      }
      else {
        return false;
      }

      var str = '';
      var is_in_esacpe = false;
      for (var j=i+1; j<l; j++){
        var c = stream[j];
        if (is_in_esacpe){
          str = str + (this.esacpe_map[c] || c);
          is_in_esacpe = false;
        }
        else if (c === '\\'){
          is_in_esacpe = true;
        }
        else if (c === sign){
          break;
        }
        else if (c === '\n'){
          return false;
        }
        else {
          str = str + c;
          continue;
        }
      }
      var token = this.TokenClass(stream.slice(i+1, j), position);
      position.set(j+1);
      return token;
    });


  return {
    BaseLexer: BaseLexer,
    Ignore: Ignore,
    Surround: Surround,
    Keyword: Keyword,
    MixLexer: MixLexer,
    Pair: Pair,
    CommentL: CommentL,
    EOL: EOL,
    Indent: Indent,

    NumberL: NumberL,
    StringL: StringL,
    Exclude: Exclude,
  };
});
