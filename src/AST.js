define(['./Class', './Token'], function(Class, Token){
  
  var indent_str = function(n){
    var str = '';
    for (var i=0; i<n*2; i++){
      str = str + ' ';
    }
    return str;
  };

  var ASTNode = Class('ASTNode', Object);

  ASTNode.StatementsList = Class('StatementsList', ASTNode)
  .method('constructor', function(){
    this.content = [];
  })
  .method('push', function(node){
    return this.content.push(node);
  })
  .method('inspect', '*', function(indent){
    var indent = indent || 0;
    var reslut = '';
    for (var i=0; i<this.content.length; i++){
      var statement = this.content[i];
      reslut = reslut + indent_str(indent) + statement.inspect(indent+1) + '\n';
    }
    return reslut;
  });

  ASTNode.AssignmentStatement = Class('AssignmentStatement', ASTNode)
    .method('constructor', function(left, right){
      this.left = left;
      this.right = right;
    })
    .method('inspect', '*', function(){
      return this.left.inspect() + ' := ' + this.right.inspect();
    });

  ASTNode.IfStatement = Class('IfStatement', ASTNode);
  ASTNode.WhileLoopStatement = Class('WhileLoopStatement', ASTNode);
  ASTNode.FunctionDefineStatement = Class('FunctionDefineStatement', ASTNode);

  ASTNode.Expression = Class('Expression', ASTNode)
    .method('constructor', function(token){
      this.type = 'Val';
      this.token = token;
    })
    .method('constructor', function(left, right){
      this.type = 'Expr';
      this.left = left;
      this.right = right;
    })
    .method('inspect', '*', function(){
      var indent = indent || 0;
      if (this.type === 'Val'){
        return this.token.inspect();
      }
      else if (this.type === 'Expr'){
        return '(' + this.left.inspect() + ' ' + this.right.inspect()+ ')' 
      }
    });

  return ASTNode;
});
