

module Main where

import Prelude
import Control.Monad.Eff.Console

import SMToken

foreign import testCode :: String

main = do
  print $ tokenizer testCode
