
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

  var Environment = Class('Environment', Object)
    .method('constructor', function(){
      this.prefix = 'id_';
      this.parent = this;
      this.content = {};
    })
    .method('constructor', function(env){
      this.prefix = env.prefix;
      this.parent = env;
      this.content = Object.create(env.content);
    })
    .method('create', function(){
      return Environment(this);
    })
    .method('get', function(id){
      return this.content[this.prefix+id];
    })
    .method('set', function(id, value){
      this.content[this.prefix+id] = value;
    });

  return Environment;
});


})(this, typeof define !== 'undefined' && define);
