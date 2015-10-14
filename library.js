

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

