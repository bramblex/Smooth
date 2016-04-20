
module Main where

import Prelude
import Control.Monad.Eff
import Control.Monad.Eff.Console

import Data.Either

import AST
import Parser
import Compiler

-- main_module =
--   Module
--   [Binding "print" (FFI "(str) => console.log(str)")
--   ,Binding "main" (Lam "unit" $ App (Val "print") (Lit $ LStr "Hello World!"))]
  -- log $ compile main_module ++ ".main(null);"

code = "aa bb cc \\aaa -> dd ee (ff aaa)"

main :: forall e. Eff (console :: CONSOLE | e) Unit
main = do
  case parse code of
    Left err -> log $ show err
    Right ast -> log $ compile ast
