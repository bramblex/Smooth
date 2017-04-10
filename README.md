# Smooth

## Smooth 新版本计划

1. 去掉蛋疼的大括号和分号，改用缩进来写代码。
2. 加入简易的系统和类型推导， 不过当然还是允许弱类型存在的，同时也可以模式匹配。
3. 加上惰性并且在自己的运行时内实现，同时尽量保证运行时小而简。
4. 设计全新和 JavaScript 的 FFI 接口，保证同时满足简易并且便于书写。
5. 简易的模块系统和构建工具，保证能够动态编译打包。

### 一、新版编译器前端

1. 用第一层解析器去掉蛋疼的大括号和分号
大致准备用一个预编译器来处理大括号和分号问题，以及最为麻烦的换行和代码块的问题。

一般来说，let in / where 等后面跟的是代码块而不是表达式，虽然在语义上代码块和表达式也没有多少区别，但是还是要做以区分。

2. 第二层解析器处理语法糖等，生成语法树。

### 二、新版编译器后端

1. 类型系统
    
类型有几种基本类型 [a] === Array a , (a, b, c ...) === (a, (b, c)...) 类型, Number, String, {T1, T2 | t}, True | False, Null, (T1 | T2 | T3), *

类型声明 type T = T1 String | T2 String | T3 String


*README.md 已过期*

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


