
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


})(this, typeof define !== 'undefined' && define);
