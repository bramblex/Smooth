
module Parser where

import Prelude
import Control.Monad.Eff
import Control.Monad.Eff.Console

import Control.Lazy (fix)

import Control.Apply ((*>), (<*))
import Data.Array (many, some, head, tail)
import Data.String (fromCharArray)
import Data.Foldable (foldl)

import Text.Parsing.Parser (Parser(..), runParser, ParseError())
import Text.Parsing.Parser.String (skipSpaces, string, noneOf)
import Text.Parsing.Parser.Token (letter, digit)
import Text.Parsing.Parser.Combinators (between, option )
import Text.Parsing.Parser.Expr
import Control.Alt ((<|>))

import AST

type SParser a = Parser String a

expr :: SParser Expression
expr = fix \p -> buildExprParser ops (mkatom p)
  where ops = [ [Infix (return App) AssocLeft] ]
        mkatom p = val <|> parens p <|> mklam p

val :: SParser Expression
val = Val <$> word

mklam :: SParser Expression -> SParser Expression
mklam p = skipSpaces *> string "\\" *> (Lam <$> word) >>= (\rest -> string "->" *> (rest <$> p))
  -- where foldl1 = aaa
  --       uncurry = foldl1

word :: SParser String
word = skipSpaces *> (fromCharArray <$> some letter) <* skipSpaces

parens :: forall a. SParser a -> SParser a
parens = between (string "(") (string ")")

parse = flip runParser expr

-- data Expr = App Expr Expr
--           | Lam String Expr
--           | Val String

-- instance showExpr :: Show Expr where
--   show (App l r) = "(App "++ show l ++ " " ++ show r ++ ")"
--   show (Lam s e) = "(Lam " ++ show s ++ " " ++ show e ++ ")"
--   show (Val s) = show s


-- term :: Parser String Expr
-- term = fix \p -> buildExprParser ops (mkatom p)
--   where ops = [ [Infix (return App) AssocLeft] ]
--         mkatom p = val <|> parens p <|> mklam p <|>

-- mklam :: Parser String Expr -> Parser String Expr
-- mklam p = do
--   skipSpaces
--   string "\\"
--   name <- word
--   string "->"
--   expr <- p
--   return (Lam name expr)


-- val :: Parser String Expr
-- val = Val <$> word

-- parens :: forall a. Parser String a -> Parser String a
-- parens = between (string "(") (string ")")

-- parse = flip runParser term




-- parse str = show $ runParser str term

-- data AnalyticTree = LamAnalyticNode (Array String) ExprAnalyticNode
--                   | ExprAnalyticNode String

-- data Atom = LamAtom String | ValAtom String

-- valatom :: Parser String Atom
-- valatom = skipSpaces *> (fromCharArray <$> some letter) <* skipSpaces

-- data Expr = App Expr Expr
--           | Lam String Expr
--           | Val String

-- term :: Parser String Expr
-- term = buildExprParser ops atom
--   where ops = [[Infix (return App) AssocLeft]]
--         atom =

-- data Expr = App Expr Expr
--           | Lam String Expr
--           | Val String


-- lamatom :: Parser String (Array String)
-- lamatom = skipSpaces *> string "\\" *> (many valatom) <* string "->"


-- instance showExpr :: Show Expr where
--   show (App l r) = "(App "++ show l ++ " " ++ show r ++ ")"
  -- show (Lam s e) = "(Lam " ++ show s ++ " " ++ show e ++ ")"
  -- show (Val s) = show s

-- factor :: Parser String Expr
-- factor = parens term

-- term :: Parser String Expr
-- term = buildExprParser ops factor
--   where ops = [[Infix (return App) AssocLeft]]
              -- ,[Infix (string "->" *> )]]


-- term :: Parser String Expr
-- parens :: Parser String Expr -> Parser String Expr
-- parens = between (string "(") (string ")")

-- parse str = show $ runParser str term

-- data Pattern = Empty
--              | Literal Char
--              | Concatenate Pattern Pattern
--              | Choose Pattern Pattern
--              | Repeat Pattern

-- term :: Parser Pattern
-- term = buildExprParser ops atom
--     where ops = [
--                     [Postfix (Repeat <* string "*")],
--                     [Infix (return Concatenate) AssocRight],
--                     [Infix (Choose <* string '|') AssocRight]
--                 ]
--           atom = (Literal <$> lit)
--                  <|> (parens term)
--                  <|> (Empty <* eps)

-- lit = noneOf "ε|()"
-- parens = between (string "(") (string ")")
-- eps = string "ε"

-- module Data.Parse
--   ( parseAll
--   , parseDefinition
--   , parseSyntax
--   , parseEither
--   , unsafeParse
--   , formatParseError
--   ) where

-- import Prelude

-- import Text.Parsing.Parser
-- import Text.Parsing.Parser.Combinators
-- import Text.Parsing.Parser.String
-- import Text.Parsing.Parser.Pos

-- import Control.Lazy (fix)
-- import Control.Alt ((<|>))
-- import Control.Apply ((*>), (<*))

-- import Data.Array (some, many, replicate, length)
-- import Data.Foldable (foldl, elem)
-- import Data.String (fromCharArray)
-- import Data.Either
-- import Data.Either.Unsafe (fromRight)

-- import Data.Syntax
-- import Data.Name

-- token :: forall a. Parser String a -> Parser String a
-- token p = p <* skipSpaces

-- parseAll :: forall a. Parser String a -> String -> Either ParseError a
-- parseAll p s = runParser s (skipSpaces *> p <* eof)

-- unsafeParse :: forall a. Parser String a -> String -> a
-- unsafeParse p s = fromRight (parseAll p s)

-- formatParseError :: String -> ParseError -> String
-- formatParseError text (ParseError { message: message, position: Position { column: column } }) =
--   "Parse error: " <> message <> " at column " <> show column <> "\n" <> text <> "\n" <> caretLine
--  where
--   caretLine = fromCharArray (replicate (column - 1) ' ') <> "^"

-- caretForParseError :: ParseError -> String
-- caretForParseError (ParseError { position: Position { column: column } }) =
--   fromCharArray (replicate (column - 1) ' ') <> "^"

-- parseEither :: Parser String (Either Definition Syntax)
-- parseEither = try (Left <$> parseDefinition) <|> (Right <$> parseSyntax)

-- parseDefinition :: Parser String Definition
-- parseDefinition = {name:_, syntax:_}
--   <$> parseName
--   <*> (token (string "=") *> parseSyntax)

-- parseSyntax :: Parser String Syntax
-- parseSyntax = fix parseApply
--  where
--   parseApply p = do
--     first <- parseAtom
--     rest <- many parseAtom
--     case rest of
--       [] -> return first
--       _  -> return (foldl Apply first rest)
--    where
--     parseAtom :: Parser String Syntax
--     parseAtom = parseLambda <|> parseVar <|> parens p

--     parseLambda :: Parser String Syntax
--     parseLambda = Lambda
--       <$> (token (string "\\" <|> string "λ") *> parseName)
--       <*> (token (string ".") *> p)

-- parens :: forall a. Parser String a -> Parser String a
-- parens = between (token (string "(")) (token (string ")"))

-- parseVar :: Parser String Syntax
-- parseVar = Var <$> parseName

-- parseName :: Parser String Name
-- parseName = token do
--   first <- satisfy firstChar
--   body <- many (satisfy bodyChar)
--   question <- string "?" <|> pure ""
--   subscript <- parsePrimes <|> parseSubscript
--   return (name (fromCharArray ([first] <> body) <> question) subscript)

-- parsePrimes :: Parser String Int
-- parsePrimes = length <$> some (satisfy (== '\''))

-- parseSubscript :: Parser String Int
-- parseSubscript = subscriptToInt <<< fromCharArray <$> many (satisfy isSubscriptChar)

-- firstChar :: Char -> Boolean
-- firstChar c = isLower c || c == '_'

-- bodyChar :: Char -> Boolean
-- bodyChar c = isLower c || isDigit c || c == '-'

-- isDigit :: Char -> Boolean
-- isDigit c = '0' <= c && c <= '9'

-- isLower :: Char -> Boolean
-- isLower c = 'a' <= c && c <= 'z'
