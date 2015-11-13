
define(['./Utils'], function(Utils){

  var named = function named(name, func){
    var code = func.toString();
    return '(' + code.replace(/(function\s+)(\w*?)\s*(\([\w, ]*?\))/m, '$1'+name+'$3') + ')';
  };

  var method = function method(name, argc, func){
    if (typeof arguments[1] === 'function'){
      var func = arguments[1];
      var argc = func.length;
    }
    else if (arguments[1] === '*' && typeof arguments[2] === 'function'){
      var func = arguments[2];
      var argc = '*';
    }
    else {
      throw new Error('Define method Error!');
    }

    var this_class = this;

    if (name === 'constructor')
      name = '__constructor__';

    if(!this_class.prototype[name] || this_class.prototype[name]['__class__'] !== this_class){
      this_class.prototype[name] = eval(named(this_class.name+'_'+name, function(){
        var methods = this_class['__methods__'];
        var method = (methods && ( methods[name][arguments.length] || methods[name]['*'] ) ) || undefined;
        if (!method){
          method = this_class.parent.prototype[name];
          if (!method){
            err = Error('method not found!');
            err.stack = err.stack.slice(0, -2);
            throw err;
          }
        }
        return method.apply(this, arguments);
      }));
      this_class.prototype[name]['__class__'] = this_class;
    }

    if(!this_class.__methods__)
      this_class.__methods__ = {};
    if(!this_class.__methods__[name])
      this_class.__methods__[name] = {};
    this_class.__methods__[name][argc] = func; 

    return this;
  }

  var classmethod = function classmethod(name, func){
    this[name] = eval(named(this.name+'_class_'+name, function(){
      return func.apply(this, arguments);
    }));
    this[name]['is_classmethod'] = true;
    return this;
  }

  var extend = function extend(name){
    return Class(name, this);
  };

  var alias = function alias(name, method){
    this.method(name, '*', this.prototype[method]);
    this.prototype[name]['is_alias_to'] = method;
    return this;
  };

  var upper = function upper(name){
    var this_class = this;
    if (name === 'constructor')
      name = '__constructor__';
    return this_class.parent.prototype[name];
  };

  var inspect =  function inspect(){
    var this_class = this;
    var methods = Utils.attrs(this.prototype)['all']
      .map(function(method_name){
        var method = this_class.prototype[method_name];
        var method_class = method.__class__;
        var is_alias_to = method.is_alias_to;
        if (is_alias_to){
          var method_content = method_name + ' -> '+ is_alias_to;
        }
        else {
          var method_content = method_name;
        }
        if (this_class === method_class){
          return method_content;
        }
        else{
          return method_class.name + '::' + method_content;
        }
      });
    var methods_content = 'methods: \n'
      + Utils.indent(2, methods.join('\n'));
    var classmethods = Utils.attrs(this)['self']
      .filter(function(m){ return this_class[m]['is_classmethod'] || false; });
    var classmethods_content = 'classmethods: \n'
      + Utils.indent(2, classmethods.join('\n'));
    var content = Utils.indent(2, [classmethods_content, methods_content].join('\n\n'));
    return Utils.render(
      '[ Class <% class_name %> extend <% parent_class_name %>\n\n<% content %>\n]',
      {class_name: this.name, parent_class_name: this.parent.name, content: content});
  };


  var Class = function Class(name, parent){
    var parent  = parent || Object;

    var child = eval(named(name, function(){
      var this_class = arguments.callee;
      var obj;
      if(this instanceof this_class){
        if (!!this_class.__sign__){
          delete this_class.__sign__;
          return;
        } else {
          obj = this;
        }
      }
      else{
        this_class.__sign__ = true;
        obj = new this_class();
      }
      obj.__class__ = this_class;
      this_class.prototype['__constructor__'].apply(obj, arguments);

      return obj;
    }));

    if (!!parent['parent'])
      parent.__sign__ = true;
    child.prototype = new parent();
    child.parent = parent;

    // function
    child.method = method;
    child.classmethod = classmethod;
    child.extend = extend;
    child.alias = alias;
    child.upper = upper;
    child.name = name;
    child.inspect = inspect;

    child.method('constructor', function(){
      if (child.upper('constructor'))
        child.upper('constructor').apply(this, arguments);
    });

    // init
    return child;
  };

  return Class;
});
