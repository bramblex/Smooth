
module SMCompiler where

import Data.Array
import Data.String (joinWith)
import Data.Tuple

import qualified Data.List as List

import Prelude
import SMAST

compileId :: String -> String
compileId str = case str of
  "_" -> "null"
  _ -> "$ID$" ++ str

compileArg :: String -> String
compileArg str = case str of
  "_" -> "$IGNORE$"
  _ -> "$ID$" ++ str

compileNative :: String -> String
compileNative str = "$NATIVE$" ++ str

bindFunc :: String
bindFunc = "$BIND$"

addPair :: String -> String -> String -> String
addPair l r s = l ++ r ++ s

mkClosure :: String -> String
mkClosure code = "(function(){" ++ code ++ "})()"

mkClosureReturn :: String -> String -> String
mkClosureReturn code ret = mkClosure $ joinWith ";" [code, "return " ++ ret]

mkCaseOf :: String -> (Array (Tuple String String)) -> String
mkCaseOf con tuples = mkClosure
                      $ "switch("++ con ++ "){" ++
                      joinWith ";" (map mkStat tuples)
                      ++ "}"
  where mkStat (Tuple value expr) = "case:" ++ value ++ "{return " ++ expr ++ "}"

mkLam :: String -> String -> String
mkLam arg code = "(("++arg++")=>"++code++")"

mkApp :: String -> String -> String
mkApp l r = l ++ "(" ++ r ++ ")"

-- mkReture :: String -> String
-- mkReture expr = "return " ++ expr

mkConst :: String -> String -> String
mkConst name expr = "const " ++ name ++ "=" ++ expr

mkLet :: String -> String -> String
mkLet name expr = "const " ++ name ++ "=" ++ expr

mkAssign :: String -> String -> String
mkAssign name expr = name ++ "=" ++ expr

mkIfElseExpr :: String -> String -> String -> String
mkIfElseExpr con expr1 expr2 = con ++ "?" ++ expr1 ++ ":" ++ expr2

mkIfElseStat :: String -> String -> String -> String
mkIfElseStat con stat1 stat2 = "if(" ++ con ++ "){" ++ stat1 ++ "}else{" ++ stat2 ++ "}"

mkWhileStat :: String -> String -> String
mkWhileStat con stat = "while(" ++ con ++ "){" ++ stat ++ "}"

class Compiled a where
  compile :: a -> String

-- data SMExpression
--   = SMExprID String
--   | SMExprAttr SMExpression String
--   | SMExprLit String
--   | SMExprArr (Array SMExpression)
--   | SMExprObj (Array (Tuple String SMExpression))
--   | SMExprStat (Array SMStatement)
--   | SMExprLam String SMExpression
--   | SMExprApp SMExpression SMExpression
--   | SMExprLetIn (Tuple String SMExpression) SMExpression
--   | SMExprWhere SMExpression (Array (Tuple String SMExpression))
--   | SMExprIfElse SMExpression SMExpression SMExpression
--   | SMExprCaseOf SMExpression (Array (Tuple SMExpression SMExpression))
--   | SMExprWithDo SMExpression (Array SMDoStatement)

instance compiledSMExpression :: Compiled SMExpression where
  compile ast = case ast of
    SMExprID id -> compileId id
    SMExprAttr expr attr -> compile expr ++ "." ++ attr
    SMExprLit str -> addPair "(" ")" str
    SMExprArr exprs -> addPair "[" "]" <<< joinWith "," <<< map compile $ exprs
    SMExprObj kvs -> addPair "{" "}" <<< joinWith ","
                     <<< map (\(Tuple k v) -> k ++ ":" ++ compile v)
                     $ kvs
    SMExprStat stats -> mkClosure <<< joinWith ";" <<< map compile $ stats
    SMExprLam arg expr -> mkLam (compileArg arg) (compile expr)
    SMExprApp left right -> compile left ++ addPair "(" ")" (compile right)
    SMExprLetIn (Tuple name expr) expr' ->
      compile $ SMExprApp (SMExprLam name expr') expr
    SMExprWhere expr bindings ->
      flip mkClosureReturn (compile expr) <<< joinWith ";"
      $ flip map bindings (\(Tuple name expr) ->
                            mkConst (compileId name) (compile expr))
    SMExprIfElse con expr1 expr2 ->
      addPair "(" ")"
      $ mkIfElseExpr (compile con) (compile expr1) (compile expr2)
    SMExprCaseOf con body ->
      mkCaseOf (compile con)
      $ map (\(Tuple v e)->Tuple (compile v) (compile e)) body
    SMExprWithDo expr doStats ->
      mkApp (mkLam bindFunc (compile $ cpsTrans bindFunc doStats)) (compile expr)

-- data SMDoStatement
--   = SMDoStatLet (Tuple String SMExpression)
--   | SMDoStatAssign (Tuple String SMExpression)
--   | SMDoStatCall SMExpression

cpsTrans :: String -> Array SMDoStatement -> SMExpression
cpsTrans bindF doStats = cpsTrans' bindF $ List.fromFoldable doStats
  where cpsTrans' bindF doStats = case doStats of
          List.Cons doStat List.Nil -> case doStat of
            SMDoStatCall expr -> expr
          List.Cons doStat doStats' -> case doStat of
            SMDoStatLet binding ->
              SMExprLetIn binding (cpsTrans' bindF doStats')
            SMDoStatCall expr ->
              SMExprApp (SMExprApp (SMExprLit bindF) expr) (SMExprLam "_" (cpsTrans' bindF doStats'))
            SMDoStatAssign (Tuple name expr) ->
              SMExprApp (SMExprApp (SMExprLit bindF) expr) (SMExprLam name (cpsTrans' bindF doStats'))

-- data SMStatement
--   = SMStatLet (Tuple String SMExpression)
--   | SMStatAssign (Tuple (Tuple String (Array String)) SMExpression)
--   | SMStatCall SMExpression
--   | SMStatReturn SMExpression
--   | SMStatIfElse SMExpression (Array SMStatement) (Array SMStatement)
--   | SMStatWhile SMExpression (Array SMStatement)
--   | SMStatBreak
--   | SMStatContinue
--   | SMStatSwitch SMExpression (Array (Tuple SMExpression (Array SMStatement)))
--   | SMStatPass

instance compiledSMStatement :: Compiled SMStatement where
  compile stat = case stat of
    SMStatLet (Tuple name expr) -> mkLet name (compile expr)
    SMStatAssign (Tuple (Tuple id attrs) expr) -> mkAssign (joinWith "." $ [compileId id] ++ attrs) (compile expr)
    SMStatCall expr -> compile expr
    SMStatReturn expr -> "return " ++ compile expr
    SMStatIfElse con stats1 stats2 ->
      mkIfElseStat (compile con) (compileStats stats1) (compileStats stats2)
    SMStatWhile con stats -> mkWhileStat (compile con) (compileStats stats)
    SMStatBreak -> "break"
    SMStatContinue -> "continue"
    SMStatPass -> "void(0)"
    SMStatSwitch con body ->
      "switch(" ++ compile con ++ "){"
      ++ joinWith ";" (map (\(Tuple value stats) -> "case:" ++ (compile value) ++ "{"++ (compileStats stats) ++ "}") body)
      ++ "}"
      where compileStats = joinWith ";" <<< map compile

-- newtype SMOpDef = SMOpDef {_type::String, op::String, alias::String}

-- data SMModuleStatement
--   = SMImport String (Array String)
--   | SMImportAs String String
--   | SMExport (Array String)
--   | SMOperator Int SMOpDef
--   | SMBinding (Tuple String SMExpression)

instance compiledSMModuleStatement :: Compiled SMModuleStatement where
  compile mstat = case mstat of
    SMImport path names -> joinWith ";" $ map (\name -> mkConst (compileId name) ("require(" ++ path ++ ")[" ++ show name ++ "]")) names
    SMImportAs path name -> mkConst (compileId name) ("require(" ++ path ++ ")")
    SMExport (names) -> joinWith ";" $ map (\name -> "exports." ++ name ++ "=" ++ compileId name) names
    SMOperator _ _ -> ""
    SMBinding (Tuple name expr) -> mkConst (compileId name) (compile expr)

-- newtype SMModule = SMModule (Array SMModuleStatement)

instance compiledSMModule :: Compiled SMModule where
  compile (SMModule mstats) = joinWith ";" <<< map compile $ imports ++ bindings ++ exports
    where imports = flip filter mstats $ \mstat -> case mstat of
            SMImportAs _ _ -> true
            SMImport _ _ -> true
            _ -> false
          bindings = flip filter mstats $ \mstat -> case mstat of
            SMBinding _ -> true
            _ -> false
          exports = flip filter mstats $ \mstat -> case mstat of
            SMExport _ -> true
            _ -> false
