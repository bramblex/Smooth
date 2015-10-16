define(['./Class', './AST', './Token'], function(Class, ASTNode, Token){

  var async_wapper_token = Token.IdentifierToken('__async_waper__', Token.fack_position);

  var exprLeft = function exprLeft(expr){
    if (expr.type === 'Val'){
      return expr.token;
    }
    else if (expr.type === 'Expr'){
      return exprLeft(expr.left);
    }
    else{
      throw Error();
    }
  };

  var checkAsync = function checkAsync(statement){
    if (statement instanceof ASTNode.AssignmentStatement){
      var left_token = exprLeft(statement.right); 
      return /^async.*/.test(left_token.content);
    }
    else {
      return false;
    }
  };

  var transform = function transform(node){

    if( !(node instanceof ASTNode.StatementsList) ){
      throw Error(node.getPosition());
    }

    var content = node.content;
    for (var i=0, l=content.length; i<l; i++){
      var statement = content[i];

      if ( checkAsync(statement) ){

        var symbol = statement.symbol;
        var left = statement.left;
        var right = statement.right;

        content.splice(i, 1);
        var next = content.splice(i);

        var async_wapper_func = ASTNode.FunctionDefineStatement(
          symbol, async_wapper_token, [left],
          ASTNode.StatementsList(next)
        );
        content.push(async_wapper_func);
        content.push(ASTNode.Expression(right, async_wapper_token));

        transform(async_wapper_func.statements_list);
        break;
      }
    }
  };

  return Class('CPS', Object)
    .classmethod('transform', function(node){
      transform(node);
      return node;
    });
});
