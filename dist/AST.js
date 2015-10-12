
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

  var ASTNode = Class('ASTNode', Object);

  ASTNode.StatementsList = Class('StatementsList', ASTNode);
  ASTNode.IfElseStatement = Class('IfElseStatement', ASTNode);
  ASTNode.WhileLoopStatement = Class('WhileLoopStatement', ASTNode);
  ASTNode.AssignmentStatement = Class('AssignmentStatement', ASTNode);
  ASTNode.FunctionDefineStatement = Class('FunctionDefineStatement', ASTNode);
  ASTNode.Expression = Class('Expression', ASTNode);

  return ASTNode;
});


})(this, typeof define !== 'undefined' && define);
