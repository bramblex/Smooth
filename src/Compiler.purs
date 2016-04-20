
module Compiler where

import Prelude
import Data.String
import AST

class IsAST a where
  compile :: a -> String

instance isASTModule :: IsAST Module where
  compile (Module bs) = "((()=>{"
                        ++ joinWith ";" (map compile bs)
                        ++ ";return{"
                        ++ joinWith "," (map (\(Binding n _) -> n ++ ":$$" ++ n) bs)
                        ++"};})())"

instance isASTBinding :: IsAST Binding where
  compile (Binding n e) = "const $$" ++ n ++ "=" ++ compile e

instance isASTExpression :: IsAST Expression where
  compile (Val n) = "$$" ++ n
  compile (Lam n e) = "(($$" ++ n ++ ")=>" ++ compile e ++ ")"
  compile (App l r) = "(" ++ compile l ++ "(" ++ compile r ++ ")" ++ ")"
  compile (Lit l) = compile l
  compile (FFI c) = "(" ++ c ++ ")"

instance isASTKeyValueTuple :: IsAST KeyValueTuple where
  compile (KeyValueTuple n e) = show n ++ ":" ++ compile e

instance isASTLiteral :: IsAST Literal where
  compile (LNum n) = show n
  compile (LStr s) = show s
  compile (LBool b) = show b
  compile (LArr es) = "[" ++ joinWith "," (map compile es) ++ "]"
  compile (LObj kvs) = "{"++ joinWith "," (map compile kvs) ++ "}"
  compile LNull = "null"
  compile LUndefined = "undefined"
