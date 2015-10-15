
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
  
  var indent_str = function(n){
    var str = '';
    for (var i=0; i<n; i++){
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
      reslut = reslut + indent_str(indent) + statement.inspect(indent+2) + '\n';
    }
    return reslut.slice(0, -1);
  })
  .method('toJavaScript', function(){
    return this.content.map(function(s){return s.toJavaScript()}).join(';') + ';';
  });

  var assignment_and_create_symbol  = Token.SymbolToken(':=', Token.fack_position);
  var assignment_symbol  = Token.SymbolToken('=', Token.fack_position);
  ASTNode.AssignmentStatement = Class('AssignmentStatement', ASTNode)
    .method('constructor', function(symbol, left, right){
      if (assignment_and_create_symbol.equal(symbol)){
        this.type = 'assignment_and_create';
      }
      else if (assignment_symbol.equal(symbol)){
        this.type = 'assignment';
      }
      this.left = left;
      this.right = right;
    })
    .method('inspect', '*', function(){
      if (this.type === 'assignment'){
        return this.left.inspect() + ' = ' + this.right.inspect();
      }
      else if(this.type === 'assignment_and_create'){
        return this.left.inspect() + ' := ' + this.right.inspect();
      }
    })
    .method('toJavaScript', function(){
      if (this.type === 'assignment'){
        return this.left.toJavaScript() + '=' + this.right.toJavaScript();
      }
      else if(this.type === 'assignment_and_create'){
        return 'var ' + this.left.toJavaScript() + '=' + this.right.toJavaScript();
      }
    });

  ASTNode.IfStatement = Class('IfStatement', ASTNode)
    .method('constructor', function(condition, statements_list){
      this.condition = condition;
      this.statements_list = statements_list;
    })
    .method('inspect', '*', function(indent){
      return 'if ' + this.condition.inspect() + '\n' + this.statements_list.inspect(indent);
    })
    .method('toJavaScript', function(){
      return 'if (' + this.condition.toJavaScript() + ')' + '{' + this.statements_list.toJavaScript() + '}';
    });

  ASTNode.WhileLoopStatement = Class('WhileLoopStatement', ASTNode)
    .method('constructor', function(condition, statements_list){
      this.condition = condition;
      this.statements_list = statements_list;
    })
    .method('inspect', '*', function(indent){
      return 'while ' + this.condition.inspect() + '\n' + this.statements_list.inspect(indent);
    })
    .method('toJavaScript', function(){
      return 'while (' + this.condition.toJavaScript() + ')' +'{' + this.statements_list.toJavaScript() + '}';
    });


  ASTNode.FunctionDefineStatement = Class('FunctionDefineStatement', ASTNode)
    .method('constructor', function(symbol, name, argv, statements_list){
      if (assignment_and_create_symbol.equal(symbol)){
        this.type = 'assignment_and_create';
      }
      else if (assignment_symbol.equal(symbol)){
        this.type = 'assignment';
      }
      this.name = name;
      this.argv = argv;
      this.statements_list = statements_list;
    })
    .method('inspect', '*', function(indent){
      if (this.type === 'assignment'){
        var s = '=';
      }
      else if(this.type === 'assignment_and_create'){
        var s = ':=';
      }
      var reslut = '';
      reslut = reslut + this.name.inspect() + ' ';
      reslut = reslut + this.argv.map(function(t){return t.inspect()}).join(' ') + ' ' + s + '\n';
      reslut = reslut + this.statements_list.inspect(indent);
      return reslut;
    })
    .method('toJavaScript', function(){
      if (this.type === 'assignment'){
        var s = '';
      }
      else if(this.type === 'assignment_and_create'){
        var s = 'var';
      }

      var func_body = this.statements_list.toJavaScript();

      for (var i=this.argv.length-1; i>=0; i--){
        var arg = this.argv[i];
        if (i === 0){
          func_body = 'function('+ arg.toJavaScript() +'){' + func_body + '}'; 
        }
        else {
          func_body = 'return function('+ arg.toJavaScript() +'){' + func_body + '}'; 
        }
      }
      return s + ' ' + this.name.toJavaScript() +'='+  func_body ;
    });

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
      if (this.type === 'Val'){
        return this.token.inspect();
      }
      else if (this.type === 'Expr'){
        return '(' + this.left.inspect() + ' ' + this.right.inspect()+ ')' 
      }
    })
    .method('toJavaScript', function(){
      if (this.type === 'Val'){
        return this.token.toJavaScript();
      }
      else if (this.type === 'Expr'){
        return this.left.toJavaScript() + '(' + this.right.toJavaScript() + ')';
      }
    });

  return ASTNode;
});


})(this, typeof define !== 'undefined' && define);
