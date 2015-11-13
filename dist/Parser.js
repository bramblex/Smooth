
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

  define(['./Class', './Token', './PreProcess', './Environment'], function(Class, Token, PreProcess, Environment){

  var ParserError = Class('ParserError', Error)
    .method('constructor', function(position){
      this.position = position;
      this.name = 'Parser Error'
      this.message = 'Parser Error At ' + position.inspect();
      Error.captureStackTrace(this, ParserError);
    });

  var Parser = (function(){

    var ExpressionParser = function ExpressionParser(expression, environmnet){
    };
    
    return Class('Parser', Array)
      .method('parse', function(block){
        var env = Environment();
      })
      .method('');

  })();

  return Parser
});


})(this, typeof define !== 'undefined' && define);
