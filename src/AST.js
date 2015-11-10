
define(['./Class'], function(Class){

  var AST = Class('ASTNode', Object);

  AST.Expr = Class('Expression', Object); // Expr
  AST.Expr.EId = Class('Identifier', AST.Expression); // Identifier
  AST.Expr.EVal = Class('Value', AST.Expression); // Literal Value
  AST.Expr.EApp = Class('Application', AST.Expression);// Identifier Expr
  AST.Expr.EOp = Class('Operator', AST.Expression);// Expr Op Expr
  AST.Expr.ELma = Class('Lambada', AST.Expression);// Lambda Value Expr

  AST.StatementsList = Class('StatementsList', AST);

  return AST;
});
