define(['./Class', './Token'], function(Class, Token){

  var ASTNode = Class('ASTNode', Object);

  ASTNode.StatementsList = Class('StatementsList', ASTNode)
  .method('constructor', function(){
    this.content = [];
  })
  .method('push', function(node){
    return this.content.push(node);
  });

  ASTNode.AssignmentStatement = Class('AssignmentStatement', ASTNode)
    .method('constructor', function(left, right){
      this.left = left;
      this.right = right;
    });

  ASTNode.IfElseStatement = Class('IfElseStatement', ASTNode);
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
    });

  return ASTNode;
});
