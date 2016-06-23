
module.exports = function (node){
    var compile = arguments.callee;
    var AST = require('./SmoothAST.js');

    var smID = function(name){
        switch (name){
        case '_': return 'null';
        default:  return '$SM$'+name;
        };
    };

    var smArg = function(name){
        switch (name){
        case '_': return '$SM_IGNORE$';
        default:  return '$SM$'+name;
        };
    };

    if (node instanceof AST.Binding) {
        return [smID(node.name), '=',compile(node.expr)].join(' ');
    }
    else if (node instanceof AST.Module) {
        return [
            node.imports.map(function(node){return compile(node);}).join(';'),
            node.bindings.map(function(node){return compile(node);}).join(';'),
            node.exports.map(function(node){return compile(node);}).join(';')
        ].join(';');
    }
    else if (node instanceof AST.Module.ImportAs) {
        return ['var', smID(node.name), 'require(' + node.path + ')'].join(' ');
    }
    else if (node instanceof AST.Module.Import) {
        return node.names.map(function(name){
            return ['var', smID(name), '=', 'require('+ node.path + ').'+ name].join(' ');
        }).join(';');
    }
    else if (node instanceof AST.Module.Export) {
        return node.names.map(function(name){
            return ['exports.'+name, '=', smID(name)].join(' ');
        }).join(';');
    }
    else if (node instanceof AST.Module.Binding) {
        return 'var ' + compile(node.binding);
    }
    else if (node instanceof AST.Expr.App) {
        return compile(node.left) + '(' + compile(node.right) + ')';
    }
    else if (node instanceof AST.Expr.Lam) {
        return '(function('+ smArg(node.arg) +'){return '+ compile(node.expr) + ';})';
    }
    else if (node instanceof AST.Expr.IfElse) {
        return '('+ compile(node.con) +'?'+ compile(node.suc) +':'+ compile(node.alt) +')';
    }
    else if (node instanceof AST.Expr.LetIn) {
        return '(function(){ '+ node.bindings.map(compile).join(';') +';return ' + compile(node.expr) + ';})()';
    }
    else if (node instanceof AST.Expr.CaseOf) {
        return '(function(){switch('+compile(node.con)+'){'+node.cases.map(compile).join(';')+'}})';
    }
    else if (node instanceof AST.Expr.CaseOf.Case) {
        return 'case ' + compile(node.val) + ':{ return ' + compile(node.expr) + '}';
    }
    else if (node instanceof AST.Expr.Op) {
        switch (node.op){
        case '**' : return 'Math.power(' + compile(node.left) + ',' + compile(node.right) + ')';
        case '!=' : return compile(node.left) + '!==' + '(' + compile(node.right) + ')';
        case '==' : return compile(node.left) + '===' + '(' + compile(node.right) + ')';
        case '>>>' : return '(function(f){return function(g){return function(x){return f(g(x))}}})(' + compile(node.left) + ')(' + compile(node.right)+ ')';
        case '<<<' : return '(function(g){return function(f){return function(x){return f(g(x))}}})(' + compile(node.left) + ')(' + compile(node.right)+ ')';
        default: return compile(node.left) + node.op + '(' + compile(node.right) + ')';
        };
    }
    else if (node instanceof AST.Expr.ID) {
        return smID(node.name);
    }
    else if (node instanceof AST.Expr.Attr) {
        return compile(node.expr) + '.' + node.attr;
    }
    else if (node instanceof AST.Expr.Val) {
        return '('+ node.val +')';
    }
    else if (node instanceof AST.Expr.Array) {
        return '[' + node.content.map(compile).join(',') + ']';
    }
    else if (node instanceof AST.Expr.Object) {
        return '{' + node.content.map(compile).join(',') + '}';
    }
    else if (node instanceof AST.Expr.KeyValue) {
        return node.name + ':' + compile(node.val);
    }

    throw "Unexpected Node";
};
