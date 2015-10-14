define(['./Class', './Token', './AST'], function(Class, Token, ASTNode){

  var ParserError = Class('ParserError', Error)
    .method('constructor', function(token){
      if (token instanceof Token){
        var position = token.position;
        this.position = position;
        this.token = token;
        this.message = 'Unexpected Token ' + token.inspect() + ' At Line ' + (position.line_nu + 1) + ', Char ' + (position.char_nu + 1);
      }
      else {
        var position = token;
        this.position = position;
        this.message = ' At Line ' + (position.line_nu + 1) + ', Char ' + (position.char_nu + 1);
      }

      this.name = 'ParserError';
      Error.captureStackTrace(this, ParserError);
    });

  var IndentError = Class('IndentError', Error)
    .method('constructor', function(position){
      this.position = position;
      this.name = 'IndentError';
      this.message = 'Unexpected Indent At Line ' + (position.line_nu + 1) + ', Char ' + (position.char_nu + 1);
      Error.captureStackTrace(this, ParserError);
    });

  var space_token = Token.SpaceToken(0, Token.fack_position);
  var eol_token = Token.EOLToken(Token.fack_position);
  var eof_token = Token.EOFToken(Token.fack_position);
  var esacpe_char_token =  Token.SymbolToken('\\', Token.fack_position);

  var Line = Class('Line', Array)
    .method('constructor', function(){
      this.indent = 0;
    })
    .method('constructor', function(array){
      this.push.apply(this, array);
    })
    .method('getPosition', function getPosition(){
      return this[0].position;
    })
    .method('fst', function fst(){
      return this[0];
    })
    .method('scd', function scd(){
      return this[1];
    })
    .method('lst', function lst(){
      return this[this.length-1];
    })
    .method('has', function find(token){
      for(var i=0; i<this.length; i++){
        if (this[i].equal(token)){
          return true;
        }
      }
      return false;
    })
    .method('slice', '*', function slice(){
      return Line(Array.prototype.slice.apply(this, arguments));
    })
    .method('inspect', '*', function(){
      var indent_str = (function(n){
        var str = '';
        for (var i=0; i<n; i++){
          str = str + ' ';
        }
        return str;
      })(this.indent);
      return 'Line ' + this.map(function(token){return token.inspect()}).join(' ');
    })
    .classmethod('parse', function(token_stream){
      var l = token_stream.length;
      var lines = [];

      var is_esacpe = false;
      var is_new_line = false;

      var line = Line();
      for (var i=0; i<l; i++){
        var token = token_stream[i];

        if (is_esacpe){
          if(space_token.isType(token)){
            continue;
          }
          else if (eol_token.equal(token)){
            is_esacpe = false;
            continue;
          }
          else {
            throw ParserError(token);
          }
        }

        if (is_new_line){
          if (space_token.isType(token)){
            line.indent = token.content;
            continue;
          }
          is_new_line = false;
        }

        if (esacpe_char_token.equal(token)){
          is_esacpe = token;
          continue;
        }

        if (space_token.isType(token)){
          continue;
        }

        if (eol_token.equal(token)){
          if (line.length > 0){
            lines.push(line);
          }
          line = Line();
          is_new_line = true;
          continue;
        }

        if (eof_token.equal(token)){
          break;
        }

        line.push(token);
      }

      return lines;
    });

  var Block = Class('Block', Array)
    .method('constructor', function(indent){
      this.indent = indent;
    })
    .method('getPosition', function getPosition(){
      return this[0].getPosition();
    })
    .method('inspect', '*',function(){
      var indent_str = (function(n){
        var str = '';
        for (var i=0; i<n; i++){
          str = str + ' ';
        }
        return str;
      })(this.indent);

      var content_string = this.map(function(line){
        var str = indent_str + line.inspect();
        if (line.succeed_block){
          return str + '\n' + line.succeed_block.inspect();
        }
        return str;
      }).join('\n')

      return indent_str + 'Block:\n' + content_string;
    })
    .classmethod('parse', function(lines){
      var block_stack = [];
      var i, l=lines.length;

      block_stack.push(Block(0));
      var top_block = block_stack[0];

      block_stack.bPush = function bPush(indent){
        var block = Block(indent);
        top_block[top_block.length-1].succeed_block = block;
        //top_block.push(block);
        this.push(block);
        top_block = this[this.length-1];
      };
      block_stack.bPop = function bPop(){
        this.pop();
        top_block = this[this.length-1];
        if (!top_block){
          throw IndentError(lines[i].getPosition());
        }
      };

      if (lines[0].indent !== 0){
          throw IndentError(lines[1].getPosition());
      }

      for(i=0; i<l; i++){
        var line = lines[i];

        var b = line.indent - top_block.indent;
        if( b === 0){
          top_block.push(line);
        }
        else if( b > 0){
          block_stack.bPush(line.indent);
          top_block.push(line);
        }
        else if(b < 0){
          while (true){
            block_stack.bPop();
            if (line.indent === top_block.indent){
              top_block.push(line);
              break;
            }
          }
        }
      }
  
      return block_stack[0];
    });


  var if_token = Token.IdentifierToken('if', Token.fack_position);
  var while_token = Token.IdentifierToken('while', Token.fack_position);
  var assignment_symbol  = Token.SymbolToken(':=', Token.fack_position);

  var parse = function parse(item){
    if (item instanceof Block){
      return statementsListParse(item);
    }
    else if (item instanceof Line){

      if (assignment_symbol.equal(item.scd())){
        return assignmentParse(item);
      }
      else{
        return expressionParse(item);
      }
    }
    else {
      throw Error(JSON.stringify(item));
    }
  };

  var assignmentParse = function assignmentParse(line){
    return ASTNode.AssignmentStatement(line[0], expressionParse(line.slice(2)));
  };

  var functionDefineParse = function functionDefineParse(line){
    return ASTNode.FunctionDefineStatement(line[0], line.slice(1, -1), parse(line.succeed_statements_list));
  };

  var expressionParse = (function(){
    var left_pair = Token.SymbolToken('(', Token.fack_position);
    var right_pair = Token.SymbolToken(')', Token.fack_position);

    var id = Token.IdentifierToken('', Token.fack_position);
    var lit = Token.LiteralToken('', '', Token.fack_position);

    return function expressionParse(item){
      if (item instanceof Token){
        return ASTNode.Expression(item);
      }
      else if(item instanceof Line){
        if (item.length === 1){
          return ASTNode.Expression(item[0]);
        }
        else if (item.length === 0){
          throw ParserError(item.getPosition());
        }
        else{
          var i=item.length-1;

          if (id.isType(item.lst()) || lit.isType(item.lst())){
            return ASTNode.Expression(
              expressionParse(item.slice(0, -1)), expressionParse(item.lst()));
          }

          var right_count=0;
          for(i; i>=0; i--){
            var token = item[i];
            if (right_pair.equal(token)){
              right_count = right_count + 1;
            }
            else if (left_pair.equal(token)){
              right_count = right_count - 1;
              if (right_count === 0){
                if (i === 0){
                  return expressionParse(item.slice(1,-1));
                }
                else {
                  return ASTNode.Expression(
                    expressionParse(item.slice(0, i)), expressionParse(item.slice(i+1, -1)));
                }
              }
              else if (left_count < 0){
                throw arserError(token.getPosition());
              }
            }
          }
          throw ParserError(token.getPosition());
        }
      }
      else{
        throw ParserError(item.getPosition());
      }
    };
  })();

  var whileStatementsParse = function whileStatementsParse(line){
    return ASTNode.whileStatementsParse(expressionParse(line.slice(1)), parse(line.succeed_statements_list));
  };

  var ifStatementsParse = function ifStatementsParse(line){
    return ASTNode.IfElseStatement(expressionParse(line.slice(1)), parse(line.succeed_statements_list));
  };

  var statementsListParse = function statementsListParse(block){
    var node = ASTNode.StatementsList();
    for(var i=0; i<block.length; i++){
      var line = block[i];
      if (line.succeed_block){
        var succeed_block = line.succeed_block;
        line.succeed_statements_list = parse(succeed_block);
        delete line.succeed_block;
      }
      node.push(parse(line));
    }
    return node;
  };

  var Parser = Class('Parser', Object)
    .method('constructor', function(){
    })
    .method('parse', function(token_stream){
      var lines = Line.parse(token_stream);
      var block = Block.parse(lines);
      var ast = parse(block);
      return ast;
    });

  return Parser;
});
