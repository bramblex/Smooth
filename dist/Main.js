
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

  
define(['./Class', './Lexer', './Parser'], function(Class, Lexer, Parser){

  var Main = Class('Main', Object)
    .classmethod('run', function(){
      var lexer = Lexer();
      var parser = Parser();

      try{
        var beautify = require('js-beautify').js_beautify;
      }
      catch (e){
        var beautify = function(a){return a};
      }
      var fs = require('fs');
      var code = fs.readFileSync('./test.code', 'utf8');
      //var token_stream = lexer.parse('"asfd" aaa #');
      var token_stream = lexer.parse(code);
      var ast = parser.parse(token_stream);

      var library_code = fs.readFileSync('./library.js', 'utf8');
      var target_code = ast.toJavaScript();

      fs.writeFileSync('./test_dist.js', beautify(library_code+target_code));
    });

  return Main;
});

require('./Main.js').run();


})(this, typeof define !== 'undefined' && define);
