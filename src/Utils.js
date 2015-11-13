define(function(){

  var Utils = {};

  Utils.indent =  (function(){
    var indentStr = function indentStr(n, s){
      var n = n || 0;
      var s = s || ' ';
      var str = '';
      for (var i=0; i<n; i++){
        str += s;
      }
      return str;
    }
    return function indentBlock(n, b, s){
      var indent_str = indentStr(n, s);
      return b.replace(/^/g, indent_str).replace(/\n/g, '\n'+indent_str);
    };
  })();

  Utils.attrs =(function(){
    var dontEnums = [
      '__defineGetter__',
      '__lookupSetter__',
      'hasOwnProperty',
      'toLocaleString',
      '__defineSetter__',
      '__proto__',
      'isPrototypeOf',
      'toString',
      '__lookupGetter__',
      'constructor',
      'propertyIsEnumerable',
      'valueOf'
    ];

    var hasOwnProperty = (function(){
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      return function (obj, key){
        return hasOwnProperty.call(obj, key);
      };
    })();

    return function attrs(obj){
      var self = [];
      var proto = [];
      var all = [];

      for (var key in obj){
        if (hasOwnProperty(obj, key)){
          self.push(key);
          all.push(key);
        }
        else if(dontEnums.indexOf(key) < 0){
          proto.push(key);
          all.push(key);
        }
      }
      return {
        self: self,
        proto: proto,
        all: all
      };
    }

  })(); 

  Utils.render = function render(wapper, values){
    return wapper.split('%>').map(function(piece){
      var p  = piece.split('<%');
      return (p[0] || '') + ((p[1] && values[p[1].replace(/^\s*(\w+)\s*$/,'$1')]) || '');
    }).join('');
  };

  return Utils;
});
