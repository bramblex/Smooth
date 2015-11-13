define(['./Class', './Token', './Utils'], function(Class, Token, Utils){

  var indentBlock = Utils.indent;

  var IndentError = Class('IndentError', Error)
    .method('constructor', function(position){
      this.position = position;
      this.name = 'Indent Error'
      this.message = 'Error At ' + position.inspect();
      Error.captureStackTrace(this, IndentError);
    });

  var Line = Class('Line', Array)
    .method('getPosition', function(){
      return this[0].position;
    })
    .method('inspect', '*', function(){
      var content_str = this.map(function(item){
          return item.inspect()
      }).join(' ');
      return [ '[ Line', content_str, ']'].join(' ');
    });

  var Block = Class('Block', Array)
    .method('getPosition', function(){
      return this[0].getPosition();
    })
    .method('lastLine', function(){
      return this[this.length-1];
    })
    .method('inspect', '*', function(){
      var content_str = this.map(function(item){
        return item.inspect()
      }).join('\n');
      return ['[ Block', indentBlock(2, content_str), ']'].join('\n');
    });

  var BlockStack = Class('BlockStack', Array)
    .method('constructor', function(){
      var block = Block();
      var indent = 0;
      this.bottom_block = block;
      this.top_block = block;
      this.top_indent = indent;
      BlockStack.upper('push').call(this, {block:block,indent:indent});
    })
    .method('push', function(block, indent){
      this.top_block.lastLine().push(block);
      this.top_block = block;
      this.top_indent = indent;
      return BlockStack.upper('push').call(this, {block:block,indent:indent});
    })
    .method('pop', function(){
      var top = this[this.length-1] || {};
      this.top_block =  top.block;
      this.top_indent = top.indent;
      return BlockStack.upper('pop').call(this);
    });

  var PreProcess = Class('PreProcess', Object)
    .method('constructor', function(){
    })
    .method('parse', function(token_stream){

      var first = token_stream[0];
      if (!first){
        return Block();
      }
      if (first.content !== 0){
        throw IndentError(first.position);
      }

      var block_stack = BlockStack();

      var is_new_line = true;
      var current_line, current_indent, top_indent;
      for (var i=0, l=token_stream.length; i<l; i++){
        var token = token_stream[i];
        if (token.instanceOf(Token.IndentToken)){
          current_line = Line();
          current_indent = token.content;
          top_indent = block_stack.top_indent;
          if (current_indent === top_indent){
            continue;
          }
          else if (current_indent > top_indent){
            block_stack.push(Block(), current_indent);
          }
          else if (current_indent < top_indent){
            while (true){
              block_stack.pop();
              top_indent = block_stack.top_indent;
              if (top_indent === current_indent){
                break;
              }
              else if (current_indent > top_indent || !top_indent){
                throw IndentError(token.position);
              }
            }
          }
        }
        else if (token.instanceOf(Token.EOLToken)){
          block_stack.top_block.push(current_line);
        }
        else{
          current_line.push(token);
        }
      }
      return block_stack.bottom_block;
    });

  PreProcess.Block = Block;
  PreProcess.Line = Line;
  return PreProcess;
});
