
module SMToken(SMToken(..), SMPosTok(..), tokenizer) where

import Prelude

import Control.Monad.RWS
import Control.Monad.RWS.Trans
import Control.Monad.Writer.Trans
import Control.Monad.State.Trans
import Control.Monad.Trans (lift)

import Control.Alt ((<|>))
import Control.Apply ((*>), (<*))

import Data.Maybe
import Data.Either
import Data.String (fromCharArray, joinWith, toCharArray)
import Data.Array (some, many, elemIndex, length, last, head, tail, singleton)
import Data.Char (toString)
import Data.Char.Unicode (isAlpha, isDigit, isHexDigit, isPrint)

import Data.Generic (class Generic, gShow, gEq)

import Text.Parsing.Parser (ParserT(..), PState(..), fail, runParser, runParserT, ParseError(..), Parser(..), parseFailed)
import Text.Parsing.Parser.Combinators (try, option, between, choice, sepBy, skipMany, lookAhead)
import Text.Parsing.Parser.String (skipSpaces, satisfy, string, eof, char, oneOf, anyChar)
import Text.Parsing.Parser.Pos (Position(..), initialPos)

data SMToken
  = ID String
  | KEY String
  | SYM String
  | OP String
  | LIT String
  | BLOCK_START
  | BLOCK_END
  | BLOCK_SEP
  | IND Int

derive instance genericSMToken :: Generic SMToken
instance showSMToken :: Show SMToken where show = gShow
instance eqSMToken :: Eq SMToken where eq = gEq

data Indent
  = Bottom
  | StatBlock Int
  | ExprBlock Int
  | InPair String Int

derive instance genericIndent :: Generic Indent
instance showIndent :: Show Indent where show = gShow

newtype SMPosTok = SMPosTok {pos::Position, tok::SMToken}

instance showSMPosTok :: Show SMPosTok where
  show (SMPosTok {pos:Position pos, tok:tok}) = showTok tok ++ "("++ show pos.line ++ "," ++ show pos.column ++")"
    where showTok tok = case tok of
            ID str-> "[ID " ++ str ++ "]"
            KEY str-> "[KEY " ++ str ++ "]"
            SYM str-> "[SYM " ++ str ++ "]"
            OP str-> "[OP " ++ str ++ "]"
            LIT str-> "[LIT " ++ str ++ "]"
            BLOCK_START-> "[BLOCK_START]"
            BLOCK_END-> "[BLOCK_END]"
            BLOCK_SEP-> "[BLOCK_SEP]"
            IND int -> "[IND " ++ show int++ "]"

type IndTokParser = ParserT String (RWS Unit (Array SMPosTok) (Array Indent))

canBeReduced :: String -> String -> Boolean
canBeReduced "(" ")" = true
canBeReduced "[" "]" = true
canBeReduced "{" "}" = true
canBeReduced _ _ = false

isLeft :: String -> Boolean
isLeft "(" = true
isLeft "[" = true
isLeft "{" = true
isLeft _ = false

-- Get Position --
getPos :: forall s m. (Monad m) => ParserT s m Position
getPos = ParserT $ \(PState { input: s, position: pos }) ->
  return { input: s, consumed: false, result: Right pos, position: pos }

mkTok :: Position -> SMToken -> SMPosTok
mkTok pos tok = SMPosTok {pos: pos, tok: tok}

withPos :: IndTokParser SMToken -> IndTokParser SMPosTok
withPos tok = mkTok <$> getPos <*> tok

-- Word Token --

reserved_words :: Array String
reserved_words = [ "let", "in", "where", "if", "then", "else"
                , "case", "of", "with", "do"
                , "switch", "return", "while", "break", "continue" , "pass"
                , "infixr", "infixl", "prefix", "postfix"
                , "import", "as", "export"
                , "true", "false", "null", "undefined", "default" ]

inArray :: forall a.(Eq a) => a -> Array a -> Boolean
inArray a as = case a `elemIndex` as of
  Just _ -> true
  Nothing -> false

word :: IndTokParser String
word = do
  head <- satisfy \c -> isAlpha c || c == '_'
  tail <- many $ satisfy \c -> isAlpha c || isDigit c || c == '_'
  return <<< fromCharArray $ [head] ++ tail

wordTok :: IndTokParser SMPosTok
wordTok = withPos $ do
  word_str <- word
  case word_str `inArray` reserved_words of
    false -> return $ ID word_str
    true -> case word_str `inArray` ["true", "false", "null", "undefined", "default"] of
      true -> return $ LIT word_str
      false -> return $ KEY word_str

-- Symbol Token --
reserved_symbol :: Array String
reserved_symbol  = [ "=", "->", "<-", ".", ":", "::", ",", "\\"]

isPairChar :: Char -> Boolean
isPairChar = flip inArray <<< toCharArray $ "()[]{}"

pair :: IndTokParser String
pair = toString <$> satisfy isPairChar

isSymChar :: Char -> Boolean
isSymChar = flip inArray <<< toCharArray $ "~!@$%^&*+|:<>?=,./\\"

symbol :: IndTokParser String
symbol = fromCharArray <$> many (satisfy isSymChar)

symTok :: IndTokParser SMPosTok
symTok = withPos $ (SYM <$> pair) <|> do
  sym_str <- symbol
  case sym_str `inArray` reserved_symbol of
    true -> return $ SYM sym_str
    false -> return $ OP sym_str

-- Lit Token --

hexNum :: IndTokParser String
hexNum = do
  try $ string "0x"
  hex_str <- fromCharArray <$> many (satisfy isHexDigit)
  return $ "0x" ++ hex_str

number :: IndTokParser String
number = do
  int <- some (satisfy isDigit)
  dec <- option [] do
    point <- char '.'
    (++) ['.'] <$> some (satisfy isDigit)
  return <<< fromCharArray $ int ++ dec

surround :: forall m.(Monad m) => Char -> ParserT String m String
surround c = between (char c) (char c) (joinWith "" <$> many contents)
  where contents = try (string ("\\" ++ toString c))
                   <|> (toString <$> satisfy (\c' -> c /= c' && isPrint c'))

surround' :: forall m.(Monad m) => Char -> ParserT String m String
surround' c = mkSurround <$> surround c
  where cStr = toString c
        mkSurround str = cStr ++ str ++ cStr

_string :: IndTokParser String
_string = surround' '\'' <|> surround '"'

regexp :: IndTokParser String
regexp = do
  exp <- surround' '/'
  flags <- fromCharArray <$> option [] (many $ oneOf ['g', 'i', 'm', 'u', 'y'])
  return $ exp ++ flags

raw :: IndTokParser String
raw = surround '`'

litTok :: IndTokParser SMPosTok
litTok = withPos $ LIT <$> choice [number, hexNum, _string, regexp, raw]

-- Indent Token --

sof :: forall m. (Monad m) => ParserT String m Unit
sof = ParserT $ \(PState { input: s, position: pos }) ->
  return if pos == initialPos
         then { input: s, consumed: false, result: Right unit, position: pos }
         else parseFailed s pos "Expected SOF"

space :: IndTokParser Char
space = satisfy \c -> c == ' ' || c == '\t'

eol :: forall m. (Monad m) => ParserT String m Unit
eol = (try (string "\r\n") <|> string "\r" <|> string "\n") *> return unit

comment :: IndTokParser Unit
comment = do
  char '#'
  many $ satisfy \c -> isPrint c && c /= '\r' && c /= '\n'
  return unit

indent :: IndTokParser SMPosTok
indent = do
  i <- fromMaybe 0 <<< last <$> some indent'
  withPos (return $ IND i)
    where indent' = (eol <|> sof) *> (length <$> many space) <* skipMany comment

-- Tokenizer --
nextTok :: IndTokParser SMPosTok
nextTok = skipMany space *> (wordTok <|> symTok <|> litTok <|> indent)

-- Indent Analyse --
top :: IndTokParser Indent
top = lift $ fromMaybe Bottom <$> gets head

topInd :: IndTokParser Int
topInd = indToInt <$> top
  where indToInt ind = case ind of
          Bottom -> 0
          StatBlock n -> n
          ExprBlock n -> n
          InPair _ n -> n

push :: Indent  -> IndTokParser Unit
push ind = lift $ modify $ (++) [ind]

pop :: IndTokParser Unit
pop = lift $ modify (fromMaybe ([]:: Array Indent) <<< tail)

-- Outputs
output :: Array SMPosTok -> IndTokParser Unit
output toks = lift $ tell toks

-- Inputs
input :: SMPosTok -> IndTokParser Unit
input pos_tok@(SMPosTok {pos: _, tok: tok}) = case tok of
  KEY "where" -> whereBlock pos_tok
  KEY "of" -> exprBlock pos_tok
  KEY "do" -> exprBlock pos_tok
  SYM "=" -> exprOrStatBlock pos_tok
  SYM sym -> case sym `inArray` ["(", ")", "[", "]", "{", "}"] of
    true -> handlePair pos_tok
    false -> output [pos_tok]
  IND ind ->  handleIndent ind
  _ -> output [pos_tok]

getTokInd :: SMPosTok -> Int
getTokInd (SMPosTok {pos: Position {line:_, column:col}, tok: _}) = col - 1

getTokPos :: SMPosTok -> Position
getTokPos (SMPosTok {pos: pos, tok:_}) = pos

fromPosTok :: SMPosTok -> SMToken
fromPosTok (SMPosTok {pos: _, tok: tok}) = tok

whereBlock :: SMPosTok -> IndTokParser Unit
whereBlock pos_tok = do
  ahead <- nextTok
  case fromPosTok ahead of
    IND n -> do
      if n > getTokInd ahead
        then push (ExprBlock n) *> output [pos_tok, mkTok (getTokPos ahead) BLOCK_START]
        else fail "Unexpected Indent"
    _ -> do
      push (ExprBlock (getTokInd ahead)) *> output [pos_tok, mkTok (getTokPos ahead) BLOCK_START, ahead]

exprBlock :: SMPosTok -> IndTokParser Unit
exprBlock pos_tok = do
  ahead <- nextTok
  case fromPosTok ahead of
    IND n -> do
      top_ind <- topInd
      if n > top_ind
        then push (ExprBlock n) *> output [pos_tok, mkTok (getTokPos ahead) BLOCK_START]
        else fail "Unexpected Indent"
    _ -> do
      push (ExprBlock (getTokInd ahead)) *> output [pos_tok, mkTok (getTokPos ahead) BLOCK_START, ahead]

exprOrStatBlock :: SMPosTok -> IndTokParser Unit
exprOrStatBlock pos_tok = do
  ahead <- nextTok
  case fromPosTok ahead of
    IND n -> push (StatBlock n) *> output [pos_tok, mkTok (getTokPos ahead) BLOCK_START]
    _ -> output [pos_tok, ahead]

handlePair :: SMPosTok -> IndTokParser Unit
handlePair pos_tok@(SMPosTok {pos:pos, tok:tok}) = do
  case tok of
    SYM pair -> case isLeft pair of
      true -> topInd >>= \top_ind ->
        push (InPair pair top_ind) *> output [pos_tok]
      false -> output [pos_tok] *> handleRightPair pair
    _ -> fail "Unexpected Token"

  where handleRightPair :: String -> IndTokParser Unit
        handleRightPair right_pair = do
          pos <- getPos
          top_ind <- top
          case top_ind of
             InPair left_pair _ ->
               if left_pair `canBeReduced` right_pair
               then pop
               else fail "Unexpected Pair"
             StatBlock _ ->
               pop *> output [mkTok pos BLOCK_END] *> handleRightPair right_pair
             ExprBlock _ ->
               pop *> output [mkTok pos BLOCK_END] *> handleRightPair right_pair
             _ -> fail "Unexpected Indent"

handleIndent :: Int -> IndTokParser Unit
handleIndent ind = handleIndent' ind true
  where handleIndent' :: Int -> Boolean -> IndTokParser Unit
        handleIndent' ind is_top = do
          pos <- getPos
          top_ind <- top
          case top_ind of
            Bottom -> if ind > 0
                      then return unit
                      else output [mkTok pos BLOCK_SEP]
            ExprBlock last_ind -> case ind `compare` last_ind of
              EQ -> output [mkTok pos BLOCK_SEP]
              GT -> if is_top
                    then return unit
                    else fail "Unexpected Indent"
              LT -> output [mkTok pos BLOCK_END]
                    *> pop *> handleIndent' ind false
            StatBlock last_ind -> case ind `compare` last_ind of
              EQ -> output [mkTok pos BLOCK_SEP]
              GT -> if is_top
                    then output [mkTok pos BLOCK_START]
                    else fail "Unexpected Indent"
              LT -> output [mkTok pos BLOCK_END]
                    *> pop *> handleIndent' ind false
            _ -> fail "Unexpected Indent"

-- tokenizer --
tokenizer :: String -> Either ParseError (Array SMPosTok)
tokenizer code = handle $ runRWS (runParserT (PState {input: code', position: initialPos }) analyse) unit ([]::Array Indent)
  where code' = "\n" ++ code ++ "\n"
        analyse = (nextTok >>= \tok -> input tok *> analyse)
                  <|> eof <|> fail "Tokenizer Error"
        handle (RWSResult _ (Left err) _) = Left err
        handle (RWSResult _ (Right _) ret) = Right ret
