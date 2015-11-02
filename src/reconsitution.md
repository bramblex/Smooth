#重构
##词法单元由下面组成

1. Identifier
    1. [\_a-zA-z][\_a-zA-z0-9]\*
    2. \(Symbol)

2. Keyword
    1. 声明变量 let
    2. 分支判断 if, else
    3. 循环 while, break, continue
    4. 函数中的 return

3. Symbol
    1. 不可重定义的符号：
        ( ) 
    2. 所有可组合可重定义符号：
        ~ ! = @ $ % ^ & * - + [ ] { } | : < > . / ?

4. Literal
    1. Number 数值，默认有浮点值
    2. Boolean true 和 false
    3. String 单引号扩起来的都是字符串

5. Lambda
    \\Identifier. 表示定义Lambda


6. Indent
    每行开头的缩进
    
7. Comment
    注释用 # 符号到行结束。

    
8. SOF EOF EOL
