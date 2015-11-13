
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

  
define(['./Class', './EventEmitter'], function(Class, EventEmitter){

  var UniqueArray = Class('UniqueArray', Array)
    .method('push', function(item){
      if (this.indexOf(item) >= 0){
        return item;
      }
      else {
        return UniqueArray.upper('push').call(this, item);
      }
    });

  var State = Class('State', Object)

    .method('constructor', function(name){
      this.name = name;
      this.inputs = [];
    })

    .method('transitionRule', function(input, next_state){
      if (!(next_state instanceof State)){
        throw Error();
      }

      if (typeof input === 'string' || typeof input === 'number'){
        var check_func = function(i){return i === input};
      }
      else if (typeof input === 'function'){
        var check_func = input;
      }
      else if ( input instanceof RegExp){
        var check_func = function(i){return input.test(i)};
      }
      else {
        throw Error();
      }

      this.inputs.push(function(input){
        if (check_func(input)){
          return next_state;
        }
        else {
          return false;
        }
      });
      return this;
    })

    .method('input', function(input){
      var result = false;
      for (var i=0,l=this.inputs.length; i<l; i++){
        var result = this.inputs[i](input);
        if (result){
          break;
        }
      }
      return result;
    });

  var EndState = State.extend('EndState');

  var Reject = Class('Reject', Object)
    .method('constructor', function(input){
      this.input = input;
      this.name = 'Reject'
      this.message = 'DFA Reject Input:' + (input.inspect && input.inspect() || input);
      Error.captureStackTrace(this, Reject);
    });

  var DFA = EventEmitter.extend('DFA')

    .method('constructor', function(){
      DFA.upper('constructor').call(this);
      this.__state_list__ = UniqueArray();
      this.__end_state_list__ = UniqueArray();
      this.__transition_list__ = UniqueArray();
    })

    .method('endState', '*', function(){
      var _this = this;
      Array.prototype.slice.apply(arguments).forEach(function(state_name){
        _this.__end_state_list__.push(state_name);
      });
      return this;
    })

    .method('transitionRule', function(current_state, input, next_state){
      this.__state_list__.push(current_state);
      this.__state_list__.push(next_state);
      this.__transition_list__.push([current_state, input, next_state]);
      return this;
    })

    .method('transitionRule', (function(){
      var rule_reg = /^\s*([\w\*]+)\s*\(\s*(\w+)\s*\)\s*=>\s*(\w+)\s*$/;
      return function(rule_string){
        var matched = rule_string.match(rule_reg);
        if (matched){
          return this.transitionRule(matched[1], matched[2], matched[3]);
        }
        else {
          throw Error('rules can not matched');
        }
      }})())

    .method('__complie__', function(){
      var transitions = {}

      this.__state_list__.forEach(function(state_name){
        transitions[state_name] = State(state_name);
      });
      this.__end_state_list__.forEach(function(state_name){
        transitions[state_name] = EndState(state_name);
      });

      this.__transition_list__.forEach(function(t){
        var current_state = transitions[t[0]];
        var input = t[1];
        var next_state = transitions[t[2]];
        current_state.transitionRule(input, next_state);
      });

      this.transitions = transitions;
    })

    .method('start', function(start_state_name){
      this.__complie__();

      this.emit('start', start_state_name);
      this.state = this.transitions[start_state_name];
      this.start_state = this.state;

      this.input = this.__input__;
      this.reset = this.__reset__;

      this.emit('change');
      return this;
    })

    .method('__reset__', function(){
      this.state = this.start_state;
    })

    .method('__input__', function(input){

      var last_state_name = this.state.name;
      var result = this.state.input(input);
      var current_state_name = result.name;

      if (!!result){
        this.emit(last_state_name + '_leave', input);
        this.state = result;
        this.emit(last_state_name + '_to_' + current_state_name, input);
        this.emit(current_state_name + '_enter', input);

        this.emit('change');
      }
      else {
        throw Reject(input);
      }

      if (this.isEnd()){
        this.emit('end');
      }
      return this;
    })

    .method('isEnd', function(){
      return this.state instanceof EndState;
    })

    .classmethod('uniqueState', (function(){
      var i = 0;
      return function(){
          return i++;
      }
    })());

  DFA.Reject = Reject;
  return DFA
});


})(this, typeof define !== 'undefined' && define);
