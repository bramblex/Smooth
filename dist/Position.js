
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

  var Position = Class('Position', Object)
    .method('constructor', function(){
      this.offset = 0;
      this.line_nu = 1;
      this.char_nu = 1;
    })
    .method('constructor', function(position){
      this.offset = position.offset;
      this.line_nu = position.line_nu;
      this.char_nu = position.char_nu;
    })
    .method('copy', function(){
      return Position(this);
    })
    .method('set', function(offset){
      this.char_nu = this.char_nu + (offset - this.offset);
      this.offset = offset;
    })
    .method('addLine', function(){
      this.line_nu = this.line_nu + 1;
      this.offset = this.offset + 1;
      this.char_nu = 1;
    })
    .method('inspect', '*', function(){
      return 'Line ' + this.line_nu + ', Char ' + this.char_nu;
    });

  return Position;
});


})(this, typeof define !== 'undefined' && define);
