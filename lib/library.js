
var $define = function($func){
  return eval((function(func){
    if (typeof func !== 'function'){
      throw Error('Argument must be a function!');
    }
    var func_str = func.toString();
    var regex = /^function\s*([\w\d_]*|\s*)\s*\(([\w\d\s_,]+)\)\s*{([\s\S]*)}$/; 
    var matched = func_str.match(regex);
    if (!matched){
      throw Error('Curry function at last has only one arguemnt!');
    }
    var name = matched[1];
    var args = matched[2].split(',').map(function(i){return i.trim()});
    var body = matched[3];
    var target_func_str = body;
    for (var i=args.length-1; i>=0; i--){
      if (i === 0){
        target_func_str = 
          '(function(' + args[i]  + '){' + target_func_str + '});';
      }
      else {
        target_func_str = 
          'return function(' + args[i]  + '){' + target_func_str + '}';
      }
    }
    return target_func_str;
  })($func));
}

var add = $define(function(a,b){
  return a+b;
});

var sub = $define(function(a,b){
  return a-b;
});

var mult = $define(function(a,b){
  return a*b;
});

var div = $define(function(a,b){
  return a/b;
});

var greater = $define(function(a,b){
  return a>b;
});

var less = $define(function(a,b){
  return a<b;
});

var equal = $define(function(a,b){
  return a===b;
});

var and = $define(function(a,b){
  return (!!a) && (!!b);
});

var or = $define(function(a,b){
  return (!!a) || (!!b);
})

var not = $define(function(a){
  return !a;
});

var print = $define(function(a){
  console.log(a);
});

var compose = $define(function(f,g){
  return function(a){
    return f(g(a));
  };
});

var error = $define(function(a){
  throw Error(a);
});

var wait = $define(function(time, callback){
  return setTimeout(function(a){return callback(a)}, time);
});


// == All About List ==
var End = {isEnd: true};
var List = (function(){
  var _List = function(a, array){
    if (a === End){
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

var head = $define(function(l){
  return l[0];
});

var last = $define(function(l){
  return l[l.length-1];
});

var tail = $define(function(l){
  return l.slice(1);
});

var init = $define(function(l){
  return l.slice(0, -1);
});

var length = $define(function(l){
  return l.length;
});

var map = $define(function(f, l){
  return l.map(f);
});

var reverse = $define(function(l){
  return l.slice().reverse();
});

var filter = $define(function(f, l){
  return l.filter(f);
});

var fold = $define(function(f, i, l){
  return l.reduce(f, i);
});

var foldr = $define(function(f, i, l){
  return l.reduceRight(f, i);
});

var concat = $define(function(l, i){
  return l.concat(i);
});

var take = $define(function(c, l){
  return l.slice(0,c);
});

var drop = $define(function(c, l){
  return l.slice(c);
});
