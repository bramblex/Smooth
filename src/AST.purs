
module AST where

newtype Module = Module (Array Binding)

data Binding = Binding String Expression

data Expression = Lit Literal
                | Val String
                | Lam String Expression
                | App Expression Expression

                | FFI String
                | LetIn (Array Binding) Expression
                | IfElse Expression Expression Expression

data KeyValueTuple = KeyValueTuple String Expression
data Literal = LNum Number
             | LStr String
             | LBool Boolean
             | LArr (Array Expression)
             | LObj (Array KeyValueTuple)
             | LRegex String
             | LNull
             | LUndefined

