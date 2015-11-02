
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

  
define(['./Class'], function(Class){

  var CharSet = Class('CharSet', Array)
    .method('constructor', function(){})
    .method('constructor', function(start, end){
      var i = start.charCodeAt(0);
      var j = end.charCodeAt(0);
      for (; i <= j; i++){
        this.push(String.fromCharCode(i));
      }
    })
    .method('constructor', function(array){
      this.push.apply(this, Array.prototype.slice.apply(array));
    })
    .method('has', function(c){
      return this.indexOf(c) >= 0;
    })
    .method('or', function(char_set){
      return OrCharSet(this, char_set);
    })
    .method('and', function(char_set){
      return AndCharSet(this, char_set);
    })
    .method('inspect', '*', function(){
      var content_str = this
        .map(function(i){return JSON.stringify(i)})
        .join(' ');
      return ['[', this.__class__.name , content_str, ']'].join(' ');
    });

  var WholeCharSet = Class('WholeCharSet', CharSet)
    .method('has', function(c){
      return true;
    });

  var NoneCharSet = Class('NoneCharSet', CharSet)
    .method('has', function(c){
      return false;
    });

  var NotCharSet = Class('NotCharSet', CharSet)
    .method('has', function(c){
      return this.indexOf(c) < 0;
    });

  var AndCharSet = Class('AndCharSet', CharSet)
    .method('constructor', function(char_set1, char_set2){
      this.char_set1 = char_set1;
      this.char_set2 = char_set2;
    })
    .method('has', function(c){
      return this.char_set1.has(c) && this.char_set2.has(c);
    })
    .method('inspect', '*', function(){
      return ['(', this.char_set1.inspect(), 'AND', this.char_set2.inspect(), ')'].join(' ')
    });

  var OrCharSet = Class('OrCharSet', CharSet)
    .method('constructor', function(char_set1, char_set2){
      this.char_set1 = char_set1;
      this.char_set2 = char_set2;
    })
    .method('has', function(c){
      return this.char_set1.has(c) || this.char_set2.has(c);
    })
    .method('inspect', '*', function(){
      return ['(', this.char_set1.inspect(), 'OR', this.char_set2.inspect(), ')'].join(' ')
    });

  CharSet.whole = WholeCharSet();
  CharSet.none = NoneCharSet();
  CharSet.NotCharSet = NotCharSet;
  return CharSet;
});


})(this, typeof define !== 'undefined' && define);
