# Smooth

## 简介

可以在此处试用 [Git Page 传送门](http://bramblex.github.io/Smooth/)。

Smooth 是一门 Haskell Like 语法并且编译到 JavaScript 的函数式语言。但和 Haskell 不同的是，Smooth 没有强类型系统，也不要求纯函数。Smooth 可以非常轻易地混合使用命令式语言和函数式语言的特性，所以 Smooth 将会是一门非常实用且非常方便的语言。

Smooth 借鉴了 Haskel 中的 do 语法，但是剔除了其中深奥复杂的抽象，使得开发更为轻松简单，尤其是处理 JavaScript 异步的过程。

以下是一个简单的例子，将每隔一秒种依次输出 `hello` 、`world`、`smooth`。最后当全部输出完了以后会输出 `done`。

```
Zepto = `Zepto`;

print line = console.html (text + line + '\n')
    where {
        console = (Zepto '#console-content');
        text = console.html <& [];
    };

delay ms f = `setTimeout` <& [f, ms];

mkAsync f g = g $ f _;

get url f = Zepto.get <& [url, f];
async f g = f g;

asyncJob = @async {
  @async {
    delay 1000;
    mkAsync \_ -> print 'Welcome';
    delay 1000;
    mkAsync \_ -> print 'to';
    delay 1000;
    mkAsync \_ -> print 'Smooth';
    delay 1000;
    mkAsync \_ -> print 'World';
  };
  example_code <- get 'javascripts/example.sm';
  mkAsync \_ -> print example_code;
  delay 1000;
  mkAsync \_ -> print 'done';
};

main = asyncJob \_ -> print 'done';
```

Smooth 中的 do...with 不限于解决 JavaScript 中的异步问题，其本质就是一个简单的 CPS 变幻。在 Haskell 中，do 语法糖主要作用是用来 bind monad。

## 语法

明天继续完善 (●°u°●)​ 」


