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
    n = sub(n)(1);
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
print(List(1)(2)(3)(List(3)(2)(1)(End))(End));