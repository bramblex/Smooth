
module SMParser(parser) where

import Prelude
import Global

import Text.Parsing.Parser
import Text.Parsing.Parser.Combinators
import Text.Parsing.Parser.Expr
import Text.Parsing.Parser.Pos

import Control.Monad.Trans
import Control.Monad.State

import Control.Apply ((*>), (<*))
import Control.Lazy (fix)
import Control.Alt ((<|>))

import Data.Tuple
import Data.Either
import Data.Array
import Data.String (joinWith)
-- import Data.Array.Unsafe (head)
import Data.Maybe
import Data.Foldable
import Data.Int (fromString)

-- import
-- import Text.Parsing.Parser.Expr
-- import Te

import SMAST
import SMToken
import SMPrelude
-- import SMModule

newtype OpState = OpState {optable:: Array (Array SMOpDef)}

type SMOperatorTable = OperatorTable (State OpState) (Array SMPosTok) SMExpression
type SMParser = ParserT (Array SMPosTok) (State OpState)

token :: SMParser SMToken
token = ParserT $ \(PState { input: toks, position: pos }) ->
  return $ case head toks of
    Nothing -> parseFailed toks pos "Expected Token, Met EOF"
    Just (SMPosTok {tok:tok, pos:pos}) ->
      { consumed: true
      , input: fromMaybe [] $ tail toks
      , result: Right tok
      , position: pos }

when :: (SMToken -> Boolean) -> SMParser SMToken
when f = try $ token >>= \tok ->
  case f tok of
    true -> return tok
    false -> fail "Unexpected Token"

match :: SMToken -> SMParser SMToken
match tok = when ((==) tok)


-- matchKey :: String -> SMParser SMToken
-- matchKey key = match $ KEY key

-- matchSym :: String -> SMParser SMToken
-- matchSym sym = match $ SYM sym

-- pushExports :: Array String -> SMParser Unit
-- pushExports exports' = lift $ modify \(SMModule{optable: optable, exports: exports, bindings: bindings}) ->
--   SMModule{optable: optable, exports: exports ++ exports', bindings: bindings}

-- pushOpDef :: String -> Int -> String -> String -> SMParser Unit
-- pushOpDef _type precedence op alias =
--   case precedence >= 0 && precedence <= 9 of
--     false -> fail "Operator Precedence Must Between 0 to 9"
--     true -> lift $ modify \(SMModule{optable: optable, exports: exports, bindings: bindings}) ->
--       SMModule {optable: handle optable, exports: exports, bindings: bindings}
--       where handle optable' = fromMaybe optable'(
--               modifyAt precedence (flip (++) [SMOpDef {_type: _type, op: op, alias: alias}]) optable')

-- push :: Tuple String SMExpression -> SMParser Unit
-- push binding = lift $ modify \(SMModule{optable: optable, exports: exports, bindings: bindings}) ->
--   SMModule{optable: optable, exports: exports, bindings: bindings ++ [binding]}

pushOpDef :: String -> Int -> String -> String -> SMParser Unit
pushOpDef _type precedence op alias =
  case precedence >= 0 && precedence <= 9 of
    false -> fail "Operator Precedence Must Between 0 to 9"
    true -> lift $ modify \(OpState {optable: optable}) -> OpState {optable: handle optable}
      where handle optable' = fromMaybe optable'(
              modifyAt precedence (flip (++) [SMOpDef {_type: _type, op: op, alias: alias}]) optable')

getSMOpTable :: SMParser SMOperatorTable
getSMOpTable = lift $ gets \(OpState {optable:optable}) -> map (map defOp) optable
    where defOp (SMOpDef {_type:_type, op:op, alias:alias}) = case _type of
            "infixr" -> Infix (match (OP op) *> return (binary alias)) AssocRight
            "infixl" -> Infix (match (OP op) *> return (binary alias)) AssocLeft
            "postfix" -> Postfix (match (OP op) *> return (unify alias))
            "prefix" -> Prefix (match (OP op) *> return (unify alias))
          binary name left right = SMExprApp (SMExprApp (SMExprID name) left) right
          unify name expr = SMExprApp (SMExprID name) expr

-- Parse Bindings
matchId :: SMParser String
matchId = (\(ID str) -> str) <$> when isIdTok
  where isIdTok :: SMToken -> Boolean
        isIdTok tok = case tok of
          ID _ -> true
          _ -> false

matchOp :: SMParser String
matchOp = (\(OP str) -> str) <$> when isOp
  where isOp tok = case tok of
          OP _ -> true
          _ -> false

-- ParserExprs

type SMParserExpr = SMParser SMExpression
type SMParserExprAtom = SMParserExpr -> SMParserExpr

smBlock :: forall a. SMParser a -> SMParser (Array a)
smBlock p = between (match $ BLOCK_START) (match $ BLOCK_END) (many p)

smBinding :: SMParserExpr -> SMParser (Tuple String SMExpression)
smBinding smExpr = do
  name <- matchId
  args <- many matchId
  match $ SYM "="
  expr <- smExpr
  (do match $ KEY "where"
      body <- smBlock $ smBinding smExpr
      return $ Tuple name (mkLam args (SMExprWhere expr body))
    ) <|> (return $ Tuple name (mkLam args expr))
  where mkLam = flip $ foldr (\l r-> SMExprLam l r)

smExpr :: SMParserExpr
smExpr = do
  smOptable <- getSMOpTable
  fix $ \smExpr ->
    buildExprParser (pre ++ smOptable) (atom smExpr)
  where

    getAttr :: SMParser (SMExpression -> SMExpression)
    getAttr = do
      match $ SYM "."
      attr <- matchId
      return $ flip SMExprAttr attr

    pre = [[Infix (return SMExprApp) AssocLeft, Postfix getAttr]]
    atom smExpr = choice $ map (flip ($) smExpr)
                  [smExprId, smExprLit, smExprArr, smExprObj
                  , smExprStat, smExprLam , smExprLetIn
                  , smExprIfElse, smExprCaseOf , smExprWithDo
                  , between (match $ SYM "(") (match $ SYM ")")]

smExprId :: SMParserExprAtom
smExprId smExpr = SMExprID <$> matchId

smExprLit :: SMParserExprAtom
smExprLit smExpr = SMExprLit <<< (\(LIT str) -> str) <$> when isLitTok
  where isLitTok tok = case tok of
          LIT _ -> true
          _ -> false

smExprArr :: SMParserExprAtom
smExprArr smExpr = between (match $ SYM "[") (match $ SYM "]") (arrCont <|> return (SMExprArr []))
  where arrCont :: SMParserExpr
        arrCont = do
          a <- smExpr
          as <- many $ do
            match $ SYM ","
            smExpr
          return <<< SMExprArr $ [a] ++ as

smExprObj :: SMParserExprAtom
smExprObj smExpr = between (match $ SYM "{") (match $ SYM "}") (objCont <|> return (SMExprObj []))
  where keyValue = Tuple <$> matchId <*> ((match $ SYM ":") *> smExpr)
        objCont :: SMParserExpr
        objCont = do
          a <- keyValue
          as <- many $ do
            match $ SYM ","
            keyValue
          return <<< SMExprObj $ [a] ++ as

smExprStat :: SMParserExprAtom
smExprStat smExpr = SMExprStat <$> smBlock smStat

smExprLam :: SMParserExprAtom
smExprLam smExpr = do
  match $ SYM "\\"
  args <- some matchId
  match $ SYM "->"
  expr <- smExpr
  return $ foldr (\l r-> SMExprLam l r) expr args

smExprLetIn :: SMParserExprAtom
smExprLetIn smExpr = do
  match $ KEY "let"
  binding <- smBinding smExpr
  match $ KEY "in"
  expr <- smExpr
  return $ SMExprLetIn binding expr

smExprIfElse :: SMParserExprAtom
smExprIfElse smExpr = do
  match $ KEY "if"
  condition <- smExpr
  match $ KEY "then"
  expr1 <- smExpr
  match $ KEY "else"
  expr2 <- smExpr
  return $ SMExprIfElse condition expr1 expr2

smExprCaseOf :: SMParserExprAtom
smExprCaseOf smExpr = do
  match $ KEY "case"
  condition <- smExpr
  match $ KEY "of"
  body <- smBlock caseBody
  return $ SMExprCaseOf condition body
  where caseBody = do
          value <- smExprLit smExpr
          match $ SYM "->"
          expr <- smExpr
          return $ Tuple value expr

smExprWithDo :: SMParserExprAtom
smExprWithDo smExpr = do
  match $ KEY "with"
  expr <- smExprId smExpr
  match $ KEY "do"
  body <- smBlock (doLetIn <|> try doAssgin <|> doCall)
  case last body of
    Just (SMDoStatCall _) -> return $ SMExprWithDo expr body
    _ -> fail "The last statement in do block must be an expressio!"
  where
    doLetIn = do
      match $ KEY "let"
      SMDoStatLet <$> smBinding smExpr
    doAssgin = do
      name <- matchId
      match $ SYM "<-"
      expr <- smExpr
      return $ SMDoStatAssign (Tuple name expr)
    doCall = SMDoStatCall <$> smExpr

-- Parse Statements

type SMParserStat = SMParser SMStatement
type SMParserStatAtom = SMParserStat -> SMParserStat

smStat :: SMParserStat
smStat = fix $ \smExpr -> return SMStatPass

smStatLet :: SMParserStatAtom
smStatLet smStat = do
  match $ KEY "let"
  SMStatLet <$> smBinding smExpr

smStatAssign :: SMParserStatAtom
smStatAssign smStat = try do
  h <- matchId
  ts <- many $ do
    match $ SYM "."
    matchId
  args <- many matchId
  match $ SYM "="
  expr <- smExpr
  (do match $ KEY "where"
      body <- smBlock $ smBinding smExpr
      return $ SMStatAssign (Tuple (Tuple h ts) (mkLam args (SMExprWhere expr body)))
    ) <|> (return $ SMStatAssign (Tuple (Tuple h ts) (mkLam args expr)))
  where mkLam = flip $ foldr (\l r-> SMExprLam l r)

smStatIfElse :: SMParserStatAtom
smStatIfElse smStat = do
  match $ KEY "if"
  condition <- smExpr
  stats1 <- smBlock smStat
  (do match $ KEY "else"
      stats2 <- smBlock smStat
      return $ SMStatIfElse condition stats1 stats2
    ) <|> return (SMStatIfElse condition stats1 [])

smStatWhile :: SMParserStatAtom
smStatWhile smStat = do
  match $ KEY "while"
  condition <- smExpr
  stats <- smBlock smStat
  return (SMStatWhile condition stats)

smStatSwitch :: SMParserStatAtom
smStatSwitch smStat = do
  match $ KEY "switch"
  condition <- smExpr
  match $ KEY "of"
  body <- smBlock caseBody
  return $ SMStatSwitch condition body
  where caseBody = do
          value <- smExprLit smExpr
          match $ SYM "->"
          stats <- smBlock smStat
          return $ Tuple value stats

smStatBreak :: SMParserStatAtom
smStatBreak smStat = match (KEY "break") *> return SMStatBreak

smStatContinue :: SMParserStatAtom
smStatContinue smStat = match (KEY "break") *> return SMStatContinue

smStatPass :: SMParserStatAtom
smStatPass smStat = match (KEY "break") *> return SMStatPass

smStatReturn :: SMParserStatAtom
smStatReturn smStat = match (KEY "return") *> (SMStatReturn <$> smExpr)

smStatCall :: SMParserStatAtom
smStatCall smStat = SMStatCall <$> smExpr

-- Parse Module
-- smModuleStat :: SMParser SMModuleStatement
-- smModuleStat = choice []

-- smImportAs :: SMParser SMModuleStatement
-- smImportAs = do
--   match $ KEY "import"
--   path <- (\(SMExprLit str) -> str)<$> smExprLit
--   match $ KEY "as"
--   name <- matchId
--   return $ SMImportAs path name

smImport :: SMParser SMModuleStatement
smImport = do
  match $ KEY "import"
  path <- (\(SMExprLit str) -> str) <$> smExprLit smExpr
  (match (KEY "as") *> (SMImportAs path <$> matchId))
    <|> between (match $ SYM "(") (match $ SYM ")") (contents path)
  where contents path = SMImport path <$> flip (<|>) (return []) do
          a <- matchId
          as <- many (match (SYM ",") *> matchId)
          return $ [a] ++ as

  -- names <- optionMaybe $ between (match $ SYM "(") (match $ SYM ")") $ (do
  --   a <- matchId
  --   as <- many (match (SYM ",") *> matchId)
  --   return $ [a] ++ as) <|> return []
  -- match $ KEY "as"
  -- alias <- matchId
  -- return $ SMImport path names alias

smExport :: SMParser SMModuleStatement
smExport = do
  match $ KEY "export"
  names <- between (match $ SYM "(") (match $ SYM ")") $ (do
    a <- matchId
    as <- many (match (SYM ",") *> matchId)
    return $ [a] ++ as) <|> return []
  return $ SMExport names

smOperator :: SMParser SMModuleStatement
smOperator = do
  _type <- (\(KEY str) -> str) <$>
         (match (KEY "infixr")
          <|> match (KEY "infixl")
          <|> match (KEY "prefix")
          <|> match (KEY "postfix"))
  ret <- (\(SMExprLit str) -> fromString str) <$> smExprLit smExpr
  case ret of
    Nothing -> fail "Unexpected Token"
    Just precedence -> do
      op <- matchOp
      match (KEY "as")
      alias <- matchId
      pushOpDef _type precedence op alias
      return $ SMOperator precedence (SMOpDef {_type:_type, op:op, alias:alias})

smModuleBinding :: SMParser SMModuleStatement
smModuleBinding = SMBinding <$> smBinding smExpr

smModuleStat :: SMParser SMModuleStatement
smModuleStat = choice [smImport, smExport, smOperator, smModuleBinding]

smModuleEOF:: SMParser Unit
smModuleEOF = ParserT $ \(PState { input: s, position: pos }) ->
  return $ case s of
    [] -> { consumed: false, input: s, result: Right unit, position: pos }
    _  -> parseFailed s pos "Expected EOF"

smModule :: SMParser SMModule
smModule = between (match BLOCK_SEP) (match BLOCK_SEP) contents <* smModuleEOF
  where contents = SMModule <$> flip (<|>) (return []) do
          a <- smModuleStat
          match BLOCK_SEP
          as <- many (smModuleStat <* match BLOCK_SEP)
          return $ [a] ++ as

parser :: Array SMPosTok -> Either ParseError SMModule
parser toks = evalState (runParserT (PState {input: toks, position: initialPos }) smModule) (OpState {optable: prelude_optable})

  -- handle $ runRWS (runParserT (PState {input: code', position: initialPos }) analyse) unit ([]::Array Indent)
  -- where code' = "\n" ++ code ++ "\n"
  --       analyse = (nextTok >>= \tok -> input tok *> analyse)
  --                 <|> eof <|> fail "Tokenizer Error"
  --       handle (RWSResult _ (Left err) _) = Left err
  --       handle (RWSResult _ (Right _) ret) = Right ret

  -- do
  -- match BLOCK_SEP
  -- mstats <- many (smModuleStat <* match BLOCK_SEP)
  -- return $ SMModule mstats

-- smModule :: SMParser SMModule
-- smModule = do
--   match BLOCK_SEP
--   mstats <- many (smModuleStat <* match BLOCK_SEP)
--   return $ SMModule mstats

  -- match $ KEY "as"
  -- name <- matchId
  -- return $ SMImportAs path name

-- smBinding :: SMParserExpr -> SMParser (Tuple String SMExpression)
-- smBinding smExpr = do

  -- name <- matchId
  -- args <- many matchId
  -- match $ SYM "="
  -- expr <- smExpr
  -- (do match $ KEY "where"
  --     body <- smBlock $ smBinding smExpr
  --     return $ Tuple name (mkLam args (SMExprWhere expr body))
  --   ) <|> (return $ Tuple name (mkLam args expr))
  -- where mkLam = flip $ foldr (\l r-> SMExprLam l r)

          -- case value of
          --   SMExprLit _ -> 
  -- where isLitTok tok = case tok of
  --         LIT _ -> true
  --         _ -> false

-- type SMParserExpr = SMParser SMExpression
-- type SMParserExprAtom = SMParserExpr -> SMParserExpr

-- smExprArr :: 

-- smExprId :: SMParser SMExpression
-- smExprId = do
--   head <- matchId
--   attrs <- many $ match (SYM ".") *> matchId
--   return <<< SMExprID <<< joinWith "." $ [head] ++ attrs

-- matchId :: SMParser String
-- matchId = do
--   head <- when isId
--   atrs <- many (match (SYM ".") *> when isId)
--   return $ joinWith "." $ map (\(ID str)->str) ([head] ++ atrs)
--     where isId tok = case tok of
--             ID _ -> true
--             _ -> false

-- matchId :: SMParser SMToken
-- matchId = when isId
--   where isId tok = case tok of
--           ID  -> true
--           _ -> false

-- bindingP :: 

-- when :: SMToken

    -- [] -> parseFailed toks pos "Expected Token, Met EOF"
    -- _ -> case head toks of

    -- [] -> parseFailed toks pos "Expected Token, Met EOF"
    -- _ -> let x = head toks
    --          xs = tail toks
    --   { consumed: true, input: xs, result: Right hea, position: tokpos x }

    -- Cons x xs -> { consumed: true, input: xs, result: Right x, position: tokpos x }
    -- _ -> parseFailed toks pos "Expected token, met EOF"

-- token :: forall m a. (Monad m) => (a -> Position) -> ParserT (Array a) m a
-- token tokpos = ParserT $ \(PState { input: toks, position: pos }) ->
--   return $ case toks of
--     Cons x xs -> { consumed: true, input: xs, result: Right x, position: tokpos x }
--     _ -> parseFailed toks pos "expected token, met EOF"



-- getOpTable :: SMParser SMOperatorTable
-- getOpTable = do
--   optable <- lift gets $ \(SMModule {optable:: optable, exports:: _}) -> optable
--   return $ map (map handle) optable
--     where def2op (SMOpDef {_type: _type, alias: alias}) = case _type of
--             "infixr" -> 
--             "infixl" -> 
--             "prefix" -> 
--             "postfix" -> 


-- prelude_optable :: Array (Array SMOpDef)
-- prelude_optable =
--   [ [ mkOpDef "infixr" "<." "compose" ]
--   , [ mkOpDef "infixr" "^" "power" ]
--   , [ mkOpDef "infixl" "*" "mul"
--     , mkOpDef "infixl" "/" "div"
--     , mkOpDef "infixl" "%" "mod" ]
--   , [ mkOpDef "infixl" "+" "plus"
--     , mkOpDef "infixl" "-" "minus" ]
--   , []
--   , [ mkOpDef "infixl" "==" "equal"
--     , mkOpDef "infixl" "!=" "notEqual"
--     , mkOpDef "infixl" "<" "lessThan"
--     , mkOpDef "infixl" "<=" "lessThanOrEqual"
--     , mkOpDef "infixl" ">" "greaterThen"
--     , mkOpDef "infixl" ">=" "greaterThenOrEqual" ]
--   , [ mkOpDef "infixr" "&&" "and"]
--   , [ mkOpDef "infixr" "||" "or"]
--   , []
--   , [ mkOpDef "infixr" "$" "apply"] ]
--   where mkOpDef :: String -> String -> String -> SMOpDef
--         mkOpDef _type op alias = SMOpDef {_type: _type, op: op, alias: "__op_" ++ alias ++ "__"}

-- prelude_op_defines :: Array (Tuple String SMExpression)
-- prelude_op_defines =
--   [ defBinary "compose" "(c)=>a(b(c))"
--   , defBinary "power" "Math.pow(a,b)"
--   , defBinary "mul" "a*b"
--   , defBinary "div" "a/b"
--   , defBinary "mod" "a%b"
--   , defBinary "plus" "a+b"
--   , defBinary "minus" "a-b"
--   , defBinary "equal" "a===b"
--   , defBinary "notEqual" "a!==b"
--   , defBinary "lessThan" "a<b"
--   , defBinary "lessThanOrEqual" "a<=b"
--   , defBinary "greaterThen" "a>b"
--   , defBinary "greaterThenOrEqual" "a>=b"
--   , defBinary "and" "a&&b"
--   , defBinary "or" "a||b"
--   , defBinary "apply" "a(b)" ]
--   where defBinary name expr = Tuple ("__op_" ++ name ++ "_") (SMExprLitRaw $ "(a)=>(b)=>" ++ expr)

-- infixr 9  .
-- infixr 8  ^, ^^, ⋆⋆
-- infixl 7  ⋆, /, ‘quot‘, ‘rem‘, ‘div‘, ‘mod‘
-- infixl 6  +, -
-- infixr 5  :
-- infix  4  ==, /=, <, <=, >=, >
-- infixr 3  &&
-- infixr 2  ||
-- infixl 1  >>, >>=
-- infixr 1  =<<
-- infixr 0  $, $!, ‘seq‘

-- Prelude OpTable
-- infixr 9  .
-- infixr 8  ^, ^^, ⋆⋆
-- infixl 7  ⋆, /, ‘quot‘, ‘rem‘, ‘div‘, ‘mod‘
-- infixl 6  +, -
-- -- The (:) operator is built-in syntax, and cannot legally be given
-- -- a fixity declaration; but its fixity is given by:
-- --   infixr 5  :

-- infix  4  ==, /=, <, <=, >=, >
-- infixr 3  &&
-- infixr 2  ||
-- infixl 1  >>, >>=
-- infixr 1  =<<
-- infixr 0  $, $!, ‘seq‘
-- parser = unit
