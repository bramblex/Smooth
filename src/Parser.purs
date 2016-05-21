module Parser where

import Prelude
import Control.Lazy (fix)
import Control.Apply ((*>), (<*))

import Lexer (lexer, TOKEN(..), PosToken(..))
import Grammar
-- import Indent (token, match, when)

import Text.Parsing.Parser
import Text.Parsing.Parser.Combinators
import Text.Parsing.Parser.Expr

import Data.List
import Data.Either
import Data.Tuple
import Data.Foldable (foldr)

type GrammarParser a = Parser (List PosToken) a

token :: GrammarParser TOKEN
token = ParserT $ \(PState {input:toks, position:pos}) ->
  return $ case toks of
    Cons (PosToken {pos:pos', tok:tok}) xs -> { consumed: true, input: xs, result: Right tok, position: pos'}
    _ -> parseFailed toks pos "expected token, met EOF"

match :: TOKEN -> GrammarParser TOKEN
match tok = when $ (==) tok

when :: (TOKEN -> Boolean) -> GrammarParser TOKEN
when f = try $ token >>= \tok' ->
  if f tok' then return tok' else fail "Can not match token"

-- Some Utils Functions

getCont :: TOKEN -> String
getCont tok = case tok of
  ID s -> s
  KEYWORD s -> s
  OPERATOR s -> s
  SYMBOL s -> s
  LITERAL s -> s
  INDENT i -> show i
  COMMENT s -> s

isID :: TOKEN -> Boolean
isID tok = case tok of
  ID _ -> true
  _ -> false

isOp :: TOKEN -> Boolean
isOp tok = case tok of
  OPERATOR _ -> true
  _ -> false

mkLam :: List String -> Expression -> Expression
mkLam (Cons arg args) body = ELam arg $ mkLam args body
mkLam Nil body = body

-- parse binding --

-- expr :: GrammarParser Expression
-- expr = fix \expr' -> do
--   where atom :: GrammarParser Expression
--         atom = choice $ map (($) expr')
--                [identifier, literal, array, object, lam, letin, ifelse, caseof, withdo]

-- dostat :: GrammarParser DoStatement
-- dostat = choice []

-- data ModuleStatement
--   = MBind (Tuple String Expression)
--   | MImport String (Array String)
--   | MImportAs String String
--   | MExport (Array String)
--   | MOpDefin OpDefine

expr :: GrammarParser Expression
expr = match (ID "expr") *> return (EID "expr")

-- mstat :: GrammarParser ModuleStatement
-- mstat = choice [mbind, mimp, mexp, mopdef]

mbind :: GrammarParser ModuleStatement
mbind = do
  n <- getCont <$> when isID
  as <- many $ getCont <$> when isID
  match $ SYMBOL "="
  e <- expr
  return $ MBind (Tuple n (mkLam as e))

-- mimp :: GrammarParser ModuleStatement
-- mimp = do
--   match $ KEYWORD "import"
--   ids <- <$> sepBy1 (getCont <$> when isID) (SYMBOL ".")
--   try (do
--           ) <|> return (MImport (joinWith "/" ids) )

-- data OpDefine
--   = OpInfixR Int String Expression
--   | OpInfixL Int String Expression
--   | OpPrefix Int String Expression
--   | OpPostFix Int String Expression
