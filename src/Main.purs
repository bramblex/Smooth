module Main where

import Prelude
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE, log, print)
import Control.Monad.Eff.Exception

import Node.FS
import Node.FS.Sync
import Node.Encoding
import Node.Process

import Data.List (toUnfoldable, List(..))
import Data.Either (Either(..))

import Text.Parsing.Parser (ParseError(..))

import Lexer (lexer, PosToken)
import Indent (parseIndent)
import Parser (parse)
import Compiler (compile)

import Grammar (Module)

parseModule :: String -> Either ParseError String
parseModule str =  case lexer ("\n"++str++"\n") of
  Right toks -> case parseIndent toks of
    Right toks' -> case parse toks' of
      Right mod -> Right $ compile mod
      Left err'' -> Left err''
    Left err' -> Left err'
  Left err -> Left err

export :: String -> String
export code = case parseModule code of
  Right output -> output
  Left err -> show err

main :: forall e. Eff (console :: CONSOLE, fs :: FS, err :: EXCEPTION, process :: PROCESS| e) Unit
main = do
  [_, _, input_file, output_file] <- argv
  input <- readTextFile UTF8 input_file
  case parseModule input of
    Right output -> writeTextFile UTF8 output_file output
    Left err -> print err

    -- print input
  -- print output
  -- print input
  -- print ouput
  -- str <- readTextFile UTF8 "./example/test.sm"
  -- case parseModule str of
  --   Right a -> log a
  --   Left err -> print err

-- parseModule2Toks str =  (toUnfoldable::List PosToken -> Array PosToken) <$> case lexer ("\n"++str++"\n") of
--   Right toks -> case parseIndent toks of
--     Right toks' -> Right toks'
--     Left err' -> Left err'
--   Left err -> Left err

  -- log "hello world"
  -- case parseModule2Toks str of
  --   Right a -> print a
    -- Left err -> print err

  -- case parseModule str of
  --   Right a -> log a
  --   Left err -> print err
  -- case lexer str of
  --   Right a -> log $ test a
  --   Left e -> print e
