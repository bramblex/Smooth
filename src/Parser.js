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
