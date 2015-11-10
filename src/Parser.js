define(['./Class', './Token', './PreProcess'], function(Class, Token, PreProcess){

  var ParserError = Class('ParserError', Error)
    .method('constructor', function(position){
      this.position = position;
      this.name = 'Parser Error'
      this.message = 'Parser Error At ' + position.inspect();
      Error.captureStackTrace(this, ParserError);
    });

  var Parser = (function(){

    var Block = PreProcess.Block;
    var Line = PreProcess.Line;

    var ExpressionParser = function ExpressionParser(expression, environmnet){
    };
    
    return Class('Parser', Array)
      .method('parse', function(block){
      });
  })();

  return Parser
});
