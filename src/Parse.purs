
module Parse where

import Prelude
import Global
import Grammar

import Control.Lazy (fix)
import Control.Apply ((*>), (<*))
import Control.Alt ((<|>))

import Data.Char (toString)
import Data.Array (many, some, head, tail, length, cons, singleton)
import Data.String (fromCharArray, joinWith, toCharArray)
import Data.Foldable (foldl)
import Data.List (toUnfoldable)
import Data.Either
import Data.Tuple
import Data.Maybe

import Text.Parsing.Parser
import Text.Parsing.Parser.String (skipSpaces, string, noneOf, char, oneOf)
import Text.Parsing.Parser.Token (letter, digit)
import Text.Parsing.Parser.Combinators (between, option, sepEndBy)
import Text.Parsing.Parser.Expr
import Text.Parsing.Parser.Pos

-- <expr> :=
--   <id>
--   <lit>
--   \ <id> -> <expr> | { <stat>;* }
--   <expr> <expr>
--   let { <id> = <expr>;* } in <expr>
--   if <expr> then <expr> else <expr>
--   case <expr> of { <lit> -> <expr>;* }
--   with <id> do { <expr> | <id> <- <expr>;* }

id :: Parser String String
id = do
  head <- oneOf $ toCharArray "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  tail <- some (oneOf $ toCharArray "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
  return $ toString head ++ fromCharArray tail

lit :: Parser String Expression
lit = Lit <$> choice [num , str , reg , bool , null , undef , ffi , arr , obj]

-- <lit> :=
--   <num>
--   <str>
--   <reg>
--   true | false
--   null
--   undefined
--   <ffi>
--   [ <expr>,* ]
--   { <id> : <expr>,* }

num :: Parser String Literal
num = do
  int <- fromCharArray <$> some digit
  dec <- option "" $ do
    char '.' >>= \dot -> (flip (++) ".") <<< fromCharArray <$> some digit
  return <<< LNum $ int ++ dec

str :: Parser String Literal
str = do
  q <- oneOf ['\'', '"']
  cont <- joinWith "" <$> many case q of
    '"' -> charWith "\\\"0nrvtbfxu"  "\\\"\0\n\r\v\t\b\f"
    '\'' -> charWith "\\'0nrvtbfxu"  "\\'\0\n\r\v\t\b\f"
    _ -> return ""
  char q
  return <<< LStr $ toString q ++ cont ++ toString q

reg :: Parser String Literal
reg = do
  q <- char '/'
  cont <- joinWith "" <$> many (charWith  "\\/.dDwWsStrnvf0^$bBntr*+?{}()xu" "\\/\0\n\r\v\t\b\f")
  char q
  flags <- fromCharArray <$> (many $ oneOf ['g', 'i', 'm', 'u', 'y'])
  return <<< LReg $ "/" ++ cont ++ "/" ++ flags

bool :: Parser String Literal
bool = try $ string "true" *> return (LBool true) <|> string "false" *> return (LBool false)

null :: Parser String Literal
null :: try $ string "null" *> return LNull

undef :: Parser String Literal
undef = try $ string "undefined" *> return LUndef

ffi :: Parser String Literal
ffi = do
  q <- char '`'
  cont <- joinWith "" <$> many (charWith "\\`"  "\\`")
  char q
  return <<< LFFI $ toString q ++ cont ++ toString q

arr :: Parser String Expression -> Parser String Literal
arr expr = do
  char '['
  vs <- sepBy (char ',') expr
  char ']'
  return <<< LArr <<< toUnfoldable $ vs

obj :: Parser String Expression -> Parser String Literal
obj expr = do
  char '{'
  kvs <- sepBy (char ',') $ do
    k <- id
    char ':'
    v <- expr
    return $ Tuple k vs
  char '}'
  return <<< LObj <<< toUnfoldable $ kvs

-- some usefull function here

charWith :: String -> String -> Parser String String
charWith e ne = fromCharArray <$> (noEscape ne <|> escape e)
  where escape chars = (\a b->[a,b]) <$> char '\\' <*> oneOf (toCharArray chars)
        noEscape chars = singleton <$> noneOf (toCharArray chars)

-- str :: Parser String String
-- str = do

-- atom :: Parser String String
-- atom = choice

-- module Parser where

-- import Prelude

-- import Prelude
-- import Control.Monad.Eff
-- import Control.Monad.Eff.Console


-- import Data.Array (many, some, head, tail, length)
-- import Data.String (fromCharArray)
-- import Data.Foldable (foldl)
-- import Data.List (toUnfoldable)
-- import Data.Either
-- import Data.Tuple
-- import Data.Maybe

-- import Text.Parsing.Parser
-- import Text.Parsing.Parser.String (skipSpaces, string, noneOf, char)
-- import Text.Parsing.Parser.Token (letter, digit)
-- import Text.Parsing.Parser.Combinators (between, option, sepEndBy)
-- import Text.Parsing.Parser.Expr
-- import Text.Parsing.Parser.Pos

-- import Control.Monad.State (get, state)

-- import AST

-- type S = { input :: String, result :: Either ParseError Position, consumed :: Boolean, position :: Position }

-- getPosition :: forall s m .(Monad m) => ParserT s m Position
-- getPosition = ParserT $ \(PState { input: s, position: pos }) ->
--   return { consumed: false, input: s, result: Right pos, position: pos }

-- testParser :: Parser String Position
-- testParser = letter >>= getPosition

-- parse = flip runParser (many testParser)

-- type SParser a = Parser String a

-- pmodule :: SParser Module
-- pmodule = Module <<< toUnfoldable <$> sepEndBy binding (string "\n")

-- binding :: SParser Binding
-- binding = do
--   name <- word
--   args <- many word
--   string "="
--   if length args > 0
--     then Binding name <<< uncurry args <$> expr
--     else Binding name <$> expr

-- expr :: SParser Expression
-- expr = fix \p -> buildExprParser ops (mkatom p)
--   where ops = [ [Infix (return App) AssocLeft] ]
--         mkatom p = val <|> parens p <|> mklam p

-- val :: SParser Expression
-- val = Val <$> word

-- mklam :: SParser Expression -> SParser Expression
-- mklam p = skipSpaces *> string "\\" *>
--           (uncurry <$> some word) >>= (\rest -> string "->" *> (rest <$> p))

-- uncurry :: Array String -> (Expression -> Expression)
-- uncurry xs = foldl (\l n -> l <<< Lam n) (Lam first) next
--   where
--     fromMaybe :: forall a. Maybe a -> a -> a
--     fromMaybe a b = case a of
--       Just a' -> a'
--       Nothing -> b
--     next = fromMaybe (tail xs) [] :: Array String
--     first = fromMaybe (head xs) "" :: String

-- word :: SParser String
-- word = skipSpaces *> (fromCharArray <$> some letter) <* skipSpaces

-- parens :: forall a. SParser a -> SParser a
-- parens = between (string "(") (string ")")

-- parse = flip runParser pmodule
