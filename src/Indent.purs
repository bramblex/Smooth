module Indent where

import Prelude

import Control.Monad.RWS
import Control.Monad.RWS.Trans
import Control.Monad.Writer.Trans
import Control.Monad.State.Trans
import Control.Monad.Trans (lift)

import Control.Alt ((<|>))
import Control.Lazy (fix)
import Control.Apply ((*>), (<*))

import Data.List
import Data.Maybe
import Data.Either
import Data.Tuple
import Data.String (joinWith)
import Data.Foldable (Foldable, foldl, foldr, any)
-- import Data.Generic

import Text.Parsing.Parser (ParserT(..), PState(..), parseFailed, runParserT, ParseError(..), fail)
import Text.Parsing.Parser.Combinators (try, option, between, choice, sepBy, skipMany, lookAhead)
import Text.Parsing.Parser.Pos (Position(..), initialPos)

import Lexer (TOKEN(..), PosToken(..), unPosToken, getPos, mkPosTok)

data IndentType = ExprBlock | StatBlock | ParenInner | SquareInner | BraceInner
instance eqIndentType :: Eq IndentType where
  eq ExprBlock ExprBlock = true
  eq StatBlock StatBlock = true
  eq ParenInner ParenInner = true
  eq SquareInner SquareInner = true
  eq BraceInner BraceInner = true
  eq _ _ = false

instance showIndentType :: Show IndentType where
  show i = case i of
    ExprBlock -> "ExprBlock"
    StatBlock -> "StatBlock"
    ParenInner -> "ParenInner"
    SquareInner -> "SquareInner"
    BraceInner -> "BraceInner"

data Indent = Indent IndentType Int
instance showIndent :: Show Indent where
  show (Indent t n) = "[" ++ show t ++ " " ++ show n ++ "]"

type IndentAnalyzer a = ParserT (List PosToken) (RWS Unit (List PosToken) (List Indent)) a

token :: IndentAnalyzer TOKEN
token = ParserT $ \(PState {input:toks, position:pos}) ->
  return $ case toks of
    Cons (PosToken {pos:pos', tok:tok}) xs -> { consumed: true, input: xs, result: Right tok, position: pos'}
    _ -> parseFailed toks pos "expected token, met EOF"

match :: TOKEN -> IndentAnalyzer TOKEN
match tok = when $ (==) tok

when :: (TOKEN -> Boolean) -> IndentAnalyzer TOKEN
when f = try $ token >>= \tok' ->
  if f tok' then return tok' else fail "Can not match token"

-- get last indent token
indent :: IndentAnalyzer TOKEN
indent = fromMaybe (INDENT 0) <<< last <$> some (skipMany (when isCom) *> when isInd <* skipMany (when isCom))
  where isCom tok = case tok of
          COMMENT _ -> true
          _ -> false
        isInd tok = case tok of
          INDENT _ -> true
          _ -> false

-- Inputs
input :: TOKEN -> IndentAnalyzer Unit
input tok = case tok of
  KEYWORD "where" -> startExprBlock tok
  KEYWORD "of" -> startExprBlock tok
  KEYWORD "do" -> startExprBlock tok
  SYMBOL "(" -> leftPart tok
  SYMBOL "[" -> leftPart tok
  SYMBOL "{" -> leftPart tok
  SYMBOL ")" -> rightPart tok
  SYMBOL "]" -> rightPart tok
  SYMBOL "}" -> rightPart tok
  SYMBOL "=" -> startExprOrStat tok
  INDENT n -> handleIndent n
  COMMENT _ -> return unit
  _ -> output tok

handleIndent :: Int -> IndentAnalyzer Unit
handleIndent n = do
  (Indent t i)<- fromMaybe (Indent ExprBlock 0) <$> top
  case compare n i of
    EQ -> output (SYMBOL ";;")
    GT -> if t == StatBlock
          then output (SYMBOL "{{") *> push (Indent StatBlock n)
               else return unit
    LT -> do
      output (SYMBOL "}}") *> pop
      (Indent _ i')  <- fromMaybe (Indent ExprBlock 0) <$> top
      case compare n i' of
        GT -> fail "Unexpected Indent"
        _ -> handleIndent n

startExprOrStat :: TOKEN -> IndentAnalyzer Unit
startExprOrStat tok = do
  output tok
  ahead <- token
  case ahead of
    INDENT n -> push (Indent StatBlock n) *> output (SYMBOL "{{")
    _ -> output ahead

leftPart :: TOKEN -> IndentAnalyzer Unit
leftPart tok = do
  (Indent _ n) <- fromMaybe (Indent ExprBlock 0) <$> top
  let t = case tok of
        SYMBOL "(" -> ParenInner
        SYMBOL "[" -> SquareInner
        SYMBOL "{" -> BraceInner
  push (Indent t n)
  output tok

rightPart :: TOKEN -> IndentAnalyzer Unit
rightPart tok = do
  rest <- top
  case rest of
    Just ind -> case ind of
      Indent ExprBlock _ -> pop *> output (SYMBOL "}}") *> rightPart tok
      Indent StatBlock _ -> pop *> output (SYMBOL "}}") *> rightPart tok
      Indent ParenInner _ -> if tok == (SYMBOL ")")
                             then pop *> output tok
                             else fail "Unexpected Token"
      Indent SquareInner _ -> if tok == (SYMBOL "]")
                              then pop *> output tok
                              else fail "Unexpected Token"
      Indent BraceInner _ -> if tok == (SYMBOL "}")
                             then pop *> output tok
                             else fail "Unexpected Token"
    Nothing -> output tok

startExprBlock :: TOKEN -> IndentAnalyzer Unit
startExprBlock tok = do
  output tok
  (Position {line:_, column:col}) <- getPos
  ahead <- token
  case ahead of
    INDENT n -> do
      if n > col - 1
        then push (Indent ExprBlock n) *> output (SYMBOL "{{")
        else fail "Unexpected Indent"
    _ -> do
      (Position {line:_, column:col}) <- getPos
      push (Indent ExprBlock (col -1)) *> outputs [SYMBOL "{{", ahead]

-- startStatBlock :: IndentAnalyzer Unit
-- startStatBlock = do

-- startExprBlock :: IndentAnalyzer Unit
-- startExprBlock = do
--   ahead <- token
--   case ahead of
--     INDENT n -> 

    -- where startExprBlock = do
    --         ahead <- token
    --         case ahead of
    --           INDENT n -> push (Indent ExprBlock n) *> outputs [tok, SYMBOL "{{"]
    --           _ -> do
    --             n <- (\(Position {line:_, column:col}) ->col-1) <$> getPos
    --             push (Indent ExprBlock n) *> outputs [tok, SYMBOL "{{", ahead]

top :: IndentAnalyzer (Maybe Indent)
top = lift $ gets head

push :: Indent  -> IndentAnalyzer Unit
push ind = lift $ modify $ Cons ind

pop :: IndentAnalyzer (Maybe Indent)
pop = lift $ gets head <* modify (fromMaybe (Nil:: List Indent) <<< tail)

-- Outputs
output :: TOKEN -> IndentAnalyzer Unit
output tok = outputs $ singleton tok

outputs :: forall f. (Foldable f) => f TOKEN -> IndentAnalyzer Unit
outputs toks = getPos >>= \pos-> lift $ tell (map (mkPosTok pos) $ fromFoldable toks)


analyse :: IndentAnalyzer Unit
analyse = fix $ \next ->
  ((indent <|> token) >>= \tok -> input tok *> next) <|> return unit

-- test :: List PosToken -> RWSResult (List Indent) (Either ParseError Unit) (List TOKEN)
-- test :: List PosToken -> String
-- test toks = show $ (toUnfoldable $ parseIndent toks)::Array PosToken
-- test :: Tuple (Either ParseError Unit) (List PosToken) -> String
-- test (Tuple err toks) = show err ++ "\n" ++ show ((toUnfoldable $ parseIndent toks)::Array PosToken)

-- test :: List PosToken -> String
-- test toks = show s ++ "\n" ++ show ((toUnfoldable w)::Array PosToken)
--   where rest = parseIndent toks
--         s = fst rest
--         w = snd rest

test :: List PosToken -> String
test toks = case parseIndent toks of
  RWSResult a b c -> show a ++ "\n" ++ show b ++ "\n"
                     ++ render ((toUnfoldable c)::Array PosToken)

render :: Array PosToken -> String
render toks = joinWith " " $ map render' toks
  where render' (PosToken {pos: _, tok: tok}) = render'' tok
        render'' tok = case tok of
          (ID s) -> s
          (KEYWORD s) -> s
          (OPERATOR s) -> s
          (SYMBOL s) -> s
          (LITERAL s) -> s
          _ -> ""

parseIndent :: List PosToken -> RWSResult (List Indent) (Either ParseError Unit) (List PosToken)
parseIndent toks = runRWS (runParserT (PState { input: toks, position: initialPos }) analyse) unit (Nil::List Indent)

  -- rest <- fstTok
  -- case rest of
  --   Nothing -> return unit
  --   Just tok -> next analyse'

-- fstTok :: IndentAnalyzer (Maybe TOKEN)
-- fstTok = (map unPosToken) <$> reader head

-- next :: IndentAnalyzer Unit -> IndentAnalyzer Unit
-- next analyse = local (fromMaybe (Nil::List PosToken) <<< tail) analyse

-- getPos :: forall s m. (Monad m) => ParserT s m Position
-- getPos = ParserT $ \(PState { input: s, position: pos }) ->
--   return { input: s, consumed: false, result: Right pos, position: pos }

-- analyse :: IndentAnalyzer Unit
-- analyse = do
-- get
