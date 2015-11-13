
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

  define(['./Class', './Token', './PreProcess', './DFA'], function(Class, Token, PreProcess, FSM){

  var BaseParser = Class('BaseParser', Object)
    .method('constructor', function(rule, ASTNodeClass){
      this.ASTNodeClass = ASTNodeClass;
    })
    .method('parse', function(line){
    });

  return {
    BaseParser: BaseParser,
    Unit: Unit,
    Match: Match,
  };

  //Parser.push(Match(['Keyword(let)', ['ID'], ['ID*'], 'Symbol(=)', ['Expression | Block']]), )
  //Parser.push(GenPac[M(Token.Keyword)])

  //var Match
  
  //var MatchLine = Class('MatchLine', Object)
    //.method('constructor', function(match_line){
      //var fsm = FSM();
      
      //var match_line = match_line.reduce(function(p, c){

        //p.concat(c);
      //}, []);

      //var current_state = 'start';

      //for(var i=0,l=match_line.length; i<l; i++){
        //var next = match_line[i];
        //var next_state = current[0];
        //var input = current[1];

        //fsm.rule(current_state, input, next_state);

        //current_state = next_state;
      //}

      //fsm.rule(current_state, 'end', 'end');
    //});

      //var fsm = FSM();

      //var match_line = match_line.map(function(item, index){
        //return [index, item];
      //});

      //var current_state = 'start';
      //for(var i=0,l=match_line.length; i<l; i++){
        //var next = match_line[i];
        //var next_state = current[0];
        //var input = current[1];

        //fsm.rule(current_state, input, next_state);

        //current_state = next_state;
      //}

      //fsm.rule(current_state, 'end', 'end');
    //.method('constructor', function(match_line, NodeClass){
      //var fsm = FSM();
      //this.match_line = match_line
        //.map(function(item ,i){
          //return [item, i+1];
        //})
        //.reduce(function(a, b){
          
          //return b;
        //}, ['start', 0]);
    //});

  //var MatchLine = Class('MatchLine', Object)
    //.method('constructor', function(match_line, ASTNode){
      //this.ASTNode = ASTNode;
      //this.match_line = match_line.reduce(function(line, item){
        //if (item === 'Block'){
          //return line.concat(Block());
        //}
        //else if (item === 'Expression'){
          //return line.concat(Expression());
        //}
        //else {
          //var matched = str.match(/\s*(\w+)(\(.*\)|)(\*|\+|\d+|)\s*/);
          //if (matched){
            //var type = matched[1];
            //var content = matched[2];
            //var sign = matched[3];

            //if (content === ''){
              //var match = Match(Token[type+'Token']);
            //}
            //else {
              //var match = Match(Token[type+'Token'], content);
            //}

            //if (sign !== ''){
              //return line.concat(match);
            //}
            //return line.concat(match, Repeat(sign));
          //}
          //else {
            //throw Error();
          //}
        //}
      //}, []);
    //})
    //.method('match', function(line){
      //var i = 0; var l = line.length;
      //var j = 0; var m_l = match_line.length;

      //var matched = [];
      //while(true){
        //if (i === l || j === m_l){
          //if (i === l && j === m_l){
            //return 
          //}
          //else {
            //return false
          //}
        //}
      //};
    //});
});


})(this, typeof define !== 'undefined' && define);
