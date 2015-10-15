var add = function(a) {
  return function(b) {
    return a + b;
  }
};
var sub = function(a) {
  return function(b) {
    return a - b;
  }
};
var mult = function(a) {
  return function(b) {
    return a * b;
  }
};
var div = function(a) {
  return function(b) {
    return a / b;
  }
};
var compare = function(a) {
  return function(b) {
    return a === b;
  }
};
var not = function(a) {
  return !a;
};
var print = function(a) {
  console.log(a);
};
var End = {
  isEnd: true
};
var List = (function() {
  var _List = function(a, array) {
    if (a.isEnd === true) {
      return array;
    }
    var array = array.slice();
    array.push(a);
    return function(b) {
      return _List(b, array);
    };
  };
  return function(a) {
    var array = [];
    return _List(a, array);
  };
})();
var error = function(a) {
  throw Error(a);
};
print("=====================================");
var fact = function(n) {
  if (compare(n)(1)) {
    return (1);
  };
  return (mult)(n)(fact(sub(n)(1)));
};
print(fact(5));
print("=====================================");
var loop = function(n) {
  while (not(compare(n)(0))) {
    print(n);
    if (typeof n !== 'undefined') {
      n = sub(n)(1)
    } else {
      error('n not defined!')
    };
  };
};
loop(10);
print("=====================================");
var func = function(a) {
  return function(b) {
    return function(c) {
      return (add)(add(a)(b))(c);
    }
  }
};
var func1 = func(1);
var func2 = func1(2);
var func3 = func2(3);
print(func3);
print("=====================================");
print(List(1)(2)(3)(4)(End));
var l1 = List(1)(2)(3)(4);
var l2 = l1(5)(6)(7)(8)(End);
var l3 = l1(End);
print(List(l1)(l2)(l3)(End));
print("=====================================");
var ieFunc = (function() {
  var aaa = "aaa";
  var bbb = "bbb";
  print(List(aaa)(bbb)(End));
  var _func_ = function(ccc) {
    print(List(ccc)(bbb)(aaa)(End));
  };
  return (_func_);
})();
ieFunc("ccc");