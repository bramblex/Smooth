
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

  
define(function(){

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
            throw new Error('method not found!');
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

    return this;
  }

  var extend = function extend(name){
    return Class(name, this);
  };

  var alias = function alias(name, method){
    this.prototype[name] = this.prototype[method];
    return this;
  };

  var uper = function uper(name){
    var this_class = this;
    if (name === 'constructor')
      name = '__constructor__';
    return this_class.parent.prototype[name];
  };

  var Class = function Class(name, parent){

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
    child.uper = uper;
    child.name = name;

    child.method('constructor', function(){
      if (child.uper('constructor'))
        child.uper('constructor').apply(this, arguments);
    });

    // init
    return child;
  };

  return Class;
});


})(this, typeof define !== 'undefined' && define);
