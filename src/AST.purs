
module AST where

import Data.Tuple (Tuple())

newtype Scope = Scope (Array Binding)

data Binding = Binding String Expression

data Expression = Val String
                | Lam String Expression
                | App Expression Expression
                | Lit Literal

data Literal = LNum Number
             | LStr String
             | LBoo Boolean
             | LArr (Array Expression)
             | LObj (Array (Tuple String Expression))
             | LNul
             | LUnd
