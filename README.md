# Smooth

## 简介

可以在此处试用 [Git Page 传送门](http://bramblex.github.io/Smooth/)。

Smooth 是一门 Haskell Like 语法并且编译到 JavaScript 的函数式语言。但和 Haskell 不同的是，Smooth 没有强类型系统，也不要求纯函数。Smooth 可以非常轻易地混合使用命令式语言和函数式语言的特性，所以 Smooth 将会是一门非常实用且非常方便的语言。

Smooth 借鉴了 Haskel 中的 do 语法，但是剔除了其中深奥复杂的抽象，使得开发更为轻松简单，尤其是处理 JavaScript 异步的过程。

以下是一个简单的例子，将每隔一秒种依次输出 `hello` 、`world`、`smooth`。最后当全部输出完了以后会输出 `done`。

```
print = `(a)=>console.log(a)`

delay = `(ms)=>(f)=>setTimeout(f,ms)`
mkasync = `(job)=>(f)=>{job();f()}`
async f g = f g

asyncPrint str = mkasync \_ -> print str

asyncJob = with async do
     delay 1000
     asyncPrint "hello"
     delay 1000
     asyncPrint "world" 
     delay 1000
     asyncPrint "smooth" 

main _ =
     asyncJob $ \_ -> print "done"
```

Smooth 中的 do...with 不限于解决 JavaScript 中的异步问题，其本质就是一个简单的 CPS 变幻。在 Haskell 中，do 语法糖主要作用是用来 bind monad。

## 语法

明天继续完善 (●°u°●)​ 」


