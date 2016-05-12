
-- module Parser where

-- import Prelude

-- import Prelude
-- import Control.Monad.Eff
-- import Control.Monad.Eff.Console

-- import Control.Lazy (fix)

-- import Control.Apply ((*>), (<*))
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
-- import Control.Alt ((<|>))

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
