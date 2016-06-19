module SMPrelude where

import Prelude

import Data.Tuple (Tuple(..))

import SMAST
-- import SMModule

prelude_optable :: Array (Array SMOpDef)
prelude_optable =
  [ [ mkOpDef "infixr" "<." "compose" ]
  , [ mkOpDef "infixr" "^" "power" ]
  , [ mkOpDef "infixl" "*" "mul"
    , mkOpDef "infixl" "/" "div"
    , mkOpDef "infixl" "%" "mod" ]
  , [ mkOpDef "infixl" "+" "plus"
    , mkOpDef "infixl" "-" "minus" ]
  , []
  , [ mkOpDef "infixl" "==" "equal"
    , mkOpDef "infixl" "!=" "notEqual"
    , mkOpDef "infixl" "<" "lessThan"
    , mkOpDef "infixl" "<=" "lessThanOrEqual"
    , mkOpDef "infixl" ">" "greaterThen"
    , mkOpDef "infixl" ">=" "greaterThenOrEqual" ]
  , [ mkOpDef "infixr" "&&" "and"]
  , [ mkOpDef "infixr" "||" "or"]
  , []
  , [ mkOpDef "infixr" "$" "apply"] ]
  where mkOpDef :: String -> String -> String -> SMOpDef
        mkOpDef _type op alias = SMOpDef {_type: _type, op: op, alias: "__op_" ++ alias ++ "__"}

prelude_op_defines :: Array (Tuple String SMExpression)
prelude_op_defines =
  [ defBinary "compose" "(c)=>a(b(c))"
  , defBinary "power" "Math.pow(a,b)"
  , defBinary "mul" "a*b"
  , defBinary "div" "a/b"
  , defBinary "mod" "a%b"
  , defBinary "plus" "a+b"
  , defBinary "minus" "a-b"
  , defBinary "equal" "a===b"
  , defBinary "notEqual" "a!==b"
  , defBinary "lessThan" "a<b"
  , defBinary "lessThanOrEqual" "a<=b"
  , defBinary "greaterThen" "a>b"
  , defBinary "greaterThenOrEqual" "a>=b"
  , defBinary "and" "a&&b"
  , defBinary "or" "a||b"
  , defBinary "apply" "a(b)" ]
  where defBinary name expr = Tuple ("__op_" ++ name ++ "_") (SMExprLit $ "(a)=>(b)=>" ++ expr)

prelude_functions :: Array (Tuple String SMExpression)
prelude_functions =
  [ def "call" "(f)=>(args)=>f.apply(this,args)"
  , def "callWith" "(_this)=>(f)=>(args)=>f.apply(_this,agrs)" ]
  where def name code = Tuple name $ SMExprLit code
