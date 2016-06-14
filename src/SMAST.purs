
module SMAST(SMExpression(..), SMDoStatement(..), SMStatement(..)) where

import Prelude
import Data.Tuple (Tuple)
import Data.Maybe (Maybe)
import Data.Generic (class Generic, gShow)

data SMExpression
  = SMExprID String
  | SMExprLitNum String
  | SMExprLitStr String
  | SMExprLitReg String
  | SMExprLitRaw String
  | SMExprArr (Array SMExpression)
  | SMExprObj (Array (Tuple String SMExpression))
  | SMExprStat (Array SMStatement)
  | SMExprLam String SMExpression
  | SMExprApp SMExpression SMExpression
  | SMExprLetIn (Tuple String SMExpression) SMExpression
  | SMExprIfElse SMExpression SMExpression SMExpression
  | SMExprCaseOf SMExpression (Array (Tuple SMExpression SMExpression))
  | SMExprWithDo String (Array SMDoStatement)

derive instance genericSMExpression :: Generic SMExpression
instance showSMExpression :: Show SMExpression where show = gShow

data SMDoStatement
  = SMDoStatLet (Tuple String SMExpression)
  | SMDoStatAssign (Tuple String SMExpression)
  | SMDoStatCall SMExpression

derive instance genericSMDoStatement :: Generic SMDoStatement
instance showSMDoStatement :: Show SMDoStatement where show = gShow

data SMStatement
  = SMStatLet (Tuple String SMExpression)
  | SMStatAssign (Tuple String SMExpression)
  | SMStatCall SMExpression
  | SMStatReturn SMExpression
  | SMStatIfElse SMExpression (Array SMStatement) (Array SMStatement)
  | SMStatWhile SMExpression (Array SMStatement)
  | SMStatBreak
  | SMStatContinue
  | SMStatSwitch SMExpression (Array (Tuple SMExpression (Array SMExpression)))
  | SMStatPass

derive instance genericSMStatement :: Generic SMStatement
instance showSMStatement :: Show SMStatement where show = gShow
