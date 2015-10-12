
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

  
define(['./Class', './Lexer'], function(Class, Lexer){

  var Main = Class('Main', Object)
    .classmethod('run', function(){
      //var lexer = Lexer();

      //var fs = require('fs');
      //var code = fs.readFileSync('./test.code', 'utf8');
      ////var token_stream = lexer.parse('"asfd" aaa #');
      //var token_stream = lexer.parse(code);
      //console.log(token_stream);

      var A = Class('A', Object)
        .method('run', function(){
          console.log('没有参数');
        });
      var B = Class('B', A)
        .method('run', function(a){
          console.log('一个参数', a);
        });
      var C = B.extend('C')
        .method('run', function(a, b){
          console.log('两个参数', a, b);
        });
      var t = C();
      t.run();
      t.run(1);
      t.run(1,2);
      console.log(t instanceof A);
      console.log(t instanceof B);
      console.log(t instanceof C);
      
    });

  return Main;
});

require('./Main.js').run();


})(this, typeof define !== 'undefined' && define);
