#BlxScript
1. [简介](#简介)
2. [安装](#安装)
2. [语法](#语法)

#简介
BlxScript是我闲蛋疼自己设计的语言，由Lambda表达式扩展而来，函数式特性非常强的语言。BlxScript能编译成JS再执行。你可以在这里测试以及尝试。[http://bramblex.github.io/BlxScript](http://bramblex.github.io/BlxScript)

#安装
1. 首先，你要有```node```和```npm```
2. 从github克隆代码。```git clone https://github.com/bramblex/BlxScript.git```
3. 用npm link一下。```cd BlxScript && npm link```
4. 用 ```blxscript``` 直接运行代码，或者用 ```blxscriptc``` 编译成js。

#语法
1. [Hello World](#Hello World)
2. [基础函数](#基础函数)
2. [表达式](#表达式)
3. [赋值](#赋值)
4. [定义函数](#定义函数)
5. [条件语句](#条件语句)
6. [循环语句](#循环语句)
7. [函数的柯里化](#函数的柯里化)
8. [列表](#列表)

##Hello World
```
#先从hello world开始吧。
print 'Hello World!'
```
##基础函数
1. (add x y) => x + y
2. (sub x y) => x - y
3. (mult x y) => x * y
4. (div x y) => x / y
5. (compare x y) => x == y
6. (not x) => !x
7. (print x) => 输出 x
8. (compose f g) => \x -> f (g x)

##表达式
BlxScript的表达式，和Lambda表达式的应用是一模一样的。BlxScript表达式的BNF是`E := E1 E2| V`。所有的函数都是只有一个参数的函数，并且函数的应用是左结合的。

例如：
```
print (add 1 2) # => 3
```

##赋值
1. 赋值符号有两种，`:=`和`=`。
2. `:=` 相当于创建并且赋值。`a := 10`同JavaScript中`var a = 10`。
3. `=` 直接赋值。`a = 10`同JavaScript中`a = 10`。但是如果`a`未创建。那么使用`=`赋值会报错。

实例：

```
a = 10 # 错误
a := 10 # 正确
 
func x :=
    a = 100 # 这里的 a 就是上面的变量 a
    return a

func2 x :=
    a := 200 # 这里在 func2 的作用域中创建了一个全新的 a 变量
    return a
                
print a # => 10
func 10 # => 这里会改变 a 变量的值
print a # => 100
func2 10 # => 这里不会改变 a 变量的值
print a # => 100
```

##定义函数
```
func x y :=
	a := add x y
	return a
	
print (func 1 2) # => 3
```

##条件语句
```
a := 10
if compare a 10
	a = add a 1
	
print a # => 11
```

##循环语句
```
a := 10
while not (compare n 0)
	print n
	n = sub n 1
```

##函数的柯里化
```
func a b :=
	return add a b
add3 := func 3

print (add3 5) # => 8
print (add3 10) # => 13
```

##列表
```
l := List 1 2 3 4 5 End
print l # => [1, 2, 3, 4, 5]
```
