
define(['./Class'], function(Class){

  var EventEmitter = Class('EventEmitter', Object)

  .method('constructor', function(){
    //EventEmitter.uper('constructor').apply(this);
    this.events = {};
  })

  .method('addListener', function(event, listener){
    if (!Array.isArray(this.events[event]))
      this.events[event] = [];
    this.events[event].push(listener);
    return this;
  })

  .method('addOnceListener', function(event, listener){
    if (!Array.isArray(this.events[event]))
      this.events[event] = [];

    var once_listener = function(){
      listener.apply(this, arguments);
      this.removeListener(event, listener);
    };
    once_listener['source'] = listener;

    this.events[event].push(once_listener);
    return this;
  })

  .method('removeListener', function(){
    if (arguments.length === 0)
      this.events = {};
    return this;
  })

  .method('removeListener', function(event){
    this.event = [];

    return this;
  })

  .method('removeListener', function(event, listener){

    var listeners = this.events[event];
    if (!Array.isArray(listeners))
      return this;

    for (var i = listeners.length - 1; i >= 0; i--){
      if (listeners[i] === listener ||  listeners[i]['source'] === listener)
        listeners.splice(i, 1);
    }

    return this;
  })

  .method('emitEvent', function(event){
    return this.emitEvent(event, []);
  })

  .method('emitEvent', function(event, args){

    var listeners = this.events[event];
    if (!Array.isArray(listeners))
      return;

    var l = listeners.length;
    for (var i=0; i < l; i++){
      listeners[i].apply(this, args);
    };

    return this;
  })

  .method('emit', function(){
    var event = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    return this.emitEvent(event, args);
  })

  .alias('on', 'addListener')
  .alias('off', 'removeListener')
  .alias('once', 'addOnceListener')
  .alias('trigger', 'EventEmitter');

  return EventEmitter;
});

