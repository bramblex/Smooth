module Main where

import Prelude
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE, log, print)
import Control.Monad.Eff.Exception

import Node.FS
import Node.FS.Sync
import Node.Encoding

import Data.List (toUnfoldable)
import Data.Either (Either(..))

import Lexical (lexer, PosToken)

main :: forall e. Eff (console :: CONSOLE, fs :: FS, err :: EXCEPTION | e) Unit
main = do
  str <- readTextFile UTF8 "./example/test.sm"
  case lexer str of
    Right a -> print $ (toUnfoldable a::Array PosToken)
    Left e -> print e
