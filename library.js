var add = function(a){
  return function(b){
    return a + b;
  }
};
var sub = function(a){
  return function(b){
    return a - b;
  }
};
var mult = function(a){
  return function(b){
    return a * b;
  }
};
var div = function(a){
  return function(b){
    return a / b;
  }
};
var compare = function(a){
  return function(b){
    return a === b;
  }
};
var not = function(a){
  return !a;
};
var print = function(a){
  console.log(a);
};
var End = {isEnd: true};
var List = (function(){
  var _List = function(a, array){
    if (a.isEnd === true){
      return array;
    }
    var array = array.slice();
    array.push(a);
    return function(b){
      return _List(b, array);
    };
  };
  return function(a){
    var array = [];
    return _List(a, array);
  };
})();
var error = function(a){
  throw Error(a);
};
