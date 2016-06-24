
var AST = {};

/** Binding **/
AST.Binding = function(name, expr){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(name, expr);
    this.name = name;
    this.expr = expr;
};

/** Module **/
var Module = function(imports, exports, bindings){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(imports, exports, bindings);
    this.imports = imports;
    this.exports = exports;
    this.bindings = bindings;
};

Module.ImportAs = function(path, name){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(path, name);
    this.path = path;
    this.name = name;
};

Module.Import = function(path, names){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(path, names);
    this.path = path;
    this.names = names;
};


Module.Export = function(names){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(names);
    this.names = names;
};
Module.Binding = function(binding){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(binding);
    this.binding = binding;
};

AST.Module = Module;

/** Expression **/

var Expr = {};
Expr.App = function(left, right){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(left, right);
    this.left = left;
    this.right = right;
};

Expr.Lam = function(arg, expr){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(arg, expr);
    this.arg = arg;
    this.expr = expr;
};

Expr.IfElse = function(con, suc, alt){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(con, suc, alt);
    this.con = con;
    this.suc = suc;
    this.alt = alt;
};

Expr.LetIn = function(bindings, expr){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(bindings, expr);
    this.bindings = bindings;
    this.expr = expr;
};

Expr.CaseOf = function(con, cases){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(con, cases);
    this.con = con;
    this.cases = cases;
};

Expr.CaseOf.Case = function(val, expr){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(val, expr);
    this.val = val;
    this.expr = expr;
};

Expr.Op = function(op, left, right){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(op, left, right);
    this.op = op;
    this.left = left;
    this.right = right;
};

Expr.ID = function(name){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(name);
    this.name = name;
};

Expr.Attr = function(expr, attr){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(expr, attr);
    this.expr = expr;
    this.attr = attr;
};

Expr.Val = function (type, val){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(type, val);
    this.type = type;
    this.val = val;
};

Expr.Array = function (content){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(content);
    this.content = content;
};

Expr.Object = function (content){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(content);
    this.content = content;
};

Expr.Object.KeyValue = function(key, val){
    if( !(this instanceof arguments.callee) )
        return new arguments.callee(key, val);
    this.key = key;
    this.val = val;
};

AST.Expr = Expr;
module.exports = AST;
