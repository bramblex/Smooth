
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

  define(['./Class', './DFA', './Token'], function(Class, DFA, Token){

  var Unit = Class('Unit', Object)
    .method('constructor', function(TokenClass, content){
      this.TokenClass = TokenClass;
      this.content = content;
      this.match = this.__matchTokenClassAndContent__;
    })
    .method('constructor', function(TokenClass){
      this.TokenClass = TokenClass;
      this.match = this.__matchTokenClass__;
    })
    .method('__matchTokenClass__', function(token){
      return (token instanceof this.TokenClass);
    })
    .method('__matchTokenClassAndContent__', function(token){
      return this.__matchTokenClass__(token) && token.content == this.content;
    })
    .method('inspect', '*', function(){
      return (this.is_capture && '@' || '') + ['[', this.__class__.name, this.TokenClass.name, this.content||'', ']'].join(' ') ;
    })
    .method('noneOrMore', function(){
      return RepeatNoneOrMore(this);
    })
    .method('oneOrMore', function(){
      return RepeatOneOrMore(this);
    })
    .method('capture', function(){
      this.is_capture = true;
      return this;
    });

  var Repeat = Class('Repeat', Object)
    .method('constructor', function(unit){
      this.unit = unit;
    })
    .method('match', function(token){
      return this.unit.match(token);
    })
    .method('capture', function(){
      this.is_capture = true;
      return this;
    });

  var RepeatOneOrMore = Repeat.extend('Repeat')
    .method('inspect', '*', function(){return (this.is_capture && '@' || '')+this.unit.inspect()+'+'});
  var RepeatNoneOrMore = Repeat.extend('Repeat')
    .method('inspect', '*', function(){return (this.is_capture && '@' || '')+this.unit.inspect()+'*'});

  var MatchDFA = Class('MatchDFA', DFA)
    .method('constructor', function(){
      MatchDFA.upper('constructor').call(this);
      this.captured = [];
    })
    .method('getCaptured', function(){
      return this.captured;
    })
    .method('reset', function(){
      this.captured = [];
      return MatchDFA.upper('reset').call(this);
    })
    .classmethod('createByRule', function(line_rule){

      var dfa = MatchDFA();
      var start_state = DFA.uniqueState();

      var last_state = start_state;

      for (var i=0,l=line_rule.length; i<l; i++){
        (function(){
          var m = line_rule[i];
          if (m instanceof RepeatNoneOrMore){
            var current_state = DFA.uniqueState();
            dfa.transitionRule(
              last_state,
              function(t){return m.match(t);},
              current_state
            );
            dfa.transitionRule(
              current_state,
              function(t){return m.match(t);},
              current_state
            );
            if (i === l-1){
              dfa.endState(last_state);
              if (m.is_capture){
                dfa.on(last_state+'_to_'+current_state, function(input){
                  this.captured.push([]);
                  this.captured[this.captured.length-1].push(input);
                });
                dfa.on(current_state+'_to_'+current_state, function(input){
                  this.captured[this.captured.length-1].push(input);
                });
              }
              last_state = current_state;
            }
            else {
              var n_m = line_rule[i+1];
              var next_state = DFA.uniqueState();
              dfa.transitionRule(
                current_state,
                function(t){return n_m.match(t);},
                next_state
              );
              dfa.transitionRule(
                last_state,
                function(t){return n_m.match(t);},
                next_state
              );
              if (m.is_capture){
                dfa.on(last_state+'_to_'+current_state, function(input){
                  this.__captured_tmp__=[];
                  this.__captured_tmp__.push(input);
                });
                dfa.on(current_state+'_to_'+current_state, function(input){
                  this.__captured_tmp__.push(input);
                });
                dfa.on(current_state+'_to_'+next_state, function(input){
                  this.captured.push(this.__captured_tmp__);
                  this.__captured_tmp__ = null;
                });
                dfa.on(last_state+'_to_'+next_state, function(input){
                  this.captured.push([]);
                })
              }
              i = i+1;
              last_state = next_state;
            }
          }
          else if (m instanceof RepeatOneOrMore){
            var current_state = DFA.uniqueState();
            dfa.transitionRule(
              last_state,
              function(t){return m.match(t);},
              current_state
            );
            dfa.transitionRule(
              current_state,
              function(t){return m.match(t);},
              current_state
            );
            if (m.is_capture){
              dfa.on(last_state+'_to_'+current_state, function(input){
                this.__captured_tmp__ = [];
                this.__captured_tmp__.push(input);
              });
              dfa.on(current_state+'_to_'+current_state, function(input){
                this.__captured_tmp__.push(input);
              });
              var next_state = parseInt(current_state+1);
              dfa.on(current_state+'_to_'+next_state, function(input){
                this.captured.push(this.__captured_tmp__);
                this.__captured_tmp__ = null;
              });
            }
            last_state = current_state;
          }
          else {
            var current_state = DFA.uniqueState();

            dfa.transitionRule(
              last_state,
              function(t){return m.match(t);},
              current_state
            );
            if (m.is_capture){
              dfa.on(last_state+'_to_'+current_state, function(input){
                this.captured.push(input);
              });
            }
            last_state = current_state;
          }
        })();
      }

      dfa.endState(last_state);
      dfa.start(start_state);
      return dfa;
    });


    MatchDFA.Unit = Unit;
    return MatchDFA;
});


})(this, typeof define !== 'undefined' && define);
