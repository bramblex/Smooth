define(['./Class'], function(Class){

  var ASTNode = Class('ASTNode', Object);

  ASTNode.StatementsList = Class('StatementsList', ASTNode);
  ASTNode.IfElseStatement = Class('IfElseStatement', ASTNode);
  ASTNode.WhileLoopStatement = Class('WhileLoopStatement', ASTNode);
  ASTNode.AssignmentStatement = Class('AssignmentStatement', ASTNode);
  ASTNode.FunctionDefineStatement = Class('FunctionDefineStatement', ASTNode);
  ASTNode.Expression = Class('Expression', ASTNode);

  return ASTNode;
});
