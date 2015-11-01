
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

  var CharSet = Class('CharSet', String)
    .method('has', function(c){
      return this.indexOf(c) >= 0;
    })
    .method('inspect', '*', function(){
      var char_set = Array.prototype.slice.apply(this);
      var content_str = char_set
        .map(function(i){return JSON.stringify(i)})
        .join(' ');
      return '[ CharSet ' + content_str + ' ]';
    });

  CharSet.WholeCharSet = Class('CharSet', CharSet)
    .method('has', function(c){
      return true;
    })
    .method('inspect', '*', function(){
      return '[ WholeCharSet ]';
    });

  return CharSet;
});


})(this, typeof define !== 'undefined' && define);
