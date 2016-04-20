
module Parser where

import Prelude
import Control.Monad.Eff
import Control.Monad.Eff.Console

import Control.Lazy (fix)

import Control.Apply ((*>), (<*))
import Data.Array (many, some, head, tail, length)
import Data.String (fromCharArray)
import Data.Foldable (foldl)
import Data.List (toUnfoldable)

import Data.Maybe

import Text.Parsing.Parser (Parser(..), runParser, ParseError())
import Text.Parsing.Parser.String (skipSpaces, string, noneOf)
import Text.Parsing.Parser.Token (letter, digit)
import Text.Parsing.Parser.Combinators (between, option, sepEndBy)
import Text.Parsing.Parser.Expr
import Control.Alt ((<|>))

import AST

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
