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

var print = function(a) {
    console.log(a);
};

{
    var fact = (function() {
        return function(n) {
            {
                print(n);
                if (compare(n)(1)) {
                    return (1)
                };
                return (mult)(n)(fact(sub(n)(1)))
            }
        }
    })();
    print(fact(5))
}