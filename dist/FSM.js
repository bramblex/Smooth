
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

  
define(['./EventEmitter'], function(EventEmitter){

  var rule_regexp = /^\s*([\w\*]+)\s*\(\s*(\w+)\s*\)\s*=>\s*(\w+)\s*$/;
  var start_regexp = /\*/;

  // parse rule like "current_state (input) => next_state"
  var parseRule = function parseRule(rule){
    var parsed = rule.match(rule_regexp);

    if (!parsed)
      throw Error(rule);

    var sing = 'normal';
    if (start_regexp.test(rule))
      sign = 'wildcrad';

    return {
      sign: sign,
      input: parsed[2],
      current_state: parsed[1],
      next_state: parsed[3]
    };
  };

  // uniquefy a array
  var uniquefy = function uniquefy(array){
    return array.filter(function(item, index, self){
      return self.indexOf(item) === index;
    });
  };

  // compile all rules to a hash
  var complieRules = function complieRules(rules_list){
    
    // scan all states;
    var states_list = [];

    rules_list.forEach(function(item, index, self){
      if (!start_regexp.test(item.current_state))
        states_list.push(item.current_state);
      states_list.push(item.next_state);
    });
    states_list = uniquefy(states_list);

    var result = {};
    rules_list.forEach(function(item, index, self){

      var sign = item.sign;
      var input = item.input;
      var current_state = item.current_state;
      var next_state = item.next_state;

      if (!result[input])
        result[input] = {};

      if (sign === 'normal'){
        result[input][current_state] = next_state;
      }
      else if (sign === 'wildcrad'){
        var wildcrad_regex = RegExp('^'+current_state.replace('*', '\\w+')+'$');
        states_list
        .filter(function(item, index, self){
          return wildcrad_regex.test(item);
        })
        .forEach(function(item, index, self){
          result[input][item] = next_state;
        });
      }
    });

    return {result:result,
      states_list: states_list};
  };

  var FSM = EventEmitter.extend('FSM')

  .method('constructor', function(){
    FSM.uper('constructor').apply(this);

    this.__rules__ = {};
    this.__states_list__ = [];

    this.state = null;
    this.rules = [];

  })
  
  .method('rule', function(r){

    if( this.state )
      throw Error('FSM is aready ran!');

    if(rule_regexp.test(r)){
      this.rules.push(r);
      return this;
    }
    throw Error(r);
  })

  .method('rule', function(current_state, input, next_state){
    this.rules.push(current_state+'('+input+')=>'+next_state);
  })

  .method('start', function(state){

    if( this.state )
      throw Error('FSM is aready ran!');

    var complied = complieRules(this.rules);
    this.__rules__ = complied.result;
    this.__states_list__ = complied.__states_list__;

    if (__states_list__.indexOf(state) < 0)
      throw Error('state not found!');

    this.state = state;
    this.emit('start', state);
    return this;

  })

  .method('input', function(input){
    if (!this.state)
      throw Error('FSM is not runing!');

    if (!!this.__rules__[input] && !!this.__rules__[input][this.state]){
      var current_state = this.state;
      var next_state = this.__rules__[input][this.state];

      this.emit('change', current_state, next_state, input);
      this.emit(this.state+'end', input);
      this.emit(this.state+'to'+next_state, input);
      this.state = next_state;
      this.emit(next_state+'enter', input);
      return this;
    }

    throw Error(input);
  })

  .method('clone', function(){

    if (!this.state)
      throw Error('FSM is not runing!');

    var obj = this.__class__();
    obj.rules = this.rules;
    obj.__rules__ = this.__rules__;
    obj.__states_list__ = this.__states_list__;
    obj.start(this.state);

    return obj;
  })

  .classmethod('uniqueId', (function(){
    var count = 0;
    return function(){
      return count++;
    };
  })());

  return FSM;
});


})(this, typeof define !== 'undefined' && define);
