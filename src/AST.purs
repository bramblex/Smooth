
module AST where

newtype Module = Module (Array Binding)

data Binding = Binding String Expression

data Expression = Val String
                | Lam String Expression
                | App Expression Expression
                | Lit Literal
                | FFI String

data KeyValueTuple = KeyValueTuple String Expression
data Literal = LNum Number
             | LStr String
             | LBool Boolean
             | LArr (Array Expression)
             | LObj (Array KeyValueTuple)
             | LNull
             | LUndefined
