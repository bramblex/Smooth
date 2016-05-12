
-- module Lexer (runlexer, lexer, Token(..)) where

-- import Prelude
-- import Global

-- import Data.Array
-- import Data.String
-- import Data.Char
-- import Data.Maybe
-- import Data.Either

-- import Text.Parsing.Parser
-- import Text.Parsing.Parser.Token
-- import Text.Parsing.Parser.String
-- import Text.Parsing.Parser.Pos
-- import Text.Parsing.Parser.Combinators

-- import Control.Apply
-- import Control.Alt ((<|>))

-- data Token = IDToken String Position
--            | KeyToken String Position
--            | LamToken (Array String) Position

--            | SymToken String Position
--            | OpToken String Position

--            | NumToken Number Position
--            | StrToken String Position
--            | RegToken String Position

--            | BoolToken Boolean Position
--            | NullToken Position
--            | UndefToken Position

--            | IndentToken Int Position

-- instance showToken :: Show Token where
--   show (IDToken s (Position p)) =
--     "[IDToken: "++show s++" ("++show p.line++","++show p.column++")]"
--   show (LamToken s (Position p)) =
--     "[LamToken: "++show s++" ("++show p.line++","++show p.column++")]"
--   show (KeyToken s (Position p)) =
--     "[KeyToken: "++show s++" ("++show p.line++","++show p.column++")]"
--   show (SymToken s (Position p)) =
--     "[SymToken: "++show s++" ("++show p.line++","++show p.column++")]"
--   show (OpToken s (Position p)) =
--     "[OpToken: "++show s++" ("++show p.line++","++show p.column++")]"
--   show (NumToken n (Position p)) =
--     "[NumToken: "++show n++" ("++show p.line++","++show p.column++")]"
--   show (StrToken s (Position p)) =
--     "[StrToken: "++ s ++" ("++show p.line++","++show p.column++")]"
--   show (RegToken s (Position p)) =
--     "[RegToken: "++show s++" ("++show p.line++","++show p.column++")]"
--   show (BoolToken b (Position p)) =
--     "[BoolToken: "++show b++" ("++show p.line++","++show p.column++")]"
--   show (NullToken (Position p)) =
--     "[NullToken: "++"("++show p.line++","++show p.column++")]"
--   show (UndefToken (Position p)) =
--     "[UndefToken: "++"("++show p.line++","++show p.column++")]"
--   show (IndentToken n (Position p)) =
--     "[IndentToken: "++show n++" ("++show p.line++","++show p.column++")]"

-- reserved_words :: Array String
-- reserved_words = ["let","in"
--                  , "where"
--                  , "return"
--                  , "if", "then", "else"
--                  , "while"
--                  , "ffi"
--                  , "with" , "do"
--                  , "infixr", "infixl", "postfix", "subfix"
--                  , "import", "as" , "hiding"
--                  , "export"]

-- isReservedWord :: String -> Boolean
-- isReservedWord str = case elemIndex str reserved_words of
--   Just _ -> true
--   Nothing -> false

-- getPosition :: forall s m .(Monad m) => ParserT s m Position
-- getPosition = ParserT $ \(PState { input: s, position: pos }) ->
--   return { consumed: false, input: s, result: Right pos, position: pos }


-- word_head_chars :: Array Char
-- word_head_chars =
--   toCharArray "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

-- word_tail_chars :: Array Char
-- word_tail_chars = word_head_chars ++ toCharArray "1234567890"

-- getWord :: Parser String String
-- getWord = do
--   head <- fromCharArray <$> (some $ oneOf word_head_chars)
--   tail <- fromCharArray <$> (many $ oneOf word_tail_chars)
--   return $ head ++ tail

-- getWordToken:: Parser String Token
-- getWordToken = do
--   pos <- getPosition
--   word <- getWord
--   if isReservedWord word
--     then return $ KeyToken word pos
--     else return $
--          case word of
--            "true" -> BoolToken true pos
--            "false" -> BoolToken false pos
--            "null" -> NullToken pos
--            "undefined" -> UndefToken pos
--            _ -> IDToken word pos

-- symbol_chars :: Array Char
-- symbol_chars =
--   toCharArray "{[()]}"

-- getSymbolToken:: Parser String Token
-- getSymbolToken = do
--   pos <- getPosition
--   flip SymToken pos <<< toString <$> oneOf symbol_chars

-- operator_chars :: Array Char
-- operator_chars =
--   toCharArray "~!@$%^&*+-=|:<>./?"

-- reserved_operators:: Array String
-- reserved_operators = ["->", "<-", "="]

-- isReservedOperator :: String -> Boolean
-- isReservedOperator str = case elemIndex str reserved_operators of
--   Just _ -> true
--   Nothing -> false

-- getOperatorToken:: Parser String Token
-- getOperatorToken = do
--   pos <- getPosition
--   chars <- fromCharArray <$> (some $ oneOf operator_chars)
--   if isReservedOperator chars
--     then return $ SymToken chars pos
--     else return $ OpToken chars pos

-- getNumber:: Parser String String
-- getNumber = do
--   fromCharArray <$> some digit

-- getNumberToken:: Parser String Token
-- getNumberToken = do
--   pos <- getPosition
--   int <- getNumber
--   dec <- option "" $ string "." >>= \_ -> getNumber
--   return $ NumToken (readFloat $ int ++ "." ++ dec) pos

-- escape :: Parser String String
-- escape = do
--   d <- char '\\'
--   c <- oneOf $ toCharArray "\\\"0nrvtbfxu"
--   return $ fromCharArray [d, c]

-- nonEscape :: Parser String Char
-- nonEscape = noneOf $ toCharArray "\\\"\0\n\r\v\t\b\f"

-- character :: Parser String String
-- character = (toString <$> nonEscape) <|> escape

-- getStringToken :: Parser String Token
-- getStringToken = do
--   pos <- getPosition
--   char '"'
--   strs <- many character
--   char '"'
--   return $ flip StrToken pos $ "\"" ++ joinWith "" strs ++ "\""

-- regEscape :: Parser String String
-- regEscape = do
--   d <- char '\\'
--   c <- oneOf $ toCharArray "\\/.dDwWsStrnvf0^$bBntr*+?{}()xu"
--   return $ fromCharArray [d, c]

-- regNonEscape :: Parser String Char
-- regNonEscape = noneOf $ toCharArray "\\/\0\n\r\v\t\b\f"

-- regCharacter :: Parser String String
-- regCharacter = (toString <$> regNonEscape) <|> regEscape

-- getRegToken :: Parser String Token
-- getRegToken = do
--   pos <- getPosition
--   char '/'
--   strs <- some regCharacter
--   char '/'
--   flags <- many (oneOf ['g', 'i', 'm', 'u', 'y'])
--   return $ flip StrToken pos $ "/" ++ joinWith "" strs ++ "/" ++ joinWith "" (map toString flags)

-- eol :: Parser String String
-- eol = string "\n" <|> string "\r" <|> string "\r\n"

-- getIndent :: Parser String Int
-- getIndent = Data.Array.length
--             <$> (eol *> ((many $ char ' ') <|> (many $ char '\t')))

-- getIndentToken :: Parser String Token
-- getIndentToken = do
--   Just i <- last <$> some getIndent
--   pos <- getPosition
--   return $ IndentToken i pos

-- getLamToken :: Parser String Token
-- getLamToken = do
--   pos <- getPosition
--   char '\\'
--   flip LamToken pos <$> many (getWord <* skipSpacesTabs)

-- skipSpacesTabs :: Parser String Unit
-- skipSpacesTabs = (many $ satisfy \c -> c == ' ' || c == '\t') *> return unit

-- lexer :: Parser String (Array Token)
-- lexer = many $ choice <<< map (<* skipSpacesTabs)
--         $ [ getLamToken
--           , getIndentToken
--           , getRegToken
--           , getStringToken
--           , getNumberToken
--           , getOperatorToken
--           , getSymbolToken
--           , getWordToken ]

-- runlexer :: String -> Either ParseError (Array Token)
-- runlexer = flip runParser lexer
