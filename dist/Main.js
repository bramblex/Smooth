
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

  
define(['./Class', './Lexer', './Parser', './CPS'], function(Class, Lexer, Parser, CPS){

  var Main = Class('Main', Object)
    .classmethod('parse', function(source_code){

      var lexer = Lexer();
      var parser = Parser();

      var token_stream = lexer.parse(source_code+'\n');
      var ast = parser.parse(token_stream);
      var target_code = ast.toJavaScript();

      return target_code;
    })
    .classmethod('cps', function(source_code){

      var lexer = Lexer();
      var parser = Parser();

      var token_stream = lexer.parse(source_code+'\n');
      var ast = parser.parse(token_stream);

      return CPS.transform(ast).inspect(0);
    });

  return Main;
});


})(this, typeof define !== 'undefined' && define);
