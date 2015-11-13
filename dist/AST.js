
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


})(this, typeof define !== 'undefined' && define);
